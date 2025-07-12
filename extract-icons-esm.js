import JSZip from "jszip";
import fs from "fs";
import path from "path";

async function extractIcons() {
  console.log("🔧 EXTRACTING ICONS FROM icon.zip");
  console.log("==================================\n");

  try {
    // Check if icon.zip exists
    if (!fs.existsSync("icon.zip")) {
      console.log("❌ icon.zip file not found!");
      return;
    }

    const zipStats = fs.statSync("icon.zip");
    console.log(
      `✅ Found icon.zip (${(zipStats.size / 1024).toFixed(2)} KB)\n`,
    );

    // Read zip file
    const zipData = fs.readFileSync("icon.zip");
    const zip = new JSZip();
    const zipContents = await zip.loadAsync(zipData);

    console.log("📦 1. CONTENTS OF icon.zip FILE:");
    console.log("================================");

    const fileList = [];

    // List all files in zip
    for (const [fileName, file] of Object.entries(zipContents.files)) {
      if (!file.dir) {
        const sizeKB = (file._data.uncompressedSize / 1024).toFixed(2);
        console.log(`📄 ${fileName} (${sizeKB} KB)`);
        fileList.push({ fileName, file, sizeKB });
      }
    }

    console.log(`\n📊 Total files in zip: ${fileList.length}\n`);

    console.log("📁 2. EXTRACTED FILES WITH SIZES:");
    console.log("==================================");

    const extractedFiles = [];

    // Ensure public directory exists
    if (!fs.existsSync("public")) {
      fs.mkdirSync("public");
      console.log("✅ Created public/ directory");
    }

    // Extract each file
    for (const { fileName, file, sizeKB } of fileList) {
      try {
        const fileData = await file.async("nodebuffer");
        const outputPath = path.join("public", path.basename(fileName));
        const baseName = path.basename(fileName);

        // Skip favicon.svg if it already exists to preserve existing one
        if (baseName === "favicon.svg" && fs.existsSync(outputPath)) {
          console.log(
            `⚠️  Skipped ${baseName} (${sizeKB} KB) - preserving existing`,
          );
        } else {
          fs.writeFileSync(outputPath, fileData);
          console.log(`✅ Extracted ${baseName} (${sizeKB} KB)`);

          extractedFiles.push({
            original: fileName,
            saved: outputPath,
            basename: baseName,
            size: file._data.uncompressedSize,
            sizeKB: sizeKB,
          });
        }
      } catch (error) {
        console.log(`❌ Failed to extract ${fileName}: ${error.message}`);
      }
    }

    console.log(
      `\n📊 Successfully extracted: ${extractedFiles.length} files\n`,
    );

    console.log("🎯 3. ANALYSIS OF EACH ICON TYPE AND PURPOSE:");
    console.log("==============================================");

    extractedFiles.forEach((file) => {
      const name = file.basename.toLowerCase();
      let purpose = "";
      let deviceSupport = "";

      if (name === "favicon.ico") {
        purpose = "Legacy favicon (contains 16x16, 32x32)";
        deviceSupport = "Internet Explorer, older browsers";
      } else if (name.includes("favicon-16x16")) {
        purpose = "Standard favicon 16x16";
        deviceSupport = "Browser tabs, bookmarks";
      } else if (name.includes("favicon-32x32")) {
        purpose = "Standard favicon 32x32";
        deviceSupport = "Desktop browsers, high-DPI";
      } else if (name.includes("favicon-48x48")) {
        purpose = "High-DPI favicon 48x48";
        deviceSupport = "Retina displays";
      } else if (name.includes("apple-touch-icon-120x120")) {
        purpose = "Apple Touch Icon 120x120";
        deviceSupport = "iPhone homescreen (iOS 7+)";
      } else if (name.includes("apple-touch-icon-144x144")) {
        purpose = "Apple Touch Icon 144x144";
        deviceSupport = "iPad homescreen";
      } else if (name.includes("apple-touch-icon-152x152")) {
        purpose = "Apple Touch Icon 152x152";
        deviceSupport = "iPad Retina homescreen";
      } else if (name.includes("apple-touch-icon-180x180")) {
        purpose = "Apple Touch Icon 180x180";
        deviceSupport = "iPhone 6+ and newer homescreen";
      } else if (name.includes("apple-touch-icon")) {
        purpose = "Apple Touch Icon (generic)";
        deviceSupport = "iOS homescreen shortcut";
      } else if (name.includes("android-chrome-192x192")) {
        purpose = "Android Chrome icon 192x192";
        deviceSupport = "Android homescreen, PWA minimum";
      } else if (name.includes("android-chrome-512x512")) {
        purpose = "Android Chrome icon 512x512";
        deviceSupport = "High-res Android, PWA splash";
      } else if (name.includes("mstile-144x144")) {
        purpose = "Windows tile 144x144";
        deviceSupport = "Windows 8.1/10 medium tile";
      } else if (name.includes("mstile-270x270")) {
        purpose = "Windows tile 270x270";
        deviceSupport = "Windows 10/11 large tile";
      } else if (name.includes("mstile")) {
        purpose = "Windows tile icon";
        deviceSupport = "Windows Start menu tiles";
      } else if (name.includes("webmanifest")) {
        purpose = "PWA Web App Manifest";
        deviceSupport = "Progressive Web App config";
      } else if (name.includes("manifest.json")) {
        purpose = "PWA Manifest JSON";
        deviceSupport = "Progressive Web App config";
      } else if (name.includes("browserconfig.xml")) {
        purpose = "Windows browser configuration";
        deviceSupport = "Windows tile settings";
      } else {
        purpose = "Icon file";
        deviceSupport = "General purpose";
      }

      console.log(`🔸 ${file.basename} (${file.sizeKB} KB)`);
      console.log(`   📋 Purpose: ${purpose}`);
      console.log(`   📱 Device Support: ${deviceSupport}`);
      console.log("");
    });

    return extractedFiles;
  } catch (error) {
    console.error("❌ Extraction failed:", error.message);
    throw error;
  }
}

