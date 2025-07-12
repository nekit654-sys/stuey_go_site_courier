// Execute the extraction script
const { execSync } = require("child_process");

console.log("🚀 Running icon extraction script...\n");

try {
  // Try to run the ES module script
  const output = execSync("node extract-icons-esm.js", {
    encoding: "utf8",
    stdio: "inherit",
  });
  console.log("✅ Extraction script completed successfully");
} catch (error) {
  console.log("⚠️  ES module execution failed, trying alternative...");

  // Try with --experimental-modules flag
  try {
    const output2 = execSync(
      "node --experimental-modules extract-icons-esm.js",
      {
        encoding: "utf8",
        stdio: "inherit",
      },
    );
    console.log("✅ Extraction script completed with experimental modules");
  } catch (error2) {
    console.log("❌ Both execution methods failed");
    console.log("Error:", error2.message);

    // Show the script content for manual execution
    console.log("\n📝 To manually run the extraction:");
    console.log("1. Ensure JSZip is installed: npm install jszip");
    console.log("2. Run: node extract-icons-esm.js");
    console.log('3. Or check package.json type field is set to "module"');
  }
}
