#!/usr/bin/env python3

import os
import zipfile
import json
from pathlib import Path

def extract_and_analyze_icons():
    print("🔍 Extracting and analyzing icon.zip...")
    print("=" * 40)
    
    # Create directory for extracted icons
    extract_dir = Path("extracted-icons")
    extract_dir.mkdir(exist_ok=True)
    
    # Extract the zip file
    try:
        with zipfile.ZipFile("icon.zip", 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
        print("📦 Successfully extracted icon.zip")
    except FileNotFoundError:
        print("❌ icon.zip not found!")
        return
    except Exception as e:
        print(f"❌ Error extracting zip: {e}")
        return
    
    print("\n📁 EXTRACTED ICON FILES:")
    print("=" * 25)
    
    # Find all image files
    image_extensions = {'.png', '.jpg', '.jpeg', '.ico', '.svg', '.gif', '.webp'}
    icon_files = []
    
    for root, dirs, files in os.walk(extract_dir):
        for file in files:
            file_path = Path(root) / file
            if file_path.suffix.lower() in image_extensions:
                rel_path = file_path.relative_to(extract_dir)
                file_size = file_path.stat().st_size
                
                # Try to extract dimensions from filename
                filename_lower = file_path.stem.lower()
                dimensions = "Unknown"
                
                # Look for patterns like "16x16", "favicon-32x32", "icon-192x192", etc.
                import re
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
                
                icon_info = {
                    'name': file_path.name,
                    'path': str(rel_path),
                    'full_path': str(file_path),
                    'size_bytes': file_size,
                    'size_human': format_bytes(file_size),
                    'extension': file_path.suffix.lower(),
                    'dimensions': dimensions
                }
                
                icon_files.append(icon_info)
    
    # Sort by extension, then by dimensions
    icon_files.sort(key=lambda x: (x['extension'], get_dimension_sort_key(x['dimensions'])))
    
    # Display file information
    for icon in icon_files:
        print(f"📄 {icon['name']}")
        print(f"   📍 Path: {icon['path']}")
        print(f"   📏 Dimensions: {icon['dimensions']}")
        print(f"   📊 Size: {icon['size_human']} ({icon['size_bytes']} bytes)")
        print(f"   🎨 Format: {icon['extension'][1:].upper()}")
        print("")
    
    print("\n🎯 USAGE RECOMMENDATIONS:")
    print("=" * 26)
    
    # Analyze usage for each icon
    for icon in icon_files:
        usage = get_icon_usage(icon['dimensions'], icon['extension'], icon['name'])
        print(f"🔸 {icon['name']} ({icon['dimensions']})")
        for use in usage:
            print(f"   • {use}")
        print("")
    
    print("\n📝 RECOMMENDED HTML META TAGS:")
    print("=" * 31)
    
    # Generate HTML meta tags
    html_tags = generate_html_tags(icon_files)
    for tag in html_tags:
        print(tag)
    
    print(f"\n✅ Analysis complete!")
    print(f"📊 Total icons found: {len(icon_files)}")
    print(f"📁 Icons extracted to: {extract_dir}")
    
    # Create summary JSON
    summary = {
        'total_icons': len(icon_files),
        'icons': icon_files,
        'html_tags': html_tags,
        'extraction_path': str(extract_dir)
    }
    
    with open('icon-analysis.json', 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"📄 Detailed analysis saved to: icon-analysis.json")

def format_bytes(bytes_size):
    """Convert bytes to human readable format"""
    for unit in ['B', 'KB', 'MB']:
        if bytes_size < 1024.0:
            return f"{bytes_size:.1f} {unit}"
        bytes_size /= 1024.0
    return f"{bytes_size:.1f} GB"

def get_dimension_sort_key(dimensions):
    """Extract numeric value for sorting dimensions"""
    if dimensions == "Unknown":
        return 0
    try:
        return int(dimensions.split('x')[0])
    except:
        return 0

def get_icon_usage(dimensions, extension, filename):
    """Determine usage recommendations for an icon"""
    usage = []
    
    dim = dimensions
    ext = extension
    name = filename.lower()
    
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

def generate_html_tags(icon_files):
    """Generate HTML meta tags for the icons"""
    tags = []
    
    for icon in icon_files:
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
    extract_and_analyze_icons()