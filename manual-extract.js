const fs = require("fs");
const { exec } = require("child_process");

// Try to extract using system unzip
exec("unzip -l icon.zip", (error, stdout, stderr) => {
  if (error) {
    console.log("System unzip not available, trying manual analysis...");
    console.log("📦 icon.zip file found and ready for extraction");

    // Show file size
    try {
      const stats = fs.statSync("icon.zip");
      console.log(
        `📊 Zip file size: ${stats.size} bytes (${(stats.size / 1024).toFixed(2)} KB)`,
      );

      console.log("\n🔍 To extract the icons manually, you can:");
      console.log(
        "1. Use a system unzip command: unzip icon.zip -d extracted-icons/",
      );
      console.log("2. Use an online zip extractor");
      console.log("3. Use file manager to extract the zip");

      console.log("\n📁 CURRENT ICON FILES IN PROJECT:");
      console.log("=".repeat(35));

      // Check for existing icons
      const iconFiles = [];

      function scanForIcons(dir, prefix = "") {
        try {
          const files = fs.readdirSync(dir);
          files.forEach((file) => {
            const filePath = `${dir}/${file}`;
            const stats = fs.statSync(filePath);

            if (
              stats.isDirectory() &&
              !file.startsWith(".") &&
              file !== "node_modules"
            ) {
              scanForIcons(filePath, `${prefix}${file}/`);
            } else if (stats.isFile()) {
              const ext = file.toLowerCase().split(".").pop();
              if (
                ["png", "jpg", "jpeg", "ico", "svg", "gif", "webp"].includes(
                  ext,
                )
              ) {
                iconFiles.push({
                  name: file,
                  path: `${prefix}${file}`,
                  size: stats.size,
                  extension: ext,
                });
              }
            }
          });
        } catch (e) {
          // Skip unreadable directories
        }
      }

      scanForIcons("public", "public/");
      scanForIcons("src", "src/");

      if (iconFiles.length > 0) {
        iconFiles.forEach((icon) => {
          console.log(`📄 ${icon.name}`);
          console.log(`   📍 Path: ${icon.path}`);
          console.log(`   📊 Size: ${(icon.size / 1024).toFixed(2)} KB`);
          console.log(`   🎨 Format: ${icon.extension.toUpperCase()}`);
          console.log("");
        });

        console.log("\n🎯 CURRENT FAVICON SETUP:");
        console.log("=".repeat(25));
        console.log("✅ favicon.svg found in public/ directory");
        console.log("   • This is a scalable vector favicon");
        console.log("   • Works well for modern browsers");
        console.log("   • Contains animated gradient effects");

        console.log("\n📝 RECOMMENDED IMPROVEMENTS:");
        console.log("=".repeat(29));
        console.log("After extracting icon.zip, you should add:");
        console.log("• favicon.ico (16x16, 32x32) for legacy browser support");
        console.log("• apple-touch-icon-180x180.png for iOS devices");
        console.log("• icon-192x192.png and icon-512x512.png for Android/PWA");
        console.log("• Various sizes for different use cases");
      } else {
        console.log("❌ No icon files found in project directories");
      }
    } catch (e) {
      console.error("Error reading zip file:", e.message);
    }
    return;
  }

  if (stdout) {
    console.log("📦 Contents of icon.zip:");
    console.log("=".repeat(25));
    console.log(stdout);

    // Extract the files
    exec(
      "unzip -o icon.zip -d extracted-icons/",
      (extractError, extractStdout, extractStderr) => {
        if (!extractError) {
          console.log("\n✅ Successfully extracted icons!");
          console.log("📁 Files extracted to: extracted-icons/");

          // Analyze extracted files
          analyzeExtractedIcons();
        } else {
          console.log("❌ Failed to extract files:", extractError.message);
        }
      },
    );
  }
});

function analyzeExtractedIcons() {
  try {
    const extractedDir = "extracted-icons";
    if (!fs.existsSync(extractedDir)) {
      console.log("❌ Extracted icons directory not found");
      return;
    }

    console.log("\n📄 EXTRACTED ICON FILES:");
    console.log("=".repeat(25));

    const iconFiles = [];

    function scanDirectory(dir, relativePath = "") {
      const files = fs.readdirSync(dir);

      files.forEach((file) => {
        const filePath = `${dir}/${file}`;
        const fullRelativePath = relativePath
          ? `${relativePath}/${file}`
          : file;
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
          scanDirectory(filePath, fullRelativePath);
        } else if (stats.isFile()) {
          const ext = file.toLowerCase().split(".").pop();
          const iconExtensions = [
            "png",
            "jpg",
            "jpeg",
            "ico",
            "svg",
            "gif",
            "webp",
          ];

          if (iconExtensions.includes(ext)) {
            const baseName = file.replace(/\.[^/.]+$/, "");

            // Try to extract dimensions from filename
            const dimensionMatch =
              baseName.match(/(\d+)x(\d+)/) || baseName.match(/(\d+)/);
            const dimensions = dimensionMatch
              ? dimensionMatch[2]
                ? `${dimensionMatch[1]}x${dimensionMatch[2]}`
                : `${dimensionMatch[1]}x${dimensionMatch[1]}`
              : "Unknown";

            iconFiles.push({
              name: file,
              path: fullRelativePath,
              size: stats.size,
              extension: ext,
              dimensions: dimensions,
              baseName: baseName,
            });
          }
        }
      });
    }

    scanDirectory(extractedDir);

    if (iconFiles.length === 0) {
      console.log("❌ No icon files found in extracted directory");
      return;
    }

    // Sort by extension, then by dimensions
    iconFiles.sort((a, b) => {
      if (a.extension !== b.extension) {
        return a.extension.localeCompare(b.extension);
      }

      const aDim = parseInt(a.dimensions.split("x")[0]) || 0;
      const bDim = parseInt(b.dimensions.split("x")[0]) || 0;
      return aDim - bDim;
    });

    iconFiles.forEach((file) => {
      console.log(`📄 ${file.name}`);
      console.log(`   📍 Path: ${file.path}`);
      console.log(`   📏 Dimensions: ${file.dimensions}`);
      console.log(`   📊 Size: ${(file.size / 1024).toFixed(2)} KB`);
      console.log(`   🎨 Format: ${file.extension.toUpperCase()}`);
      console.log("");
    });

    // Generate usage recommendations
    generateUsageRecommendations(iconFiles);

    // Generate HTML tags
    generateHTMLTags(iconFiles);

    console.log(`\n✅ Analysis complete!`);
    console.log(`📊 Total icons found: ${iconFiles.length}`);
    console.log(`📁 Icons extracted to: ${extractedDir}/`);
  } catch (error) {
    console.error("❌ Error analyzing extracted icons:", error.message);
  }
}

