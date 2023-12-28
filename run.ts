#!/usr/bin/env node

import { createConfigJson, run } from "./index";
const arg = process.argv[2];

if (!arg) {
  console.error(
    "No arg passed use -init to create config file or -run to start pre-render"
  );
  process.exit(0);
}

// Run the application
if (arg === "-run") run();

// create config json the project root directory
if (arg === "-init") createConfigJson();
