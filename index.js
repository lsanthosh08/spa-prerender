#!/usr/bin/env node

import fs from "fs/promises";
import puppeteer from "puppeteer";
import express from "express";
import path from "path";


const __dirname = process.cwd();

const buildDir = path.join(__dirname, "build");
const port = 4173;

const app = express();

async function ensureBuildDir() {
  const stats = await fs.stat(buildDir);
  if (!stats.isDirectory()) {
    throw new Error("The 'build' directory is not a valid directory.");
  }
}

async function launchServer() {
  await ensureBuildDir();

  app.use(express.static(buildDir));

  // Always serve 'index.html' for any route
  app.get("*", (req, res) => {
    const indexPath = path.join(buildDir, "index.html");
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
    console.log(`Server is running on http://localhost:${port}`);
  });
}

async function prerender(urls) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const server = await launchServer();

  for (const url of urls) {
    console.log(`Rendering ${url}...`);

    await page.goto(`http://localhost:${port}/${url}`, {
      waitUntil: "networkidle2",
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
  server.close();
}

async function run() {
  try {
    await ensureBuildDir();
    await prerender(["", "contact-us"]);
  } catch (err) {
    console.error("Error starting server and prerendering:", err);
  }
}

// Run the application
run();
