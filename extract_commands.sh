#!/bin/bash

echo "🔧 EXECUTING BASH COMMANDS FOR ICON EXTRACTION"
echo "==============================================="

echo ""
echo "Step 1: List contents of icon.zip"
echo "=================================="
echo "$ unzip -l icon.zip"
echo ""
unzip -l icon.zip

echo ""
echo "Step 2: Extract icon.zip to temp-icons/"
echo "======================================="
echo "$ unzip -o icon.zip -d temp-icons/"
echo ""
unzip -o icon.zip -d temp-icons/

echo ""
echo "Step 3: List contents of temp-icons/"
echo "===================================="
echo "$ ls -la temp-icons/"
echo ""
ls -la temp-icons/

echo ""
echo "Step 4: Find all icon files"
echo "==========================="
echo '$ find temp-icons -name "*.png" -o -name "*.ico" -o -name "*.svg" -o -name "*.webmanifest"'
echo ""
find temp-icons -name "*.png" -o -name "*.ico" -o -name "*.svg" -o -name "*.webmanifest"

echo ""
echo "Step 5: Copy all files to public/"
echo "================================="
echo "$ cp temp-icons/* public/"
echo ""
cp temp-icons/* public/

echo ""
echo "Step 6: Verify icons are in public/"
echo "==================================="
echo '$ ls -la public/ | grep -E "\.(png|ico|svg|webmanifest)$"'
echo ""
ls -la public/ | grep -E "\.(png|ico|svg|webmanifest)$"

echo ""
echo "Step 7: Clean up temp-icons directory"
echo "====================================="
echo "$ rm -rf temp-icons"
echo ""
rm -rf temp-icons

echo ""
echo "✅ EXTRACTION COMPLETE!"
echo "======================"
echo "All bash commands have been executed."
echo "Check the output above to see what icon files are now available."