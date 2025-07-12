#!/bin/bash

echo "🔍 Simple Icon Extraction"
echo "========================="
echo ""

# Step 1: Check if icon.zip exists
if [ ! -f "icon.zip" ]; then
    echo "❌ icon.zip not found!"
    exit 1
fi

echo "📦 Found icon.zip file"
ls -lh icon.zip
echo ""

# Step 2: Create temp directory
echo "📁 Creating temporary directory..."
mkdir -p temp-icons
echo "✅ Created temp-icons/"
echo ""

# Step 3: Extract the zip
echo "📦 Extracting icon.zip..."
if command -v unzip >/dev/null 2>&1; then
    unzip -o icon.zip -d temp-icons/
    echo "✅ Extraction completed"
else
    echo "❌ unzip command not available"
    echo "Please extract icon.zip manually into temp-icons/ directory"
    echo "Then run: ls -la temp-icons/"
    exit 1
fi
echo ""

# Step 4: List extracted files
echo "📋 Extracted files:"
echo "=================="
find temp-icons -type f -exec ls -lah {} \; | while read line; do
    size=$(echo "$line" | awk '{print $5}')
    filename=$(echo "$line" | awk '{print $NF}')
    basename_file=$(basename "$filename")
    echo "📄 $basename_file - $size"
done
echo ""

# Step 5: Move icon files to public
echo "📁 Moving icon files to public/..."
moved=0
find temp-icons -type f \( -name "*.png" -o -name "*.ico" -o -name "*.svg" -o -name "*.webmanifest" -o -name "*.json" -o -name "*.xml" \) | while read file; do
    basename_file=$(basename "$file")
    if [ "$basename_file" = "favicon.svg" ] && [ -f "public/favicon.svg" ]; then
        echo "⚠️  Skipped $basename_file (preserving existing)"
    else
        cp "$file" "public/"
        echo "✅ Moved $basename_file to public/"
        moved=$((moved + 1))
    fi
done
echo ""

# Step 6: List final public directory
echo "📂 Final public/ directory icons:"
echo "================================="
ls -lah public/ | grep -E '\.(png|ico|svg|webmanifest|json|xml)$' | while read line; do
    size=$(echo "$line" | awk '{print $5}')
    filename=$(echo "$line" | awk '{print $NF}')
    echo "📄 $filename - $size"
done
echo ""

# Step 7: Generate HTML tags
echo "📝 Recommended HTML meta tags:"
echo "=============================="
echo "<!-- Replace current favicon section with these -->"

# Check for each icon type and generate tags
if [ -f "public/favicon.ico" ]; then
    echo '<link rel="icon" type="image/x-icon" href="/favicon.ico">'
fi

if [ -f "public/favicon.svg" ]; then
    echo '<link rel="icon" type="image/svg+xml" href="/favicon.svg">'
fi

for size in 16 32 48; do
    for pattern in "favicon-${size}x${size}.png" "icon-${size}x${size}.png"; do
        if [ -f "public/$pattern" ]; then
            echo "<link rel=\"icon\" type=\"image/png\" sizes=\"${size}x${size}\" href=\"/$pattern\">"
            break
        fi
    done
done

for size in 120 144 152 180; do
    for pattern in "apple-touch-icon-${size}x${size}.png" "apple-touch-icon.png"; do
        if [ -f "public/$pattern" ]; then
            echo "<link rel=\"apple-touch-icon\" sizes=\"${size}x${size}\" href=\"/$pattern\">"
            break
        fi
    done
done

for size in 192 512; do
    for pattern in "android-chrome-${size}x${size}.png" "icon-${size}x${size}.png"; do
        if [ -f "public/$pattern" ]; then
            echo "<link rel=\"icon\" type=\"image/png\" sizes=\"${size}x${size}\" href=\"/$pattern\">"
            break
        fi
    done
done

if [ -f "public/mstile-144x144.png" ]; then
    echo '<meta name="msapplication-TileImage" content="/mstile-144x144.png">'
    echo '<meta name="msapplication-TileColor" content="#f97316">'
fi

if [ -f "public/site.webmanifest" ]; then
    echo '<link rel="manifest" href="/site.webmanifest">'
elif [ -f "public/manifest.json" ]; then
    echo '<link rel="manifest" href="/manifest.json">'
fi

echo ""

# Step 8: Clean up
echo "🧹 Cleaning up..."
rm -rf temp-icons/
echo "✅ Removed temp-icons/ directory"
echo ""

echo "✅ EXTRACTION COMPLETE!"
echo "======================"
echo "📁 All icons are now in public/ directory"
echo "📝 Use the HTML meta tags above in your index.html"
echo "🔄 Remove the external favicon URLs from your HTML"