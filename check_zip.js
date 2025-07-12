const fs = require("fs");
const { execSync } = require("child_process");

console.log("🔍 Checking icon.zip file...\n");

// Check if icon.zip exists and get basic info
if (!fs.existsSync("icon.zip")) {
  console.log("❌ icon.zip file not found!");
  process.exit(1);
}

const stats = fs.statSync("icon.zip");
console.log(`📦 icon.zip file found`);
console.log(
  `📊 Size: ${(stats.size / 1024).toFixed(2)} KB (${stats.size} bytes)`,
);
console.log(`📅 Modified: ${stats.mtime.toISOString()}`);

// Try to get zip file contents using system commands
console.log("\n📋 Attempting to list zip contents...");

try {
  // Try unzip -l to list contents
  const contents = execSync("unzip -l icon.zip", { encoding: "utf8" });
  console.log("✅ Successfully listed zip contents:\n");
  console.log(contents);
} catch (error) {
  console.log("⚠️  System unzip not available, trying alternative...");

  try {
    // Try zipinfo if available
    const contents = execSync("zipinfo icon.zip", { encoding: "utf8" });
    console.log("✅ Successfully listed zip contents with zipinfo:\n");
    console.log(contents);
  } catch (error2) {
    console.log("⚠️  zipinfo also not available");
    console.log("📝 Manual extraction required:");
    console.log("   1. Extract icon.zip using your file manager");
    console.log("   2. Place extracted files in public/ directory");
    console.log("   3. Update HTML favicon meta tags");
  }
}

console.log("\n🎯 What to expect after extraction:");
console.log("Standard favicon package typically contains:");
console.log("• favicon.ico (legacy browser support)");
console.log("• favicon-16x16.png, favicon-32x32.png (standard favicons)");
console.log("• apple-touch-icon-*.png (iOS homescreen icons)");
console.log("• android-chrome-*.png (Android homescreen icons)");
console.log("• mstile-*.png (Windows tile icons)");
console.log("• site.webmanifest or manifest.json (PWA manifest)");

console.log("\n📝 Next steps:");
console.log(
  "1. Extract the zip file manually or using: unzip icon.zip -d temp/",
);
console.log("2. Move icon files to public/ directory");
console.log("3. Update index.html with proper favicon meta tags");
