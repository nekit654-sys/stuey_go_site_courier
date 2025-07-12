#!/usr/bin/env python3

import os
import zipfile
import shutil
import sys
from pathlib import Path

def format_size(size_bytes):
    """Convert bytes to human readable format"""
    if size_bytes == 0:
        return "0 B"
    for unit in ['B', 'KB', 'MB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.1f} GB"

def main():
    print("🔍 EXTRACTING AND ANALYZING ICON.ZIP")
    print("=" * 40)
    
    # Step 1: Check if icon.zip exists
    if not os.path.exists('icon.zip'):
        print("❌ icon.zip file not found!")
        return
    
    zip_size = os.path.getsize('icon.zip')
    print(f"📦 Found icon.zip ({format_size(zip_size)})")
    
    # Step 2: Create temporary directory
    print("\n📁 Step 1: Creating temporary directory...")
    temp_dir = Path('temp-icons')
    temp_dir.mkdir(exist_ok=True)
    print("✅ Created temp-icons directory")
    
    # Step 3: Extract the zip file
    print("\n📦 Step 2: Extracting icon.zip...")
    try:
        with zipfile.ZipFile('icon.zip', 'r') as zip_ref:
            zip_ref.extractall(temp_dir)
            extracted_files = zip_ref.namelist()
        print(f"✅ Extracted {len(extracted_files)} files")
    except Exception as e:
        print(f"❌ Extraction failed: {e}")
        return
    
    # Step 4: List all extracted files with sizes
    print("\n📋 Step 3: Analyzing extracted files...")
    print("EXTRACTED FILES AND SIZES:")
    print("=" * 26)
    
    all_files = []
    for root, dirs, files in os.walk(temp_dir):
        for file in files:
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, temp_dir)
            size = os.path.getsize(file_path)
            all_files.append({
                'name': file,
                'path': rel_path,
                'full_path': file_path,
                'size': size,
                'size_str': format_size(size)
            })
            print(f"📄 {file} - {format_size(size)}")
    
    # Step 5: Identify icon and config files
    print("\n🎨 Step 4: Identifying icon and config files...")
    
    icon_extensions = {'.png', '.ico', '.svg', '.webp', '.gif', '.jpg', '.jpeg'}
    config_extensions = {'.webmanifest', '.json', '.xml', '.txt'}
    
    icon_files = [f for f in all_files if Path(f['name']).suffix.lower() in icon_extensions]
    config_files = [f for f in all_files if Path(f['name']).suffix.lower() in config_extensions]
    
    print("ICON FILES FOUND:")
    print("=" * 17)
    for file in icon_files:
        print(f"🔸 {file['name']} ({file['size_str']})")
    
    if config_files:
        print("\nCONFIG FILES FOUND:")
        print("=" * 19)
        for file in config_files:
            print(f"📄 {file['name']} ({file['size_str']})")
    
    # Step 6: Move files to public directory
    print(f"\n📁 Step 5: Moving {len(icon_files + config_files)} files to public/ directory...")
    
    public_dir = Path('public')
    public_dir.mkdir(exist_ok=True)
    
    moved_count = 0
    skipped_count = 0
    
    for file in icon_files + config_files:
        target_path = public_dir / file['name']
        
        # Don't overwrite existing favicon.svg unless it's from the zip
        if file['name'] == 'favicon.svg' and target_path.exists():
            print(f"⚠️  Skipped {file['name']} (preserving existing)")
            skipped_count += 1
        else:
            try:
                shutil.copy2(file['full_path'], target_path)
                print(f"✅ Moved {file['name']} to public/")
                moved_count += 1
            except Exception as e:
                print(f"❌ Failed to move {file['name']}: {e}")
    
    # Step 7: Analyze final public directory
    print(f"\n📂 Step 6: Final public/ directory analysis...")
    print("ICON FILES NOW IN PUBLIC/:")
    print("=" * 26)
    
    public_icons = []
    try:
        for file in public_dir.glob('*'):
            if file.is_file() and file.suffix.lower() in (icon_extensions | config_extensions):
                size = file.stat().st_size
                public_icons.append({
                    'name': file.name,
                    'size': size,
                    'size_str': format_size(size)
                })
        
        public_icons.sort(key=lambda x: x['name'])
        for icon in public_icons:
            print(f"📄 {icon['name']} - {icon['size_str']}")
            
    except Exception as e:
        print(f"❌ Error reading public directory: {e}")
    
    # Step 8: Generate detailed icon analysis
    print(f"\n🎯 Step 7: Icon usage analysis...")
    print("ICON USAGE BY SIZE AND PURPOSE:")
    print("=" * 31)
    
    icon_analysis = []
    
    # Analyze each icon
    for icon in public_icons:
        name = icon['name'].lower()
        purpose = "General purpose icon"
        
        # Favicon analysis
        if name == 'favicon.ico':
            purpose = "Legacy browser support (IE, older browsers)"
        elif name == 'favicon.svg':
            purpose = "Modern scalable favicon (supports dark mode)"
        elif 'favicon-16x16' in name:
            purpose = "Standard favicon 16x16 - Browser tabs"
        elif 'favicon-32x32' in name:
            purpose = "Standard favicon 32x32 - Desktop browsers"
        elif 'favicon-48x48' in name:
            purpose = "High-DPI favicon 48x48 - Retina displays"
        
        # Apple Touch Icon analysis
        elif 'apple-touch-icon-120x120' in name:
            purpose = "Apple Touch Icon 120x120 - iPhone"
        elif 'apple-touch-icon-144x144' in name:
            purpose = "Apple Touch Icon 144x144 - iPad"
        elif 'apple-touch-icon-152x152' in name:
            purpose = "Apple Touch Icon 152x152 - iPad Retina"
        elif 'apple-touch-icon-180x180' in name:
            purpose = "Apple Touch Icon 180x180 - iPhone 6+ and newer"
        elif 'apple-touch-icon' in name:
            purpose = "Apple Touch Icon - iOS homescreen"
        
        # Android/Chrome analysis
        elif 'android-chrome-192x192' in name:
            purpose = "Android Chrome icon 192x192 - Homescreen"
        elif 'android-chrome-512x512' in name:
            purpose = "Android Chrome icon 512x512 - High-res/PWA"
        elif 'icon-192x192' in name:
            purpose = "PWA icon 192x192 - Web App Manifest"
        elif 'icon-512x512' in name:
            purpose = "PWA icon 512x512 - Web App Manifest"
        
        # Windows tile analysis
        elif 'mstile-144x144' in name:
            purpose = "Windows tile 144x144 - Medium tile"
        elif 'mstile-270x270' in name:
            purpose = "Windows tile 270x270 - Large tile"
        elif 'mstile' in name:
            purpose = "Windows tile icon"
        
        # Config files
        elif name == 'site.webmanifest':
            purpose = "PWA Web App Manifest"
        elif name == 'manifest.json':
            purpose = "PWA Manifest JSON"
        elif name == 'browserconfig.xml':
            purpose = "Windows browser configuration"
        
        icon_analysis.append({
            'file': icon['name'],
            'size': icon['size_str'],
            'purpose': purpose
        })
    
    for analysis in icon_analysis:
        print(f"🔸 {analysis['file']} ({analysis['size']}) - {analysis['purpose']}")
    
    # Step 9: Generate HTML meta tags
    print(f"\n📝 Step 8: Generating HTML meta tags...")
    print("COMPLETE HTML FAVICON SETUP:")
    print("=" * 28)
    print("<!-- Replace your current favicon section with these tags -->")
    
    html_tags = []
    
    # Check for each type of icon and generate appropriate tags
    public_files = [icon['name'] for icon in public_icons]
    
    if 'favicon.ico' in public_files:
        html_tags.append('<link rel="icon" type="image/x-icon" href="/favicon.ico">')
    
    if 'favicon.svg' in public_files:
        html_tags.append('<link rel="icon" type="image/svg+xml" href="/favicon.svg">')
    
    # Standard PNG favicons
    for size in [16, 32, 48]:
        patterns = [f'favicon-{size}x{size}.png', f'icon-{size}x{size}.png']
        for pattern in patterns:
            if pattern in public_files:
                html_tags.append(f'<link rel="icon" type="image/png" sizes="{size}x{size}" href="/{pattern}">')
                break
    
    # Apple Touch Icons
    for size in [120, 144, 152, 180]:
        patterns = [f'apple-touch-icon-{size}x{size}.png', 'apple-touch-icon.png']
        for pattern in patterns:
            if pattern in public_files:
                html_tags.append(f'<link rel="apple-touch-icon" sizes="{size}x{size}" href="/{pattern}">')
                break
    
    # Android/Chrome icons
    for size in [192, 512]:
        patterns = [f'android-chrome-{size}x{size}.png', f'icon-{size}x{size}.png']
        for pattern in patterns:
            if pattern in public_files:
                html_tags.append(f'<link rel="icon" type="image/png" sizes="{size}x{size}" href="/{pattern}">')
                break
    
    # Windows tiles
    if 'mstile-144x144.png' in public_files:
        html_tags.append('<meta name="msapplication-TileImage" content="/mstile-144x144.png">')
        html_tags.append('<meta name="msapplication-TileColor" content="#f97316">')
    
    # Web manifest
    if 'site.webmanifest' in public_files:
        html_tags.append('<link rel="manifest" href="/site.webmanifest">')
    elif 'manifest.json' in public_files:
        html_tags.append('<link rel="manifest" href="/manifest.json">')
    
    for tag in html_tags:
        print(tag)
    
    # Step 10: Clean up
    print(f"\n🧹 Step 9: Cleaning up...")
    try:
        shutil.rmtree(temp_dir)
        print("✅ Temporary directory removed")
    except Exception as e:
        print(f"⚠️  Warning: Could not remove temp directory: {e}")
    
    # Final summary
    print(f"\n✅ EXTRACTION AND ANALYSIS COMPLETE!")
    print("=" * 37)
    print(f"📊 Total files extracted: {len(all_files)}")
    print(f"📊 Icon files moved: {moved_count}")
    print(f"📊 Files skipped: {skipped_count}")
    print(f"📁 All icons are now in the public/ directory")
    print(f"📝 HTML meta tags generated above")
    print(f"🧪 Next: Update your index.html with the generated meta tags")
    print(f"🔄 Remove old external favicon URLs from HTML")
    
    # Save results to file
    results_file = 'icon_extraction_results.txt'
    with open(results_file, 'w') as f:
        f.write("ICON EXTRACTION RESULTS\n")
        f.write("=" * 23 + "\n\n")
        f.write(f"Total files extracted: {len(all_files)}\n")
        f.write(f"Icon files moved: {moved_count}\n\n")
        f.write("FILES IN PUBLIC/ DIRECTORY:\n")
        f.write("-" * 28 + "\n")
        for icon in public_icons:
            f.write(f"{icon['name']} - {icon['size_str']}\n")
        f.write("\nHTML META TAGS:\n")
        f.write("-" * 15 + "\n")
        for tag in html_tags:
            f.write(tag + "\n")
    
    print(f"📄 Detailed results saved to: {results_file}")

if __name__ == "__main__":
    main()