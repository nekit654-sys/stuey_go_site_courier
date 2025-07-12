#!/bin/bash

echo "🔍 Quick Icon.zip Check"
echo "======================"

# Basic file check
if [ -f "icon.zip" ]; then
    echo "✅ icon.zip found"
    ls -lh icon.zip
    echo ""
    
    # Try to list contents
    echo "📋 Attempting to list zip contents..."
    if command -v unzip >/dev/null 2>&1; then
        echo "Using unzip to list contents:"
        unzip -l icon.zip 2>/dev/null || echo "Failed to list with unzip"
    else
        echo "unzip command not available"
    fi
    
    echo ""
    echo "📁 Current public/ directory contents:"
    ls -la public/ | grep -E '\.(png|ico|svg|webmanifest)' || echo "No icon files found in public/"
    
else
    echo "❌ icon.zip not found"
fi