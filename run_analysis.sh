#!/bin/bash

echo "🔍 Starting icon analysis..."
echo "============================"

# First try Python
if command -v python3 &> /dev/null; then
    echo "🐍 Using Python 3..."
    python3 simple-extract.py
elif command -v python &> /dev/null; then
    echo "🐍 Using Python..."
    python simple-extract.py
else
    echo "⚠️  Python not found, trying manual approach..."
    
    # Check if icon.zip exists
    if [ -f "icon.zip" ]; then
        echo "📦 Found icon.zip file"
        ls -lh icon.zip
        
        # Try to extract with unzip
        if command -v unzip &> /dev/null; then
            echo "📂 Extracting with unzip..."
            mkdir -p extracted-icons
            unzip -o icon.zip -d extracted-icons/
            
            echo ""
            echo "📁 Extracted files:"
            find extracted-icons -type f -name "*.png" -o -name "*.ico" -o -name "*.jpg" -o -name "*.svg" | while read file; do
                filename=$(basename "$file")
                filesize=$(du -h "$file" | cut -f1)
                echo "📄 $filename ($filesize)"
            done
        else
            echo "❌ unzip command not found"
            echo "📝 Please extract icon.zip manually and then run the analysis"
        fi
    else
        echo "❌ icon.zip file not found!"
    fi
fi