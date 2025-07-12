const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function runCommand(command, description) {
  console.log(`\n${description}`);
  console.log("=".repeat(description.length));
  try {
    const output = execSync(command, { encoding: "utf8", stdio: "pipe" });
    if (output.trim()) {
      console.log(output);
    }
    return true;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return false;
  }
}

function analyzeFile(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const size = (stats.size / 1024).toFixed(2) + " KB";
    return size;
  } catch (error) {
    return "unknown";
  }
}

console.log("🔍 EXTRACTING AND ANALYZING ICON.ZIP");
console.log("=====================================");

// Step 1: Create temporary directory
console.log("\n📁 Step 1: Creating temporary directory...");
if (!fs.existsSync("temp-icons")) {
  fs.mkdirSync("temp-icons");
  console.log("✅ Created temp-icons directory");
} else {
  console.log("✅ temp-icons directory already exists");
}

// Step 2: Extract icon.zip
console.log("\n📦 Step 2: Extracting icon.zip...");
if (fs.existsSync("icon.zip")) {
  const success = runCommand(
    "unzip -o icon.zip -d temp-icons/",
    "Extracting zip file...",
  );
  if (success) {
    console.log("✅ Extraction completed successfully");
  }
} else {
  console.log("❌ icon.zip file not found!");
  process.exit(1);
}

// Step 3: List all extracted files
console.log("\n📋 Step 3: Analyzing extracted files...");
console.log("EXTRACTED FILES AND SIZES:");
console.log("==========================");

