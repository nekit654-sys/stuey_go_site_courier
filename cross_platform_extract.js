const spawn = require("cross-spawn");
const fs = require("fs");
const path = require("path");

function execCommand(command, args = [], description) {
  return new Promise((resolve, reject) => {
    console.log(`\n${description}`);
    console.log("=".repeat(description.length));
    console.log(`$ ${command} ${args.join(" ")}\n`);

    const child = spawn(command, args, {
      stdio: ["inherit", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      const output = data.toString();
      stdout += output;
      console.log(output);
    });

    child.stderr.on("data", (data) => {
      const output = data.toString();
      stderr += output;
      if (!output.includes("inflating:")) {
        // Suppress unzip noise
        console.error(output);
      }
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr, code });
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on("error", (error) => {
      reject(error);
    });
  });
}

async function runExtraction() {
  console.log("🔧 CROSS-PLATFORM ICON EXTRACTION");
  console.log("==================================");

  // Check if icon.zip exists
  if (!fs.existsSync("icon.zip")) {
    console.log("\n❌ icon.zip file not found!");
    return;
  }

  const zipStats = fs.statSync("icon.zip");
  console.log(`\n✅ Found icon.zip (${(zipStats.size / 1024).toFixed(2)} KB)`);

  try {
    // Step 1: List zip contents
    try {
      await execCommand(
        "unzip",
        ["-l", "icon.zip"],
        "Step 1: List contents of icon.zip",
      );
    } catch (error) {
      console.log("⚠️  unzip -l failed, continuing with extraction...");
    }

    // Step 2: Extract zip
    await execCommand(
      "unzip",
      ["-o", "icon.zip", "-d", "temp-icons/"],
      "Step 2: Extract icon.zip to temp-icons/",
    );

    // Step 3: List extracted files
    await execCommand(
      "ls",
      ["-la", "temp-icons/"],
      "Step 3: List contents of temp-icons/",
    );

    // Step 4: Find icon files
    try {
      await execCommand(
        "find",
        [
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
        ],
        "Step 4: Find all icon files",
      );
    } catch (error) {
      console.log("⚠️  find command failed, will list manually...");
    }

    // Step 5: Copy files (manual approach for better compatibility)
    console.log("\nStep 5: Copy all files to public/");
    console.log("=================================");
    console.log("$ Manual file copy using Node.js\n");

    // Ensure public directory exists
    if (!fs.existsSync("public")) {
      fs.mkdirSync("public");
      console.log("✅ Created public/ directory");
    }

    // Copy files manually
    const tempDir = "temp-icons";
    const publicDir = "public";
    let copiedCount = 0;

    function copyFiles(srcDir) {
      const items = fs.readdirSync(srcDir);

      for (const item of items) {
        const srcPath = path.join(srcDir, item);
        const stats = fs.statSync(srcPath);

        if (stats.isDirectory()) {
          copyFiles(srcPath); // Recursive copy
        } else {
          const destPath = path.join(publicDir, item);

          // Don't overwrite existing favicon.svg
          if (item === "favicon.svg" && fs.existsSync(destPath)) {
            console.log(`⚠️  Skipped ${item} (preserving existing)`);
          } else {
            fs.copyFileSync(srcPath, destPath);
            console.log(`✅ Copied ${item} to public/`);
            copiedCount++;
          }
        }
      }
    }

    copyFiles(tempDir);
    console.log(`\n📊 Total files copied: ${copiedCount}`);

    // Step 6: Verify files in public
    console.log("\nStep 6: Verify icons are in public/");
    console.log("===================================");

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

    if (iconFiles.length > 0) {
      iconFiles.sort().forEach((file) => {
        const filePath = path.join("public", file);
        const stats = fs.statSync(filePath);
        const size = (stats.size / 1024).toFixed(2);
        console.log(`📄 ${file} - ${size} KB`);
      });
    } else {
      console.log("❌ No icon files found in public/ directory");
    }

    // Step 7: Clean up
    await execCommand(
      "rm",
      ["-rf", "temp-icons"],
      "Step 7: Clean up temp-icons directory",
    );

    console.log("\n✅ EXTRACTION COMPLETE!");
    console.log("=======================");
    console.log(`📊 Total icon files: ${iconFiles.length}`);
    console.log("📁 All files are now in public/ directory");
    console.log("📝 Ready for HTML meta tag generation");

    // Generate HTML meta tags
    console.log("\n📝 GENERATED HTML META TAGS:");
    console.log("============================");
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

    htmlTags.forEach((tag) => console.log(tag));
  } catch (error) {
    console.error("\n❌ Extraction failed:", error.message);
    console.log("\nTrying manual extraction with Node.js...");

    // Manual extraction fallback
    try {
      const JSZip = require("jszip");
      const zipData = fs.readFileSync("icon.zip");
      const zip = new JSZip();
      const contents = await zip.loadAsync(zipData);

      console.log("📦 Using JSZip for extraction...");

      const extractPromises = [];
      contents.forEach((relativePath, file) => {
        if (!file.dir) {
          const promise = file.async("nodebuffer").then((content) => {
            const outputPath = path.join("public", path.basename(relativePath));
            fs.writeFileSync(outputPath, content);
            console.log(`✅ Extracted ${path.basename(relativePath)}`);
          });
          extractPromises.push(promise);
        }
      });

      await Promise.all(extractPromises);
      console.log("✅ Manual extraction completed");
    } catch (manualError) {
      console.error("❌ Manual extraction also failed:", manualError.message);
      console.log("\n📝 Please extract icon.zip manually:");
      console.log("1. Extract icon.zip to a folder");
      console.log("2. Copy all PNG, ICO, SVG files to public/ directory");
      console.log("3. Update HTML meta tags in index.html");
    }
  }
}

runExtraction();
