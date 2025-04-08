// Simple script to prepare the app for Railway deployment
const fs = require("fs");
const path = require("path");

// Ensure the dist directory exists
const distDir = path.join(__dirname, "..", "dist");
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy config.js to the dist folder
const configSrc = path.join(__dirname, "..", "public", "config.js");
const configDest = path.join(distDir, "config.js");

fs.copyFileSync(configSrc, configDest);
console.log("Config file copied to dist folder for deployment");
