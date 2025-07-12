// Quick check of icon.zip contents
const fs = require("fs");

console.log("🔍 QUICK ICON.ZIP ANALYSIS");
console.log("==========================\n");

if (!fs.existsSync("icon.zip")) {
  console.log("❌ icon.zip not found!");
  process.exit(1);
}

const stats = fs.statSync("icon.zip");
console.log(`✅ icon.zip found: ${(stats.size / 1024).toFixed(2)} KB`);
console.log(`📅 Modified: ${stats.mtime.toLocaleDateString()}`);

// Try to read as binary and look for PNG/ICO signatures
const buffer = fs.readFileSync("icon.zip");
console.log(`📊 Total bytes: ${buffer.length}`);

// Look for file signatures
const pngCount = (buffer.toString("binary").match(/PNG/g) || []).length;
const icoCount = (buffer.toString("binary").match(/ICO/g) || []).length;

console.log(`🔍 Estimated PNG files: ${pngCount}`);
console.log(`🔍 Estimated ICO files: ${icoCount}`);

console.log("\n📝 Ready to extract with: node extract-icons-esm.js");
console.log("or run: node extract-icons-cjs.js (CommonJS version)");

// Show what you'll get
console.log("\n📦 Expected files after extraction:");
console.log("Based on standard favicon packages, you should get:");
console.log("• favicon.ico - Legacy browser support");
console.log("• favicon-16x16.png - Browser tabs");
console.log("• favicon-32x32.png - Desktop browsers");
console.log("• apple-touch-icon-*.png - iOS homescreen icons");
console.log("• android-chrome-*.png - Android homescreen icons");
console.log("• mstile-*.png - Windows tile icons");
console.log("• site.webmanifest - PWA manifest");