function walkDirectory(dir, basePath = "") {
  const files = [];
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relativePath = path.join(basePath, item);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        files.push(...walkDirectory(fullPath, relativePath));
      } else {
        const size = (stats.size / 1024).toFixed(2) + " KB";
        files.push({
          name: item,
          path: relativePath,
          fullPath: fullPath,
          size: size,
          bytes: stats.size,
        });
        console.log(`📄 ${item} - ${size}`);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}: ${error.message}`);
  }
  return files;
}

const extractedFiles = walkDirectory("temp-icons");

// Step 4: Identify icon files
console.log("\n🎨 Step 4: Identifying icon files...");
console.log("ICON FILES FOUND:");
console.log("=================");

const iconExtensions = [
  ".png",
  ".ico",
  ".svg",
  ".webp",
  ".gif",
  ".jpg",
  ".jpeg",
];
const iconFiles = extractedFiles.filter((file) => {
  const ext = path.extname(file.name).toLowerCase();
  return iconExtensions.includes(ext);
});

iconFiles.forEach((file) => {
  console.log(`🔸 ${file.name} (${file.size})`);
});

// Step 5: Move icon files to public directory
console.log("\n📁 Step 5: Moving files to public/ directory...");

let movedCount = 0;
iconFiles.forEach((file) => {
  const targetPath = path.join("public", file.name);
  try {
    // Don't overwrite existing favicon.svg
    if (file.name === "favicon.svg" && fs.existsSync(targetPath)) {
      console.log(`⚠️  Skipped ${file.name} (preserving existing)`);
    } else {
      fs.copyFileSync(file.fullPath, targetPath);
      console.log(`✅ Moved ${file.name} to public/`);
      movedCount++;
    }
  } catch (error) {
    console.error(`❌ Failed to move ${file.name}: ${error.message}`);
  }
});

// Step 6: Move configuration files
console.log("\n📄 Step 6: Moving configuration files...");
const configExtensions = [".webmanifest", ".json", ".xml", ".txt"];
const configFiles = extractedFiles.filter((file) => {
  const ext = path.extname(file.name).toLowerCase();
  return configExtensions.includes(ext);
});

configFiles.forEach((file) => {
  const targetPath = path.join("public", file.name);
  try {
    fs.copyFileSync(file.fullPath, targetPath);
    console.log(`✅ Moved ${file.name} to public/`);
  } catch (error) {
    console.error(`❌ Failed to move ${file.name}: ${error.message}`);
  }
});

// Step 7: Analyze final public directory
console.log("\n📂 Step 7: Final public/ directory analysis...");
console.log("ICON FILES IN PUBLIC/:");
console.log("======================");

try {
  const publicFiles = fs.readdirSync("public");
  const publicIcons = publicFiles.filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return iconExtensions.includes(ext);
  });

  publicIcons.sort().forEach((file) => {
    const filePath = path.join("public", file);
    const size = analyzeFile(filePath);
    console.log(`📄 ${file} - ${size}`);
  });
} catch (error) {
  console.error(`Error reading public directory: ${error.message}`);
}

// Step 8: Generate usage analysis
console.log("\n🎯 Step 8: Icon usage analysis...");
console.log("ICON USAGE BY SIZE AND PURPOSE:");
console.log("===============================");

const iconAnalysis = [];

// Check for specific icon types
if (fs.existsSync("public/favicon.ico")) {
  const size = analyzeFile("public/favicon.ico");
  iconAnalysis.push({
    file: "favicon.ico",
    size,
    purpose: "Legacy browser support (IE, old browsers)",
  });
}

// Check for standard favicons
const standardSizes = [16, 32, 48, 64];
standardSizes.forEach((size) => {
  const patterns = [`favicon-${size}x${size}.png`, `icon-${size}x${size}.png`];
  patterns.forEach((pattern) => {
    if (fs.existsSync(`public/${pattern}`)) {
      const fileSize = analyzeFile(`public/${pattern}`);
      iconAnalysis.push({
        file: pattern,
        size: fileSize,
        purpose: `Standard favicon ${size}x${size} - Desktop browsers`,
      });
    }
  });
});

// Check for Apple Touch Icons
const appleSizes = [120, 144, 152, 180];
appleSizes.forEach((size) => {
  const patterns = [
    `apple-touch-icon-${size}x${size}.png`,
    `apple-touch-icon.png`,
  ];
  patterns.forEach((pattern) => {
    if (fs.existsSync(`public/${pattern}`)) {
      const fileSize = analyzeFile(`public/${pattern}`);
      let device = "";
      switch (size) {
        case 120:
          device = "iPhone";
          break;
        case 144:
          device = "iPad";
          break;
        case 152:
          device = "iPad Retina";
          break;
        case 180:
          device = "iPhone 6+ and newer";
          break;
        default:
          device = "iOS device";
      }
      iconAnalysis.push({
        file: pattern,
        size: fileSize,
        purpose: `Apple Touch Icon ${size}x${size} - ${device}`,
      });
    }
  });
});

// Check for Android/Chrome icons
const androidSizes = [192, 512];
androidSizes.forEach((size) => {
  const patterns = [
    `android-chrome-${size}x${size}.png`,
    `icon-${size}x${size}.png`,
  ];
  patterns.forEach((pattern) => {
    if (fs.existsSync(`public/${pattern}`)) {
      const fileSize = analyzeFile(`public/${pattern}`);
      const purpose =
        size === 192
          ? "Android homescreen icon"
          : "High-resolution Android/PWA icon";
      iconAnalysis.push({
        file: pattern,
        size: fileSize,
        purpose: `${purpose} ${size}x${size}`,
      });
    }
  });
});

// Check for Windows tiles
const tileFiles = fs
  .readdirSync("public")
  .filter((file) => file.startsWith("mstile-"));
tileFiles.forEach((file) => {
  const fileSize = analyzeFile(`public/${file}`);
  iconAnalysis.push({
    file: file,
    size: fileSize,
    purpose: "Windows tile icon",
  });
});

iconAnalysis.forEach((icon) => {
  console.log(`🔸 ${icon.file} (${icon.size}) - ${icon.purpose}`);
});

// Step 9: Generate HTML meta tags
console.log("\n📝 Step 9: Generated HTML meta tags...");
console.log("COMPLETE HTML FAVICON SETUP:");
console.log("=============================");
console.log("<!-- Replace your current favicon section with these tags -->");

const htmlTags = [];

if (fs.existsSync("public/favicon.ico")) {
  htmlTags.push('<link rel="icon" type="image/x-icon" href="/favicon.ico">');
}

if (fs.existsSync("public/favicon.svg")) {
  htmlTags.push('<link rel="icon" type="image/svg+xml" href="/favicon.svg">');
}

// Standard PNG favicons
[16, 32, 48].forEach((size) => {
  const patterns = [`favicon-${size}x${size}.png`, `icon-${size}x${size}.png`];
  for (const pattern of patterns) {
    if (fs.existsSync(`public/${pattern}`)) {
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
    `apple-touch-icon.png`,
  ];
  for (const pattern of patterns) {
    if (fs.existsSync(`public/${pattern}`)) {
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
    if (fs.existsSync(`public/${pattern}`)) {
      htmlTags.push(
        `<link rel="icon" type="image/png" sizes="${size}x${size}" href="/${pattern}">`,
      );
      break;
    }
  }
});

// Windows tiles
if (fs.existsSync("public/mstile-144x144.png")) {
  htmlTags.push(
    '<meta name="msapplication-TileImage" content="/mstile-144x144.png">',
  );
  htmlTags.push('<meta name="msapplication-TileColor" content="#f97316">');
}

// Web manifest
if (fs.existsSync("public/site.webmanifest")) {
  htmlTags.push('<link rel="manifest" href="/site.webmanifest">');
} else if (fs.existsSync("public/manifest.json")) {
  htmlTags.push('<link rel="manifest" href="/manifest.json">');
}

htmlTags.forEach((tag) => console.log(tag));

// Step 10: Clean up
console.log("\n🧹 Step 10: Cleaning up...");
try {
  fs.rmSync("temp-icons", { recursive: true, force: true });
  console.log("✅ Temporary directory removed");
} catch (error) {
  console.error(`Warning: Could not remove temp directory: ${error.message}`);
}

// Final summary
console.log("\n✅ EXTRACTION AND ANALYSIS COMPLETE!");
console.log("====================================");
console.log(`📊 Total icon files moved: ${movedCount}`);
console.log(`📊 Total config files moved: ${configFiles.length}`);
console.log("📁 All files are now in the public/ directory");
console.log("📝 HTML meta tags generated above");
console.log(
  "🧪 Next step: Update your index.html with the generated meta tags",
);
console.log("🔄 Remove the old external favicon URLs from your HTML");