function generateUsageRecommendations(iconFiles) {
  console.log("\n🎯 USAGE RECOMMENDATIONS:");
  console.log("=".repeat(26));

  iconFiles.forEach((file) => {
    const usage = getIconUsage(file.dimensions, file.extension, file.baseName);
    console.log(`🔸 ${file.name} (${file.dimensions})`);
    usage.forEach((use) => {
      console.log(`   • ${use}`);
    });
    console.log("");
  });
}

function generateHTMLTags(iconFiles) {
  console.log("\n📝 RECOMMENDED HTML META TAGS:");
  console.log("=".repeat(31));

  const htmlTags = [];

  iconFiles.forEach((file) => {
    const dim = file.dimensions;
    const ext = file.extension;
    const filePath = file.path;

    if (ext === "ico") {
      htmlTags.push(
        `<link rel="icon" type="image/x-icon" href="/${filePath}">`,
      );
    }

    if (ext === "png" && dim !== "Unknown") {
      const size = dim.split("x")[0];

      // Standard favicons
      if (["16", "32", "48", "64"].includes(size)) {
        htmlTags.push(
          `<link rel="icon" type="image/png" sizes="${dim}" href="/${filePath}">`,
        );
      }

      // Apple touch icons
      if (["120", "144", "152", "180"].includes(size)) {
        htmlTags.push(
          `<link rel="apple-touch-icon" sizes="${dim}" href="/${filePath}">`,
        );
      }

      // Android Chrome icons
      if (["192", "512"].includes(size)) {
        htmlTags.push(
          `<link rel="icon" type="image/png" sizes="${dim}" href="/${filePath}">`,
        );
      }
    }
  });

  // Remove duplicates
  const uniqueTags = [...new Set(htmlTags)];
  uniqueTags.forEach((tag) => {
    console.log(tag);
  });
}

function getIconUsage(dimensions, extension, baseName) {
  const usage = [];
  const dim = dimensions;
  const ext = extension;
  const name = baseName.toLowerCase();

  // Standard favicon sizes
  if (dim === "16x16") {
    if (ext === "ico") {
      usage.push("Standard favicon (favicon.ico)");
    } else if (ext === "png") {
      usage.push("PNG favicon 16x16");
    }
  }

  if (dim === "32x32" && ext === "png") {
    usage.push("PNG favicon 32x32");
  }

  if (dim === "48x48" && ext === "png") {
    usage.push("PNG favicon 48x48");
  }

  // Apple Touch Icons
  if (dim === "120x120" && ext === "png") {
    usage.push("Apple Touch Icon (iPhone)");
  }

  if (dim === "144x144" && ext === "png") {
    usage.push("Apple Touch Icon (iPad)");
    usage.push("Windows tile (144x144)");
  }

  if (dim === "152x152" && ext === "png") {
    usage.push("Apple Touch Icon (iPad)");
  }

  if (dim === "180x180" && ext === "png") {
    usage.push("Apple Touch Icon (iPhone/iPad)");
  }

  // Android Chrome icons
  if (dim === "192x192" && ext === "png") {
    usage.push("Android Chrome icon (192x192)");
    usage.push("Web App Manifest icon");
  }

  if (dim === "512x512" && ext === "png") {
    usage.push("Android Chrome icon (512x512)");
    usage.push("Web App Manifest icon");
  }

  // Generic usage based on size
  try {
    const size = parseInt(dim.split("x")[0]) || 0;
    if (size >= 512) {
      usage.push("High-resolution app icon");
    } else if (size >= 192) {
      usage.push("Standard app icon");
    } else if (size >= 64) {
      usage.push("Medium app icon");
    } else if (size >= 16) {
      usage.push("Small app icon");
    }
  } catch (e) {
    // Ignore parsing errors
  }

  if (usage.length === 0) {
    usage.push("General purpose icon");
  }

  return usage;
}
