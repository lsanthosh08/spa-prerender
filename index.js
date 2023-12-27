#!/usr/bin/env node

import fs from "fs/promises";
import puppeteer from "puppeteer";
import express from "express";
import path from "path";

const currentWorkDir = process.cwd();

let config, buildDir, port, host, server;

const app = express();

async function ensureBuildDir() {
  const stats = await fs.stat(buildDir);
  if (!stats.isDirectory()) {
    throw new Error("The 'build' directory is not a valid directory.");
  }
}

async function launchServer() {
  app.use(express.static(buildDir));

  const indexPath = path.join(buildDir, "index.html");

  // Always serve 'index.html' for any route
  app.get("*", (_, res) => {
    fs.readFile(indexPath, "utf8")
      .then((content) => {
        res.send(content);
      })
      .catch((err) => {
        console.error("Error reading 'index.html':", err);
        res.status(500).send("Internal Server Error");
      });
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
    const allowedHost = [host];

    if (Array.isArray(config?.allowedHost)) {
      allowedHost.concat(config?.allowedHost);
    } else if (typeof config?.allowedHost === "string") {
      allowedHost.push(config?.allowedHost);
    }

    if (
      !(
        Array.isArray(config?.blockedResourceType)
          ? config?.blockedResourceType
          : ["image"]
      ).includes(reqResourceType) &&
      (!config?.allowedHost || config?.allowedHost?.includes("*")
        ? true
        : allowedHost?.some((host) => host && reqUrl.startsWith(host)))
    ) {
      req.continue();
    } else {
      req.abort("aborted");
    }
  });

  for (const url of urls) {
    console.log(`Rendering ${url}...`);

    await page.goto(`http://localhost:${port}/${url}`, {
      waitUntil: "networkidle0",
    });

    const htmlContent = await page.content();

    const fileName = url ? `${url}.html` : "index.html";
    const filePath = path.join(buildDir, fileName);

    try {
      await fs.writeFile(filePath, htmlContent);
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
      await fs.readFile(path.join(currentWorkDir, "package.json"), "utf8")
    )?.spr_config;

    buildDir = path.join(currentWorkDir, config?.buildDir || "build");

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
  if (server) server.close();
  else process.exit(0);
}

// Run the application
run();
