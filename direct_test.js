const { spawn } = require("child_process");
const fs = require("fs");

console.log("🔧 DIRECT BASH COMMAND EXECUTION");
console.log("=================================\n");

// Check if icon.zip exists
if (!fs.existsSync("icon.zip")) {
  console.log("❌ icon.zip file not found!");
  process.exit(1);
}

console.log("✅ icon.zip file found");
const stats = fs.statSync("icon.zip");
console.log(`📊 Size: ${(stats.size / 1024).toFixed(2)} KB\n`);

// Execute commands sequentially
async function executeCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    console.log(`$ ${command} ${args.join(" ")}`);

    const proc = spawn(command, args, {
      stdio: ["inherit", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (stdout) console.log(stdout);
      if (stderr && code !== 0) console.error("Error:", stderr);

      if (code === 0) {
        resolve({ stdout, stderr, code });
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      }
    });

    proc.on("error", (error) => {
      reject(error);
    });
  });
}

async function runExtraction() {
  try {
    // Step 1: List zip contents
    console.log("Step 1: List contents of icon.zip");
    console.log("==================================");
    try {
      await executeCommand("unzip", ["-l", "icon.zip"]);
    } catch (error) {
      console.log("⚠️  unzip -l failed, continuing...");
    }
    console.log("\n");

    // Step 2: Extract zip
    console.log("Step 2: Extract icon.zip to temp-icons/");
    console.log("=======================================");
    await executeCommand("unzip", ["-o", "icon.zip", "-d", "temp-icons/"]);
    console.log("\n");

    // Step 3: List extracted files
    console.log("Step 3: List contents of temp-icons/");
    console.log("====================================");
    await executeCommand("ls", ["-la", "temp-icons/"]);
    console.log("\n");

    // Step 4: Find icon files
    console.log("Step 4: Find all icon files");
    console.log("===========================");
    await executeCommand("find", [
      "temp-icons",
      "-name",
      "*.png",
      "-o",
      "-name",
      "*.ico",
      "-o",
      "-name",
      "*.svg",
      "-o",
      "-name",
      "*.webmanifest",
    ]);
    console.log("\n");

    // Step 5: Copy files
    console.log("Step 5: Copy all files to public/");
    console.log("=================================");
    try {
      await executeCommand("cp", ["temp-icons/*", "public/"]);
    } catch (error) {
      // Try alternative copy method
      console.log("⚠️  Standard cp failed, trying alternative...");
      await executeCommand("bash", ["-c", "cp temp-icons/* public/"]);
    }
    console.log("\n");

    // Step 6: Verify files in public
    console.log("Step 6: Verify icons are in public/");
    console.log("===================================");
    try {
      await executeCommand("ls", ["-la", "public/"]);
    } catch (error) {
      console.log("Error listing public directory:", error.message);
    }
    console.log("\n");

    // Step 7: Clean up
    console.log("Step 7: Clean up temp-icons directory");
    console.log("=====================================");
    await executeCommand("rm", ["-rf", "temp-icons"]);
    console.log("✅ Cleanup complete\n");

    console.log("✅ EXTRACTION COMPLETE!");
    console.log("=======================");
  } catch (error) {
    console.error("❌ Extraction failed:", error.message);
  }
}

runExtraction();
