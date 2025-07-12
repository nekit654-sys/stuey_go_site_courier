const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");

async function extractIconZip() {
  console.log("🔧 NODE.JS ICON EXTRACTION");
  console.log("==========================\n");

  // Step 1: Check if icon.zip exists
  if (!fs.existsSync("icon.zip")) {
    console.log("❌ icon.zip file not found!");
    return;
  }

  const zipStats = fs.statSync("icon.zip");
  console.log(`✅ Found icon.zip (${(zipStats.size / 1024).toFixed(2)} KB)\n`);

  try {
    // Step 2: Read and parse the zip file
    console.log("Step 1: Reading zip file...");
    console.log("===========================");
    const zipData = fs.readFileSync("icon.zip");
    const zip = new JSZip();
    const contents = await zip.loadAsync(zipData);

    console.log("✅ Zip file loaded successfully\n");

    // Step 3: List contents
    console.log("Step 2: Zip file contents:");
    console.log("==========================");
    const fileList = [];

    contents.forEach((relativePath, file) => {
      if (!file.dir) {
        fileList.push({
          name: path.basename(relativePath),
          path: relativePath,
          file: file,
        });
        console.log(`📄 ${relativePath}`);
      }
    });

    console.log(`\n📊 Total files in zip: ${fileList.length}\n`);

    // Step 4: Extract files to public directory
    console.log("Step 3: Extracting files to public/...");
    console.log("======================================");

    // Ensure public directory exists
    if (!fs.existsSync("public")) {
      fs.mkdirSync("public");
      console.log("✅ Created public/ directory");
    }

    let extractedCount = 0;
    let skippedCount = 0;

    for (const fileInfo of fileList) {
      const fileName = fileInfo.name;
      const outputPath = path.join("public", fileName);

      // Skip favicon.svg if it already exists
      if (fileName === "favicon.svg" && fs.existsSync(outputPath)) {
        console.log(`⚠️  Skipped ${fileName} (preserving existing)`);
        skippedCount++;
        continue;
      }

      try {
        const content = await fileInfo.file.async("nodebuffer");
        fs.writeFileSync(outputPath, content);
        const size = (content.length / 1024).toFixed(2);
        console.log(`✅ Extracted ${fileName} (${size} KB)`);
        extractedCount++;
      } catch (error) {
        console.log(`❌ Failed to extract ${fileName}: ${error.message}`);
      }
    }

    console.log(
      `\n📊 Extraction summary: ${extractedCount} extracted, ${skippedCount} skipped\n`,
    );

    // Step 5: Analyze extracted files
    console.log("Step 4: Analyzing extracted icon files...");
    console.log("=========================================");

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

    console.log("ICON FILES IN PUBLIC/:");
    console.log("=====================");

    const iconAnalysis = [];

    iconFiles.sort().forEach((file) => {
      const filePath = path.join("public", file);
      const stats = fs.statSync(filePath);
      const size = (stats.size / 1024).toFixed(2);

      // Analyze the purpose of each icon
      let purpose = "General purpose icon";
      const name = file.toLowerCase();

      if (name === "favicon.ico") {
        purpose = "Legacy browser support (IE, older browsers)";
      } else if (name === "favicon.svg") {
        purpose = "Modern scalable favicon (supports dark mode)";
      } else if (name.includes("favicon-16x16")) {
        purpose = "Standard favicon 16x16 - Browser tabs";
      } else if (name.includes("favicon-32x32")) {
        purpose = "Standard favicon 32x32 - Desktop browsers";
      } else if (name.includes("favicon-48x48")) {
        purpose = "High-DPI favicon 48x48 - Retina displays";
      } else if (name.includes("apple-touch-icon-120x120")) {
        purpose = "Apple Touch Icon 120x120 - iPhone";
      } else if (name.includes("apple-touch-icon-144x144")) {
        purpose = "Apple Touch Icon 144x144 - iPad";
      } else if (name.includes("apple-touch-icon-152x152")) {
        purpose = "Apple Touch Icon 152x152 - iPad Retina";
      } else if (name.includes("apple-touch-icon-180x180")) {
        purpose = "Apple Touch Icon 180x180 - iPhone 6+ and newer";
      } else if (name.includes("apple-touch-icon")) {
        purpose = "Apple Touch Icon - iOS homescreen";
      } else if (name.includes("android-chrome-192x192")) {
        purpose = "Android Chrome icon 192x192 - Homescreen";
      } else if (name.includes("android-chrome-512x512")) {
        purpose = "Android Chrome icon 512x512 - High-res/PWA";
      } else if (name.includes("icon-192x192")) {
        purpose = "PWA icon 192x192 - Web App Manifest";
      } else if (name.includes("icon-512x512")) {
        purpose = "PWA icon 512x512 - Web App Manifest";
      } else if (name.includes("mstile-144x144")) {
        purpose = "Windows tile 144x144 - Medium tile";
      } else if (name.includes("mstile-270x270")) {
        purpose = "Windows tile 270x270 - Large tile";
      } else if (name.includes("mstile")) {
        purpose = "Windows tile icon";
      } else if (name === "site.webmanifest") {
        purpose = "PWA Web App Manifest";
      } else if (name === "manifest.json") {
        purpose = "PWA Manifest JSON";
      } else if (name === "browserconfig.xml") {
        purpose = "Windows browser configuration";
      }

      iconAnalysis.push({ file, size, purpose });
      console.log(`📄 ${file} - ${size} KB`);
    });

    console.log(`\n📊 Total icon files: ${iconFiles.length}\n`);

    // Step 6: Display usage analysis
    console.log("Step 5: Icon usage analysis...");
    console.log("==============================");

    iconAnalysis.forEach((icon) => {
      console.log(`🔸 ${icon.file} (${icon.size} KB) - ${icon.purpose}`);
    });

    // Step 7: Generate HTML meta tags
    console.log("\n📝 Step 6: Generated HTML meta tags...");
    console.log("=====================================");
    console.log("<!-- Replace lines 63-66 in index.html with these tags -->");

    const htmlTags = [];

    // Check for each icon type
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

    console.log("\n✅ EXTRACTION AND ANALYSIS COMPLETE!");
    console.log("====================================");
    console.log(`📊 Summary:`);
    console.log(`   • Files in zip: ${fileList.length}`);
    console.log(`   • Files extracted: ${extractedCount}`);
    console.log(`   • Files skipped: ${skippedCount}`);
    console.log(`   • Icon files total: ${iconFiles.length}`);
    console.log(`   • Location: ${path.resolve("public")}/`);
    console.log("");
    console.log("🔄 Next steps:");
    console.log("   1. Update index.html with the generated meta tags above");
    console.log("   2. Remove external favicon URLs (lines 63-66)");
    console.log("   3. Test favicon display in different browsers");
    console.log("   4. Verify iOS/Android app icon functionality");

    // Save results
    const results = {
      timestamp: new Date().toISOString(),
      zipFileSize: zipStats.size,
      totalFilesInZip: fileList.length,
      filesExtracted: extractedCount,
      filesSkipped: skippedCount,
      iconFiles: iconAnalysis,
      htmlTags: htmlTags,
    };

    fs.writeFileSync(
      "extraction-results.json",
      JSON.stringify(results, null, 2),
    );
    console.log("\n📄 Detailed results saved to: extraction-results.json");
  } catch (error) {
    console.error("\n❌ Extraction failed:", error.message);
    console.log("\n📝 Manual extraction required:");
    console.log("1. Extract icon.zip using your file manager");
    console.log("2. Copy PNG, ICO, SVG files to public/ directory");
    console.log("3. Update HTML meta tags in index.html");
  }
}

// Run the extraction
extractIconZip().catch(console.error);
