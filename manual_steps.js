// Manual extraction steps using Node.js
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🔍 MANUAL ICON EXTRACTION STEPS");
console.log("===============================\n");

// Step 1: Check if icon.zip exists
console.log("📦 Step 1: Checking icon.zip...");
if (!fs.existsSync("icon.zip")) {
  console.log("❌ icon.zip file not found!");
  process.exit(1);
}

const zipSize = fs.statSync("icon.zip").size;
console.log(`✅ Found icon.zip (${(zipSize / 1024).toFixed(2)} KB)\n`);

// Step 2: Create temp directory
console.log("📁 Step 2: Creating temporary directory...");
try {
  if (!fs.existsSync("temp-icons")) {
    fs.mkdirSync("temp-icons");
  }
  console.log("✅ Created temp-icons/ directory\n");
} catch (error) {
  console.log(`❌ Failed to create directory: ${error.message}`);
  process.exit(1);
}

// Step 3: Try extraction
console.log("📦 Step 3: Attempting extraction...");
try {
  // Try using system unzip command
  const result = execSync("unzip -o icon.zip -d temp-icons/", {
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
  console.log("✅ Successfully extracted using unzip command");
  if (result.trim()) {
    console.log("Extraction output:", result.trim());
  }
} catch (error) {
  console.log("⚠️  System unzip command failed");
  console.log("Please manually extract icon.zip into temp-icons/ directory");
  console.log("Then run this script again to continue with the analysis\n");

  // Check if there are any files already extracted
  try {
    const tempFiles = fs.readdirSync("temp-icons");
    if (tempFiles.length === 0) {
      console.log("❌ No files found in temp-icons/");
      console.log("Manual extraction required before proceeding");
      process.exit(1);
    }
  } catch (e) {
    console.log("❌ Cannot access temp-icons/ directory");
    process.exit(1);
  }
}

console.log("");

// Step 4: List extracted files
console.log("📋 Step 4: Listing extracted files...");
console.log("EXTRACTED FILES:");
console.log("================");

let extractedFiles = [];

function listFiles(dir, prefix = "") {
  try {
    const items = fs.readdirSync(dir);
    items.forEach((item) => {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        listFiles(itemPath, prefix + item + "/");
      } else {
        const size = (stats.size / 1024).toFixed(2);
        const fullPath = prefix + item;
        extractedFiles.push({
          name: item,
          fullPath: itemPath,
          relativePath: fullPath,
          size: size + " KB",
          bytes: stats.size,
        });
        console.log(`📄 ${fullPath} - ${size} KB`);
      }
    });
  } catch (error) {
    console.log(`❌ Error reading directory ${dir}: ${error.message}`);
  }
}

listFiles("temp-icons");

if (extractedFiles.length === 0) {
  console.log("❌ No files found in extracted directory");
  process.exit(1);
}

console.log(`\n📊 Total files extracted: ${extractedFiles.length}\n`);

// Step 5: Identify icon files
console.log("🎨 Step 5: Identifying icon files...");
const iconExtensions = [
  ".png",
  ".ico",
  ".svg",
  ".webp",
  ".gif",
  ".jpg",
  ".jpeg",
];
const configExtensions = [".webmanifest", ".json", ".xml", ".txt"];

const iconFiles = extractedFiles.filter((file) =>
  iconExtensions.includes(path.extname(file.name).toLowerCase()),
);

const configFiles = extractedFiles.filter((file) =>
  configExtensions.includes(path.extname(file.name).toLowerCase()),
);

console.log("ICON FILES IDENTIFIED:");
console.log("======================");
iconFiles.forEach((file) => {
  console.log(`🔸 ${file.name} (${file.size})`);
});

if (configFiles.length > 0) {
  console.log("\nCONFIG FILES IDENTIFIED:");
  console.log("========================");
  configFiles.forEach((file) => {
    console.log(`📄 ${file.name} (${file.size})`);
  });
}

console.log("");

// Step 6: Move files to public
console.log("📁 Step 6: Moving files to public/ directory...");

const allFiles = [...iconFiles, ...configFiles];
let movedCount = 0;
let skippedCount = 0;

allFiles.forEach((file) => {
  const targetPath = path.join("public", file.name);

  if (file.name === "favicon.svg" && fs.existsSync(targetPath)) {
    console.log(`⚠️  Skipped ${file.name} (preserving existing file)`);
    skippedCount++;
  } else {
    try {
      fs.copyFileSync(file.fullPath, targetPath);
      console.log(`✅ Moved ${file.name} to public/`);
      movedCount++;
    } catch (error) {
      console.log(`❌ Failed to move ${file.name}: ${error.message}`);
    }
  }
});

console.log(`\n📊 Files moved: ${movedCount}, skipped: ${skippedCount}\n`);

// Step 7: List final public directory contents
console.log("📂 Step 7: Final public/ directory contents...");
console.log("ICONS IN PUBLIC/ DIRECTORY:");
console.log("===========================");

try {
  const publicFiles = fs.readdirSync("public");
  const relevantFiles = publicFiles.filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return iconExtensions.includes(ext) || configExtensions.includes(ext);
  });

  relevantFiles.sort().forEach((file) => {
    const filePath = path.join("public", file);
    const stats = fs.statSync(filePath);
    const size = (stats.size / 1024).toFixed(2);
    console.log(`📄 ${file} - ${size} KB`);
  });

  console.log(
    `\n📊 Total icon/config files in public/: ${relevantFiles.length}\n`,
  );

  // Step 8: Generate HTML tags
  console.log("📝 Step 8: Generating HTML meta tags...");
  console.log("RECOMMENDED HTML FAVICON SETUP:");
  console.log("===============================");
  console.log("<!-- Replace lines 63-66 in index.html with these tags -->");

  const htmlTags = [];

  // Standard favicon checks
  if (relevantFiles.includes("favicon.ico")) {
    htmlTags.push('<link rel="icon" type="image/x-icon" href="/favicon.ico">');
  }

  if (relevantFiles.includes("favicon.svg")) {
    htmlTags.push('<link rel="icon" type="image/svg+xml" href="/favicon.svg">');
  }

  // PNG favicons
  [16, 32, 48].forEach((size) => {
    const patterns = [
      `favicon-${size}x${size}.png`,
      `icon-${size}x${size}.png`,
    ];
    for (const pattern of patterns) {
      if (relevantFiles.includes(pattern)) {
        htmlTags.push(
          `<link rel="icon" type="image/png" sizes="${size}x${size}" href="/${pattern}">`,
        );
        break;
      }
    }
  });

  // Apple Touch Icons
  [120, 144, 152, 180].forEach((size) => {
    const patterns = [
      `apple-touch-icon-${size}x${size}.png`,
      "apple-touch-icon.png",
    ];
    for (const pattern of patterns) {
      if (relevantFiles.includes(pattern)) {
        htmlTags.push(
          `<link rel="apple-touch-icon" sizes="${size}x${size}" href="/${pattern}">`,
        );
        break;
      }
    }
  });

  // Android/Chrome icons
  [192, 512].forEach((size) => {
    const patterns = [
      `android-chrome-${size}x${size}.png`,
      `icon-${size}x${size}.png`,
    ];
    for (const pattern of patterns) {
      if (relevantFiles.includes(pattern)) {
        htmlTags.push(
          `<link rel="icon" type="image/png" sizes="${size}x${size}" href="/${pattern}">`,
        );
        break;
      }
    }
  });

  // Windows tiles
  if (relevantFiles.includes("mstile-144x144.png")) {
    htmlTags.push(
      '<meta name="msapplication-TileImage" content="/mstile-144x144.png">',
    );
    htmlTags.push('<meta name="msapplication-TileColor" content="#f97316">');
  }

  // Web manifest
  if (relevantFiles.includes("site.webmanifest")) {
    htmlTags.push('<link rel="manifest" href="/site.webmanifest">');
  } else if (relevantFiles.includes("manifest.json")) {
    htmlTags.push('<link rel="manifest" href="/manifest.json">');
  }

  if (htmlTags.length > 0) {
    htmlTags.forEach((tag) => console.log(tag));
  } else {
    console.log("⚠️  No standard favicon files found for HTML generation");
  }

  console.log("");
} catch (error) {
  console.log(`❌ Error reading public directory: ${error.message}`);
}

// Step 9: Clean up
console.log("🧹 Step 9: Cleaning up temporary files...");
try {
  fs.rmSync("temp-icons", { recursive: true, force: true });
  console.log("✅ Removed temp-icons/ directory\n");
} catch (error) {
  console.log(`⚠️  Warning: Could not remove temp-icons/: ${error.message}\n`);
}

// Final summary
console.log("✅ ICON EXTRACTION COMPLETE!");
console.log("============================");
console.log("📊 Summary:");
console.log(`   • Files extracted: ${extractedFiles.length}`);
console.log(`   • Icon files moved: ${movedCount}`);
console.log(`   • Files skipped: ${skippedCount}`);
console.log(`   • Location: ${path.resolve("public")}/`);
console.log("");
console.log("🔄 Next steps:");
console.log("   1. Update index.html with the generated meta tags");
console.log("   2. Remove external favicon URLs (lines 63-66)");
console.log("   3. Test favicon display in different browsers");
console.log("   4. Verify iOS/Android app icon functionality");
