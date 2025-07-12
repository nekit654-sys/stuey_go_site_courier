const { execSync } = require("child_process");

function runCommand(command, description) {
  console.log(`\n${description}`);
  console.log("=".repeat(description.length));
  console.log(`$ ${command}`);
  console.log("");

  try {
    const output = execSync(command, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    if (output.trim()) {
      console.log(output);
    } else {
      console.log("(no output)");
    }
    return true;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (error.stdout) {
      console.log("STDOUT:", error.stdout);
    }
    if (error.stderr) {
      console.log("STDERR:", error.stderr);
    }
    return false;
  }
}

console.log("🔧 EXECUTING BASH COMMANDS FOR ICON EXTRACTION");
console.log("===============================================");

// Step 1: List contents of zip file
runCommand("unzip -l icon.zip", "Step 1: List contents of icon.zip");

// Step 2: Extract to temp directory
runCommand(
  "unzip -o icon.zip -d temp-icons/",
  "Step 2: Extract icon.zip to temp-icons/",
);

// Step 3: List extracted files
runCommand("ls -la temp-icons/", "Step 3: List contents of temp-icons/");

// Step 4: Find specific icon files
runCommand(
  'find temp-icons -name "*.png" -o -name "*.ico" -o -name "*.svg" -o -name "*.webmanifest"',
  "Step 4: Find all icon files",
);

// Step 5: Copy files to public
runCommand("cp temp-icons/* public/", "Step 5: Copy all files to public/");

// Step 6: Verify icons in public directory
runCommand(
  'ls -la public/ | grep -E "\\.(png|ico|svg|webmanifest)$"',
  "Step 6: Verify icons are in public/",
);

// Step 7: Clean up temp directory
runCommand("rm -rf temp-icons", "Step 7: Clean up temp-icons directory");

console.log("\n✅ EXTRACTION COMPLETE!");
console.log("=======================");
console.log("All bash commands have been executed.");
console.log("Check the output above to see what icon files are now available.");
