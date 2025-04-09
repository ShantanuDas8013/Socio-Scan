// Enhanced script to prepare the app for Railway deployment
const fs = require("fs");
const path = require("path");

// Ensure the dist directory exists
const distDir = path.join(__dirname, "..", "dist");
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Create a runtime-config.js file with Firebase credentials
const firebaseConfig = {
  apiKey: "AIzaSyD2mvq7WrWu4u0TPk3g2bqPM3vVx6WZcWM",
  authDomain: "socio-scan.firebaseapp.com",
  projectId: "socio-scan",
  storageBucket: "socio-scan.appspot.com",
  messagingSenderId: "591183114585",
  appId: "1:591183114585:web:b42c116a8c8ccc2d925c48",
  measurementId: "G-GWFYWKPNEV",
};

const runtimeConfigContent = `
// This file is auto-generated during the build process
window.FIREBASE_CONFIG = ${JSON.stringify(firebaseConfig, null, 2)};
console.log("Runtime config loaded");
`;

// Write the runtime config file
fs.writeFileSync(path.join(distDir, "runtime-config.js"), runtimeConfigContent);
console.log("Runtime config file created for deployment");

// Copy the existing config file too
const configSrc = path.join(__dirname, "..", "public", "config.js");
if (fs.existsSync(configSrc)) {
  const configDest = path.join(distDir, "config.js");
  fs.copyFileSync(configSrc, configDest);
  console.log("Config file copied to dist folder for deployment");
}

// Update index.html to include the runtime-config.js script
const indexPath = path.join(distDir, "index.html");
if (fs.existsSync(indexPath)) {
  let indexContent = fs.readFileSync(indexPath, "utf8");

  // Add the runtime-config script right before the closing head tag
  if (!indexContent.includes("runtime-config.js")) {
    indexContent = indexContent.replace(
      "</head>",
      `  <script src="/runtime-config.js"></script>\n</head>`
    );
    fs.writeFileSync(indexPath, indexContent);
    console.log("Added runtime config script to index.html");
  }
}

console.log("Railway deployment preparation complete");