// Show current public directory contents
async function showPublicDirectory() {
  console.log("📂 4. ICON FILES NOW IN PUBLIC/ DIRECTORY:");
  console.log("==========================================");

  try {
    const publicFiles = fs.readdirSync("public");
    const iconExtensions = [
      ".png",
      ".ico",
      ".svg",
      ".webmanifest",
      ".json",
      ".xml",
    ];
    const iconFiles = publicFiles.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return iconExtensions.includes(ext);
    });

    if (iconFiles.length === 0) {
      console.log("❌ No icon files found in public/ directory");
      return;
    }

    console.log("Complete listing of icon/config files:");
    console.log("--------------------------------------");

    iconFiles.sort().forEach((file) => {
      const filePath = path.join("public", file);
      const stats = fs.statSync(filePath);
      const size = (stats.size / 1024).toFixed(2);
      const ext = path.extname(file).toLowerCase();

      let type = "";
      if (ext === ".png") type = "PNG Image";
      else if (ext === ".ico") type = "ICO Icon";
      else if (ext === ".svg") type = "SVG Vector";
      else if (ext === ".webmanifest") type = "Web Manifest";
      else if (ext === ".json") type = "JSON Config";
      else if (ext === ".xml") type = "XML Config";

      console.log(`📄 ${file} - ${size} KB (${type})`);
    });

    console.log(`\n📊 Total icon/config files: ${iconFiles.length}`);

    // Generate HTML meta tags
    console.log("\n📝 5. GENERATED HTML META TAGS:");
    console.log("===============================");
    console.log("Replace lines 63-66 in index.html with these tags:\n");

    const htmlTags = [];

    // Standard favicon
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

    // Standard PNG favicons
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
        "apple-touch-icon.png",
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

    if (htmlTags.length > 0) {
      htmlTags.forEach((tag) => console.log(tag));
    } else {
      console.log("⚠️  No standard favicon files found for HTML generation");
    }

    console.log("\n✅ ICON EXTRACTION AND ANALYSIS COMPLETE!");
    console.log("==========================================");
    console.log("📊 Final Summary:");
    console.log(`   • Total icon/config files in public/: ${iconFiles.length}`);
    console.log(`   • Public directory: ${path.resolve("public")}/`);
    console.log("");
    console.log("🔄 Next Steps:");
    console.log("   1. ✅ Icons extracted to public/ directory");
    console.log("   2. 📝 Update index.html with HTML meta tags above");
    console.log("   3. 🔄 Remove external favicon URLs (lines 63-66)");
    console.log("   4. 🧪 Test favicon display in different browsers");
  } catch (error) {
    console.error("❌ Error reading public directory:", error.message);
  }
}

// Run extraction and analysis
extractIcons()
  .then(async (extractedFiles) => {
    await showPublicDirectory();
  })
  .catch(console.error);
