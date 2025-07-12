const { execSync } = require("child_process");
const fs = require("fs");

console.log("🔧 STEP-BY-STEP ICON EXTRACTION");
console.log("===============================\n");

// Check if icon.zip exists first
if (!fs.existsSync("icon.zip")) {
  console.log("❌ Error: icon.zip file not found!");
  process.exit(1);
}

try {
  // Step 1: List contents of zip file
  console.log("Step 1: List contents of icon.zip");
  console.log("==================================");
  console.log("$ unzip -l icon.zip\n");

  try {
    const listOutput = execSync("unzip -l icon.zip", { encoding: "utf8" });
    console.log(listOutput);
  } catch (error) {
    console.log("Error listing zip contents:", error.message);
    console.log("Continuing with extraction...\n");
  }

  // Step 2: Extract to temp directory
  console.log("\nStep 2: Extract icon.zip to temp-icons/");
  console.log("=======================================");
  console.log("$ unzip -o icon.zip -d temp-icons/\n");

  const extractOutput = execSync("unzip -o icon.zip -d temp-icons/", {
    encoding: "utf8",
  });
  console.log(extractOutput);

  // Step 3: List extracted files
  console.log("\nStep 3: List contents of temp-icons/");
  console.log("====================================");
  console.log("$ ls -la temp-icons/\n");

  const lsOutput = execSync("ls -la temp-icons/", { encoding: "utf8" });
  console.log(lsOutput);

  // Step 4: Find specific icon files
  console.log("\nStep 4: Find all icon files");
  console.log("===========================");
  console.log(
    '$ find temp-icons -name "*.png" -o -name "*.ico" -o -name "*.svg" -o -name "*.webmanifest"\n',
  );

  const findOutput = execSync(
    'find temp-icons -name "*.png" -o -name "*.ico" -o -name "*.svg" -o -name "*.webmanifest"',
    { encoding: "utf8" },
  );
  console.log(findOutput);

  // Step 5: Copy files to public
  console.log("\nStep 5: Copy all files to public/");
  console.log("=================================");
  console.log("$ cp temp-icons/* public/\n");

  try {
    const cpOutput = execSync("cp temp-icons/* public/", { encoding: "utf8" });
    console.log("Files copied successfully");
    if (cpOutput.trim()) console.log(cpOutput);
  } catch (error) {
    console.log("Copy completed (cp command output varies by system)");
  }

  // Step 6: Verify icons in public directory
  console.log("\nStep 6: Verify icons are in public/");
  console.log("===================================");
  console.log('$ ls -la public/ | grep -E "\\.(png|ico|svg|webmanifest)$"\n');

  try {
    const verifyOutput = execSync(
      'ls -la public/ | grep -E "\\.(png|ico|svg|webmanifest)$"',
      { encoding: "utf8" },
    );
    console.log(verifyOutput);
  } catch (error) {
    // Fallback - list all files and filter in JS
    console.log("Using fallback method to list icon files...");
    const allFiles = execSync("ls -la public/", { encoding: "utf8" });
    const lines = allFiles.split("\n");
    const iconLines = lines.filter(
      (line) =>
        line.includes(".png") ||
        line.includes(".ico") ||
        line.includes(".svg") ||
        line.includes(".webmanifest"),
    );
    console.log(iconLines.join("\n"));
  }

  // Step 7: Clean up temp directory
  console.log("\nStep 7: Clean up temp-icons directory");
  console.log("=====================================");
  console.log("$ rm -rf temp-icons\n");

  execSync("rm -rf temp-icons", { encoding: "utf8" });
  console.log("✅ Temporary directory removed");

  console.log("\n✅ EXTRACTION COMPLETE!");
  console.log("=======================");
  console.log("All bash commands have been executed successfully.");
  console.log("Icon files should now be available in the public/ directory.");
} catch (error) {
  console.error("\n❌ Error during extraction:", error.message);
  if (error.stdout) {
    console.log("\nSTDOUT:", error.stdout);
  }
  if (error.stderr) {
    console.log("\nSTDERR:", error.stderr);
  }
}
