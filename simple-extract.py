#!/usr/bin/env python3

import os
import zipfile
import json
import sys

def main():
    print("🔍 Analyzing icon.zip file...")
    print("=" * 40)
    
    # Check if icon.zip exists
    if not os.path.exists('icon.zip'):
        print("❌ icon.zip file not found!")
        return
    
    # Get zip file info
    try:
        zip_size = os.path.getsize('icon.zip')
        print(f"📊 Zip file size: {zip_size} bytes ({zip_size / 1024:.2f} KB)")
        
        # Try to list contents
        with zipfile.ZipFile('icon.zip', 'r') as zip_ref:
            file_list = zip_ref.namelist()
            print(f"📦 Found {len(file_list)} files in zip:")
            
            print("\n📋 ZIP CONTENTS:")
            print("=" * 16)
            
            for file_info in zip_ref.infolist():
                print(f"📄 {file_info.filename}")
                print(f"   📊 Compressed: {file_info.compress_size} bytes")
                print(f"   📊 Uncompressed: {file_info.file_size} bytes")
                if file_info.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.ico', '.svg', '.gif', '.webp')):
                    print(f"   🎨 Type: Icon/Image file")
                else:
                    print(f"   📁 Type: Other file")
                print("")
            
            # Extract the files
            print("🚀 Extracting files...")
            os.makedirs('extracted-icons', exist_ok=True)
            zip_ref.extractall('extracted-icons')
            print("✅ Files extracted to extracted-icons/")
            
            # Analyze extracted icons
            analyze_icons()
            
    except zipfile.BadZipFile:
        print("❌ Invalid zip file format")
    except Exception as e:
        print(f"❌ Error processing zip file: {e}")

def analyze_icons():
    print("\n📁 ANALYZING EXTRACTED ICONS...")
    print("=" * 31)
    
    icons = []
    
    # Walk through extracted directory
    for root, dirs, files in os.walk('extracted-icons'):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg', '.ico', '.svg', '.gif', '.webp')):
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, 'extracted-icons')
                file_size = os.path.getsize(file_path)
                
                # Extract dimensions from filename
                import re
                filename_lower = file.lower()
                dimensions = "Unknown"
                
                # Look for patterns like "16x16", "favicon-32x32", "icon-192x192", etc.
                dim_match = re.search(r'(\d+)x(\d+)', filename_lower)
                if dim_match:
                    dimensions = f"{dim_match.group(1)}x{dim_match.group(2)}"
                else:
                    # Look for single number that might indicate square dimensions
                    single_match = re.search(r'(\d+)', filename_lower)
                    if single_match and len(single_match.group(1)) >= 2:
                        size = single_match.group(1)
                        # Common icon sizes
                        if size in ['16', '32', '48', '64', '72', '96', '120', '128', '144', '152', '180', '192', '256', '512', '1024']:
                            dimensions = f"{size}x{size}"
                
                icons.append({
                    'name': file,
                    'path': rel_path,
                    'size_bytes': file_size,
                    'size_kb': file_size / 1024,
                    'extension': os.path.splitext(file)[1].lower(),
                    'dimensions': dimensions
                })
    
    if not icons:
        print("❌ No icon files found in extracted directory")
        return
    
    # Sort icons
    icons.sort(key=lambda x: (x['extension'], get_size_sort_key(x['dimensions'])))
    
    print(f"📊 Found {len(icons)} icon files:")
    print("")
    
    for icon in icons:
        print(f"📄 {icon['name']}")
        print(f"   📍 Path: {icon['path']}")
        print(f"   📏 Dimensions: {icon['dimensions']}")
        print(f"   📊 Size: {icon['size_kb']:.2f} KB ({icon['size_bytes']} bytes)")
        print(f"   🎨 Format: {icon['extension'][1:].upper()}")
        print("")
    
    # Generate usage recommendations
    print("🎯 USAGE RECOMMENDATIONS:")
    print("=" * 26)
    
    for icon in icons:
        usage = get_usage_recommendations(icon)
        print(f"🔸 {icon['name']} ({icon['dimensions']})")
        for use in usage:
            print(f"   • {use}")
        print("")
    
    # Generate HTML meta tags
    print("📝 RECOMMENDED HTML META TAGS:")
    print("=" * 31)
    
    html_tags = generate_html_tags(icons)
    for tag in html_tags:
        print(tag)
    
    # Create summary
    print(f"\n✅ Analysis complete!")
    print(f"📊 Total icons analyzed: {len(icons)}")
    print(f"📁 Icons location: extracted-icons/")
    
    # Save analysis to JSON
    analysis = {
        'total_icons': len(icons),
        'icons': icons,
        'html_tags': html_tags,
        'extraction_path': 'extracted-icons'
    }
    
    with open('icon-analysis.json', 'w') as f:
        json.dump(analysis, f, indent=2)
    
    print(f"📄 Detailed analysis saved to: icon-analysis.json")

