#!/usr/bin/env node

import { stat, readFile, writeFile } from "fs/promises";
import puppeteer from "puppeteer";
import express from "express";
import { join } from "path";

const currentWorkDir = process.cwd();

let config: {
    headless: boolean;
    sourceDir: string;
    allowedHost: string[];
    port: number;
    urls: string[];
    blockedResourceType: string[];
    appHost: string;
  },
  sourceDir: string,
  port: number,
  host: string;

const app = express();

async function ensureBuildDir() {
  const stats = await stat(sourceDir);
  if (!stats.isDirectory()) {
    throw new Error("The 'build' directory is not a valid directory.");
  }
}

async function launchServer() {
  app.use(express.static(sourceDir));

  const indexPath = join(sourceDir, "index.html");
  const indexHtml = await readFile(indexPath, "utf8");
  // Always serve 'index.html' for any route
  app.get("*", (_, res) => {
    if (indexHtml) res.send(indexHtml);
    else res.status(500).send("Internal Server Error");
  });

  return app.listen(port, () => {
    console.log(`Server is running on ${host}`);
  });
}

async function prerender() {
  const urls = Array.isArray(config?.urls) ? config?.urls : [""];

  const browser = await puppeteer.launch({
    headless: config?.headless === false ? false : "new",
  });

  const page = await browser.newPage();

  await page.setRequestInterception(true);

  page.on("request", (req) => {
    const reqUrl = req.url();
    const reqResourceType = req.resourceType();
    let allowedHost = [host];

    if (Array.isArray(config?.allowedHost)) {
      allowedHost = allowedHost.concat(config?.allowedHost);
    } else if (typeof config?.allowedHost === "string") {
      allowedHost.push(config?.allowedHost);
    }
    if (
      !(
        Array.isArray(config?.blockedResourceType)
          ? config?.blockedResourceType
          : []
      ).includes(reqResourceType) &&
      (!config?.allowedHost || config?.allowedHost?.includes("*")
        ? true
        : allowedHost?.some((host) => reqUrl.startsWith(host)))
    ) {
      req.continue();
    } else {
      req.abort("aborted");
    }
  });

  for (const url of urls) {
    console.log(`Rendering ${host}/${url}...`);

    await page.goto(`${host}/${url}`, {
      waitUntil: "networkidle0",
    });

    const htmlContent = await page.content();

    const fileName = `${url.split("?")[0] || "index"}.html`;
    const filePath = join(sourceDir, fileName);

    try {
      await writeFile(filePath, htmlContent);
      console.log(`HTML content successfully written to ${filePath}`);
    } catch (err) {
      console.error("Error writing HTML file:", err);
    }
  }

  await browser.close();
}

async function run() {
  try {
    config = JSON.parse(
      await readFile(join(currentWorkDir, "package.json"), "utf8")
    )?.spr_config;

    sourceDir = join(currentWorkDir, config?.sourceDir || "build");

    port = config?.port || 4173;
    host = config?.appHost || `http://localhost:${port}`;

    await ensureBuildDir();

    if (!config?.appHost) {
      await launchServer();
    }

    await prerender();
  } catch (err) {
    console.error("Error starting server and prerendering:", err);
  }

  process.exit(0);
}

// Run the application
run();
