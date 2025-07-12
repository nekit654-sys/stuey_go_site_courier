#!/usr/bin/env python3

import os
import zipfile
import shutil
import subprocess
from pathlib import Path

def run_command(cmd, description):
    print(f"\n{description}")
    print("=" * len(description))
    print(f"$ {cmd}\n")
    
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.stdout:
            print(result.stdout)
        if result.stderr and result.returncode != 0:
            print(f"Error: {result.stderr}")
        return result.returncode == 0
    except Exception as e:
        print(f"Error executing command: {e}")
        return False

def main():
    print("🔧 EXECUTING BASH COMMANDS FOR ICON EXTRACTION")
    print("==============================================")
    
    # Check if icon.zip exists
    if not os.path.exists('icon.zip'):
        print("\n❌ icon.zip file not found!")
        return
    
    zip_size = os.path.getsize('icon.zip')
    print(f"\n✅ Found icon.zip ({zip_size / 1024:.2f} KB)")
    
    # Step 1: List contents of zip file
    run_command('unzip -l icon.zip', 'Step 1: List contents of icon.zip')
    
    # Step 2: Extract to temp directory
    success = run_command('unzip -o icon.zip -d temp-icons/', 'Step 2: Extract icon.zip to temp-icons/')
    
    if not success:
        print("❌ Extraction failed with unzip command, trying Python zipfile...")
        try:
            with zipfile.ZipFile('icon.zip', 'r') as zip_ref:
                zip_ref.extractall('temp-icons')
            print("✅ Extracted using Python zipfile module")
        except Exception as e:
            print(f"❌ Python extraction also failed: {e}")
            return
    
    # Step 3: List extracted files
    run_command('ls -la temp-icons/', 'Step 3: List contents of temp-icons/')
    
    # Step 4: Find specific icon files
    run_command('find temp-icons -name "*.png" -o -name "*.ico" -o -name "*.svg" -o -name "*.webmanifest"', 
               'Step 4: Find all icon files')
    
    # Step 5: Copy files to public (with Python fallback)
    print("\nStep 5: Copy all files to public/")
    print("=================================")
    print("$ cp temp-icons/* public/\n")
    
    success = run_command('cp temp-icons/* public/', 'Copying with cp command')
    
    if not success:
        print("❌ cp command failed, using Python to copy files...")
        try:
            # Ensure public directory exists
            os.makedirs('public', exist_ok=True)
            
            # Copy files manually
            temp_path = Path('temp-icons')
            public_path = Path('public')
            
            copied_count = 0
            for file_path in temp_path.rglob('*'):
                if file_path.is_file():
                    dest_path = public_path / file_path.name
                    shutil.copy2(file_path, dest_path)
                    print(f"✅ Copied {file_path.name}")
                    copied_count += 1
            
            print(f"✅ Copied {copied_count} files using Python")
            
        except Exception as e:
            print(f"❌ Python copy also failed: {e}")
    
    # Step 6: Verify icons in public directory
    run_command('ls -la public/ | grep -E "\\.(png|ico|svg|webmanifest)$"', 
               'Step 6: Verify icons are in public/')
    
    # Alternative verification using Python
    print("\nStep 6b: Python verification of icon files")
    print("==========================================")
    
    try:
        public_path = Path('public')
        if public_path.exists():
            icon_extensions = {'.png', '.ico', '.svg', '.webmanifest', '.json', '.xml'}
            icon_files = [f for f in public_path.iterdir() 
                         if f.is_file() and f.suffix.lower() in icon_extensions]
            
            if icon_files:
                for icon_file in sorted(icon_files):
                    size_kb = icon_file.stat().st_size / 1024
                    print(f"📄 {icon_file.name} - {size_kb:.2f} KB")
            else:
                print("❌ No icon files found in public/ directory")
        else:
            print("❌ public/ directory does not exist")
            
    except Exception as e:
        print(f"❌ Error checking public directory: {e}")
    
    # Step 7: Clean up temp directory
    run_command('rm -rf temp-icons', 'Step 7: Clean up temp-icons directory')
    
    # Python fallback for cleanup
    try:
        if os.path.exists('temp-icons'):
            shutil.rmtree('temp-icons')
            print("✅ Cleanup completed with Python")
    except Exception as e:
        print(f"⚠️  Cleanup warning: {e}")
    
    print("\n✅ EXTRACTION COMPLETE!")
    print("=======================")
    print("All commands have been executed.")
    print("Check the output above to see what icon files are now available.")

if __name__ == "__main__":
    main()