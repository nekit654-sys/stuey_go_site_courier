#!/bin/bash

echo "🔍 Extracting and analyzing icon.zip..."
echo "======================================"

# Step 1: Create temporary directory
echo "📁 Creating temporary directory..."
mkdir -p temp-icons
echo "✅ Created temp-icons directory"

# Step 2: Extract icon.zip
echo ""
echo "📦 Extracting icon.zip..."
if [ -f "icon.zip" ]; then
    unzip -o icon.zip -d temp-icons/
    echo "✅ Extraction complete"
else
    echo "❌ icon.zip not found!"
    exit 1
fi

# Step 3: List all extracted files with sizes
echo ""
echo "📋 EXTRACTED FILES AND SIZES:"
echo "=============================="
find temp-icons -type f -exec ls -lah {} \; | while read -r line; do
    size=$(echo "$line" | awk '{print $5}')
    filename=$(echo "$line" | awk '{print $NF}')
    basename_file=$(basename "$filename")
    echo "📄 $basename_file - $size"
done

# Step 4: Show directory structure
echo ""
echo "📂 DIRECTORY STRUCTURE:"
echo "======================="
find temp-icons -type f | sort

# Step 5: Identify icon files specifically
echo ""
echo "🎨 ICON FILES IDENTIFIED:"
echo "========================="
find temp-icons -type f \( -name "*.png" -o -name "*.ico" -o -name "*.svg" -o -name "*.webp" -o -name "*.gif" -o -name "*.jpg" \) | while read file; do
    size=$(du -h "$file" | cut -f1)
    basename_file=$(basename "$file")
    echo "🔸 $basename_file ($size)"
done

# Step 6: Move icon files to public directory
echo ""
echo "📁 Moving icon files to public/ directory..."
icon_count=0
find temp-icons -type f \( -name "*.png" -o -name "*.ico" -o -name "*.svg" -o -name "*.webp" -o -name "*.gif" -o -name "*.jpg" \) | while read file; do
    basename_file=$(basename "$file")
    if [ ! -f "public/$basename_file" ] || [ "$basename_file" != "favicon.svg" ]; then
        cp "$file" "public/"
        echo "✅ Moved $basename_file to public/"
        icon_count=$((icon_count + 1))
    else
        echo "⚠️  Skipped $basename_file (already exists)"
    fi
done

# Step 7: Move other important files (manifests, configs)
echo ""
echo "📄 Moving configuration files..."
find temp-icons -type f \( -name "*.webmanifest" -o -name "*.json" -o -name "*.xml" -o -name "*.txt" \) | while read file; do
    basename_file=$(basename "$file")
    cp "$file" "public/"
    echo "✅ Moved $basename_file to public/"
done

# Step 8: Show final public directory contents
echo ""
echo "📂 FINAL PUBLIC/ DIRECTORY CONTENTS:"
echo "===================================="
echo "All files in public/:"
ls -lah public/ | grep -E '\.(png|ico|svg|webp|gif|jpg|webmanifest|json|xml)$' | while read -r line; do
    size=$(echo "$line" | awk '{print $5}')
    filename=$(echo "$line" | awk '{print $NF}')
    echo "📄 $filename - $size"
done

# Step 9: Analyze icon sizes and purposes
echo ""
echo "🎯 ICON ANALYSIS BY SIZE AND PURPOSE:"
echo "====================================="

# Check for specific icon types
if [ -f "public/favicon.ico" ]; then
    size=$(du -h "public/favicon.ico" | cut -f1)
    echo "🔸 favicon.ico ($size) - Legacy browser support"
fi

for size in 16 32 48 64 72 96 120 128 144 152 180 192 256 512 1024; do
    # Check for PNG files with size in name
    for file in "public/favicon-${size}x${size}.png" "public/icon-${size}x${size}.png" "public/android-chrome-${size}x${size}.png" "public/apple-touch-icon-${size}x${size}.png"; do
        if [ -f "$file" ]; then
            filesize=$(du -h "$file" | cut -f1)
            basename_file=$(basename "$file")
            case $size in
                16|32|48) echo "🔸 $basename_file ($filesize) - Standard favicon" ;;
                120|144|152|180) echo "🔸 $basename_file ($filesize) - Apple Touch Icon" ;;
                192|512) echo "🔸 $basename_file ($filesize) - Android/PWA Icon" ;;
                *) echo "🔸 $basename_file ($filesize) - App Icon" ;;
            esac
        fi
    done
done

# Check for Windows tiles
for file in public/mstile-*.png; do
    if [ -f "$file" ]; then
        filesize=$(du -h "$file" | cut -f1)
        basename_file=$(basename "$file")
        echo "🔸 $basename_file ($filesize) - Windows Tile"
    fi
done

# Step 10: Generate HTML meta tags
echo ""
echo "📝 GENERATED HTML META TAGS:"
echo "============================="
echo "<!-- Replace your current favicon section with these tags -->"

if [ -f "public/favicon.ico" ]; then
    echo '<link rel="icon" type="image/x-icon" href="/favicon.ico">'
fi

if [ -f "public/favicon.svg" ]; then
    echo '<link rel="icon" type="image/svg+xml" href="/favicon.svg">'
fi

# Standard PNG favicons
for size in 16 32 48; do
    for pattern in "favicon-${size}x${size}.png" "icon-${size}x${size}.png"; do
        if [ -f "public/$pattern" ]; then
            echo "<link rel=\"icon\" type=\"image/png\" sizes=\"${size}x${size}\" href=\"/$pattern\">"
            break
        fi
    done
done

# Apple Touch Icons
for size in 120 144 152 180; do
    for pattern in "apple-touch-icon-${size}x${size}.png" "apple-touch-icon.png"; do
        if [ -f "public/$pattern" ]; then
            echo "<link rel=\"apple-touch-icon\" sizes=\"${size}x${size}\" href=\"/$pattern\">"
            break
        fi
    done
done

# Android/Chrome icons
for size in 192 512; do
    for pattern in "android-chrome-${size}x${size}.png" "icon-${size}x${size}.png"; do
        if [ -f "public/$pattern" ]; then
            echo "<link rel=\"icon\" type=\"image/png\" sizes=\"${size}x${size}\" href=\"/$pattern\">"
            break
        fi
    done
done

# Windows tiles
if [ -f "public/mstile-144x144.png" ]; then
    echo '<meta name="msapplication-TileImage" content="/mstile-144x144.png">'
    echo '<meta name="msapplication-TileColor" content="#f97316">'
fi

# Web manifest
if [ -f "public/site.webmanifest" ] || [ -f "public/manifest.json" ]; then
    manifest_file="site.webmanifest"
    [ -f "public/manifest.json" ] && manifest_file="manifest.json"
    echo "<link rel=\"manifest\" href=\"/$manifest_file\">"
fi

# Step 11: Clean up
echo ""
echo "🧹 Cleaning up temporary files..."
rm -rf temp-icons/
echo "✅ Temporary directory removed"

# Step 12: Summary
echo ""
echo "✅ EXTRACTION AND ANALYSIS COMPLETE!"
echo "===================================="
icon_count=$(find public -name "*.png" -o -name "*.ico" -o -name "*.svg" | grep -v favicon.svg | wc -l)
echo "📊 Total new icon files: $icon_count"
echo "📁 All icons are now in the public/ directory"
echo "📝 HTML meta tags generated above"
echo "🧪 Next step: Update your index.html with the generated meta tags"