def get_size_sort_key(dimensions):
    """Extract numeric value for sorting dimensions"""
    if dimensions == "Unknown":
        return 0
    try:
        return int(dimensions.split('x')[0])
    except:
        return 0

def get_usage_recommendations(icon):
    """Get usage recommendations for an icon"""
    usage = []
    dim = icon['dimensions']
    ext = icon['extension']
    name = icon['name'].lower()
    
    # Standard favicon sizes
    if dim == "16x16":
        if ext == ".ico":
            usage.append("Standard favicon (favicon.ico)")
        elif ext == ".png":
            usage.append("PNG favicon 16x16")
    
    if dim == "32x32" and ext == ".png":
        usage.append("PNG favicon 32x32")
    
    if dim == "48x48" and ext == ".png":
        usage.append("PNG favicon 48x48")
    
    # Apple Touch Icons
    if dim == "120x120" and ext == ".png":
        usage.append("Apple Touch Icon (iPhone)")
    
    if dim == "144x144" and ext == ".png":
        usage.append("Apple Touch Icon (iPad)")
        usage.append("Windows tile (144x144)")
    
    if dim == "152x152" and ext == ".png":
        usage.append("Apple Touch Icon (iPad)")
    
    if dim == "180x180" and ext == ".png":
        usage.append("Apple Touch Icon (iPhone/iPad)")
    
    # Android Chrome icons
    if dim == "192x192" and ext == ".png":
        usage.append("Android Chrome icon (192x192)")
        usage.append("Web App Manifest icon")
    
    if dim == "512x512" and ext == ".png":
        usage.append("Android Chrome icon (512x512)")
        usage.append("Web App Manifest icon")
    
    # Windows tiles
    if dim == "270x270" and ext == ".png":
        usage.append("Windows tile (270x270)")
    
    # Generic usage based on size
    try:
        size = int(dim.split('x')[0]) if dim != "Unknown" else 0
        if size >= 512:
            usage.append("High-resolution app icon")
        elif size >= 192:
            usage.append("Standard app icon")
        elif size >= 64:
            usage.append("Medium app icon")
        elif size >= 16:
            usage.append("Small app icon")
    except:
        pass
    
    # Special filenames
    if 'favicon' in name:
        usage.append("Website favicon")
    
    if 'apple' in name or 'touch' in name:
        usage.append("Apple device icon")
    
    if 'android' in name or 'chrome' in name:
        usage.append("Android/Chrome icon")
    
    if len(usage) == 0:
        usage.append("General purpose icon")
    
    return usage

def generate_html_tags(icons):
    """Generate HTML meta tags for the icons"""
    tags = []
    
    for icon in icons:
        dim = icon['dimensions']
        ext = icon['extension']
        file_path = icon['path']
        
        if ext == '.ico':
            tags.append(f'<link rel="icon" type="image/x-icon" href="/{file_path}">')
        
        if ext == '.png' and dim != "Unknown":
            size = dim.split('x')[0]
            
            # Standard favicons
            if size in ['16', '32', '48', '64']:
                tags.append(f'<link rel="icon" type="image/png" sizes="{dim}" href="/{file_path}">')
            
            # Apple touch icons
            if size in ['120', '144', '152', '180']:
                tags.append(f'<link rel="apple-touch-icon" sizes="{dim}" href="/{file_path}">')
            
            # Android Chrome icons for manifest
            if size in ['192', '512']:
                tags.append(f'<link rel="icon" type="image/png" sizes="{dim}" href="/{file_path}">')
    
    # Remove duplicates while preserving order
    seen = set()
    unique_tags = []
    for tag in tags:
        if tag not in seen:
            seen.add(tag)
            unique_tags.append(tag)
    
    return unique_tags

if __name__ == "__main__":
    main()