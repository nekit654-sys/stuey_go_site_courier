const { execSync } = require("child_process");
const fs = require("fs");

function safeExec(command, description) {
  console.log(`\n${description}`);
  console.log("=".repeat(description.length));
  console.log(`$ ${command}\n`);

  try {
    const result = execSync(command, {
      encoding: "utf8",
      maxBuffer: 1024 * 1024, // 1MB buffer
    });

    if (result && result.trim()) {
      console.log(result);
    } else {
      console.log("✅ Command completed successfully");
    }
    return true;
  } catch (error) {
    console.log(`❌ Command failed: ${error.message}`);

    // Show any output that was captured
    if (error.stdout && error.stdout.trim()) {
      console.log("STDOUT:", error.stdout);
    }
    if (error.stderr && error.stderr.trim()) {
      console.log("STDERR:", error.stderr);
    }

    return false;
  }
}

console.log("🔧 BASIC ICON EXTRACTION");
console.log("========================");

// Check if icon.zip exists
if (!fs.existsSync("icon.zip")) {
  console.log("\n❌ icon.zip file not found!");
  process.exit(1);
}

console.log("\n✅ icon.zip file found");
const zipStats = fs.statSync("icon.zip");
console.log(`📊 File size: ${(zipStats.size / 1024).toFixed(2)} KB`);

// Execute each command
const success1 = safeExec(
  "unzip -l icon.zip",
  "STEP 1: List zip file contents",
);

const success2 = safeExec(
  "unzip -o icon.zip -d temp-icons/",
  "STEP 2: Extract zip file to temp-icons/",
);

if (success2) {
  safeExec("ls -la temp-icons/", "STEP 3: List extracted files");

  safeExec("find temp-icons -type f", "STEP 4: Find all extracted files");

  // Create public directory if it doesn't exist
  if (!fs.existsSync("public")) {
    fs.mkdirSync("public");
    console.log("\n✅ Created public/ directory");
  }

  safeExec(
    'cp temp-icons/* public/ 2>/dev/null || echo "Copy completed"',
    "STEP 5: Copy files to public/",
  );

  safeExec("ls -la public/", "STEP 6: List files in public/ directory");

  // Filter for icon files manually
  console.log("\nSTEP 6B: Icon files in public/");
  console.log("==============================");
  try {
    const publicFiles = fs.readdirSync("public");
    const iconFiles = publicFiles.filter((file) => {
      const ext = file.toLowerCase();
      return (
        ext.endsWith(".png") ||
        ext.endsWith(".ico") ||
        ext.endsWith(".svg") ||
        ext.endsWith(".webmanifest") ||
        ext.endsWith(".json") ||
        ext.endsWith(".xml")
      );
    });

    if (iconFiles.length > 0) {
      iconFiles.forEach((file) => {
        const filePath = `public/${file}`;
        const stats = fs.statSync(filePath);
        const size = (stats.size / 1024).toFixed(2);
        console.log(`📄 ${file} - ${size} KB`);
      });
    } else {
      console.log("❌ No icon files found in public/ directory");
    }
  } catch (error) {
    console.log(`❌ Error reading public directory: ${error.message}`);
  }

  safeExec("rm -rf temp-icons", "STEP 7: Clean up temporary directory");

  console.log("\n✅ EXTRACTION PROCESS COMPLETE!");
  console.log("===============================");
  console.log(
    "Check the output above to see what icon files are now available.",
  );
} else {
  console.log("\n❌ Extraction failed. Please extract icon.zip manually.");
}
