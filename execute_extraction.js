const { spawn } = require("child_process");
const fs = require("fs");

console.log("🔍 Starting icon extraction process...\n");

// Try to run the Python script
const python = spawn("python3", ["extract_icons.py"], {
  stdio: "inherit",
});

python.on("error", (error) => {
  console.log("Python3 not found, trying python...");

  const python2 = spawn("python", ["extract_icons.py"], {
    stdio: "inherit",
  });

  python2.on("error", (error2) => {
    console.log(
      "❌ Python not available. Let me try a JavaScript approach...\n",
    );
    extractWithJS();
  });

  python2.on("close", (code) => {
    if (code === 0) {
      showResults();
    }
  });
});

python.on("close", (code) => {
  if (code === 0) {
    showResults();
  }
});

function extractWithJS() {
  const { execSync } = require("child_process");
  const path = require("path");

  console.log("🔍 EXTRACTING ICON.ZIP WITH JAVASCRIPT");
  console.log("======================================\n");

  try {
    // Check if icon.zip exists
    if (!fs.existsSync("icon.zip")) {
      console.log("❌ icon.zip file not found!");
      return;
    }

    const zipStats = fs.statSync("icon.zip");
    console.log(
      `📦 Found icon.zip (${(zipStats.size / 1024).toFixed(2)} KB)\n`,
    );

    // Create temp directory
    console.log("📁 Creating temporary directory...");
    if (!fs.existsSync("temp-icons")) {
      fs.mkdirSync("temp-icons");
    }
    console.log("✅ Created temp-icons directory\n");

    // Try to extract using system unzip
    console.log("📦 Extracting icon.zip...");
    try {
      execSync("unzip -o icon.zip -d temp-icons/", { stdio: "pipe" });
      console.log("✅ Extraction completed\n");
    } catch (error) {
      console.log("❌ System unzip failed. Please extract icon.zip manually.");
      console.log('   1. Extract icon.zip to a folder called "temp-icons"');
      console.log("   2. Run this script again\n");
      return;
    }

    // List extracted files
    console.log("📋 EXTRACTED FILES:");
    console.log("===================");

    const extractedFiles = [];

    function walkDirectory(dir) {
      const files = fs.readdirSync(dir);
      files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (stats.isFile()) {
          const size = (stats.size / 1024).toFixed(2) + " KB";
          extractedFiles.push({ name: file, path: filePath, size: size });
          console.log(`📄 ${file} - ${size}`);
        }
      });
    }

    walkDirectory("temp-icons");

    // Move icon files to public
    console.log("\n📁 Moving files to public/ directory...");

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

    let movedCount = 0;

    extractedFiles.forEach((file) => {
      const ext = path.extname(file.name).toLowerCase();
      if (iconExtensions.includes(ext) || configExtensions.includes(ext)) {
        const targetPath = path.join("public", file.name);

        if (file.name === "favicon.svg" && fs.existsSync(targetPath)) {
          console.log(`⚠️  Skipped ${file.name} (preserving existing)`);
        } else {
          fs.copyFileSync(file.path, targetPath);
          console.log(`✅ Moved ${file.name} to public/`);
          movedCount++;
        }
      }
    });

    // List final public directory
    console.log("\n📂 FINAL PUBLIC/ DIRECTORY:");
    console.log("============================");

    const publicFiles = fs.readdirSync("public");
    const iconFiles = publicFiles.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return iconExtensions.includes(ext) || configExtensions.includes(ext);
    });

    iconFiles.sort().forEach((file) => {
      const filePath = path.join("public", file);
      const stats = fs.statSync(filePath);
      const size = (stats.size / 1024).toFixed(2) + " KB";
      console.log(`📄 ${file} - ${size}`);
    });

    // Generate HTML tags
    console.log("\n📝 GENERATED HTML META TAGS:");
    console.log("=============================");
    console.log(
      "<!-- Replace your current favicon section with these tags -->",
    );

    const htmlTags = [];

    if (iconFiles.includes("favicon.ico")) {
      htmlTags.push(
        '<link rel="icon" type="image/x-icon" href="/favicon.ico">',
      );
    }

    if (iconFiles.includes("favicon.svg")) {
      htmlTags.push(
        '<link rel="icon" type="image/svg+xml" href="/favicon.svg">',
      );
    }

    // Standard favicons
    [16, 32, 48].forEach((size) => {
      const patterns = [
        `favicon-${size}x${size}.png`,
        `icon-${size}x${size}.png`,
      ];
      for (const pattern of patterns) {
        if (iconFiles.includes(pattern)) {
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
        if (iconFiles.includes(pattern)) {
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
        if (iconFiles.includes(pattern)) {
          htmlTags.push(
            `<link rel="icon" type="image/png" sizes="${size}x${size}" href="/${pattern}">`,
          );
          break;
        }
      }
    });

    // Windows tiles
    if (iconFiles.includes("mstile-144x144.png")) {
      htmlTags.push(
        '<meta name="msapplication-TileImage" content="/mstile-144x144.png">',
      );
      htmlTags.push('<meta name="msapplication-TileColor" content="#f97316">');
    }

    // Web manifest
    if (iconFiles.includes("site.webmanifest")) {
      htmlTags.push('<link rel="manifest" href="/site.webmanifest">');
    } else if (iconFiles.includes("manifest.json")) {
      htmlTags.push('<link rel="manifest" href="/manifest.json">');
    }

    htmlTags.forEach((tag) => console.log(tag));

    // Clean up
    console.log("\n🧹 Cleaning up...");
    fs.rmSync("temp-icons", { recursive: true, force: true });
    console.log("✅ Temporary directory removed");

    // Summary
    console.log("\n✅ EXTRACTION COMPLETE!");
    console.log("=======================");
    console.log(`📊 Files moved to public/: ${movedCount}`);
    console.log("📝 HTML meta tags generated above");
    console.log("🧪 Next: Update your index.html with the generated meta tags");
  } catch (error) {
    console.error("❌ Error during extraction:", error.message);
  }
}

function showResults() {
  console.log("\n📄 Checking for results file...");
  if (fs.existsSync("icon_extraction_results.txt")) {
    console.log("📋 Results saved to icon_extraction_results.txt");
  }
}
