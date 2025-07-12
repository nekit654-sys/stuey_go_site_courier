#!/bin/bash

echo "🔍 Extracting and analyzing icon.zip..."
echo "======================================"

# Create directory for extracted icons
mkdir -p extracted-icons

# Extract the zip file
if command -v unzip &> /dev/null; then
    echo "📦 Extracting icon.zip using unzip..."
    unzip -o icon.zip -d extracted-icons/
else
    echo "❌ unzip command not found. Please install unzip or use a different method."
    exit 1
fi

echo ""
echo "📁 EXTRACTED ICON FILES:"
echo "========================"

# Analyze the extracted files
find extracted-icons -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.ico" -o -name "*.svg" \) | while read file; do
    filename=$(basename "$file")
    filesize=$(du -h "$file" | cut -f1)
    extension="${filename##*.}"
    
    echo "📄 $filename"
    echo "   📍 Path: $file"
    echo "   📊 Size: $filesize"
    echo "   🎨 Format: ${extension^^}"
    
    # Try to get image dimensions if available
    if command -v file &> /dev/null; then
        dimensions=$(file "$file" | grep -o '[0-9]\+x[0-9]\+' | head -1)
        if [ ! -z "$dimensions" ]; then
            echo "   📏 Dimensions: $dimensions"
        fi
    fi
    
    echo ""
done

echo "✅ Extraction complete!"
echo "📁 Icons extracted to: extracted-icons/"