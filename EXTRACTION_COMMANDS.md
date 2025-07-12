# 🔧 Icon.zip Extraction Commands

Here are the exact bash commands to extract and analyze your icon.zip file:

## Step 1: Create temporary directory
```bash
mkdir -p temp-icons
```

## Step 2: Extract the zip file
```bash
unzip -o icon.zip -d temp-icons/
```

## Step 3: List all extracted files with sizes
```bash
echo "📋 EXTRACTED FILES:"
echo "=================="
find temp-icons -type f -exec ls -lah {} \; | while read line; do
    size=$(echo "$line" | awk '{print $5}')
    filename=$(echo "$line" | awk '{print $NF}')
    basename_file=$(basename "$filename")
    echo "📄 $basename_file - $size"
done
```

## Step 4: Show directory structure
```bash
echo "📂 DIRECTORY STRUCTURE:"
echo "======================"
find temp-icons -type f | sort
```

## Step 5: Move icon files to public directory
```bash
echo "📁 Moving icon files to public/..."
find temp-icons -type f \( -name "*.png" -o -name "*.ico" -o -name "*.svg" -o -name "*.webmanifest" -o -name "*.json" -o -name "*.xml" \) | while read file; do
    basename_file=$(basename "$file")
    if [ "$basename_file" = "favicon.svg" ] && [ -f "public/favicon.svg" ]; then
        echo "⚠️  Skipped $basename_file (preserving existing)"
    else
        cp "$file" "public/"
        echo "✅ Moved $basename_file to public/"
    fi
done
```

## Step 6: List final public directory contents
```bash
echo "📂 ICONS NOW IN PUBLIC/:"
echo "========================"
ls -lah public/ | grep -E '\.(png|ico|svg|webmanifest|json|xml)$' | while read line; do
    size=$(echo "$line" | awk '{print $5}')
    filename=$(echo "$line" | awk '{print $NF}')
    echo "📄 $filename - $size"
done
```

## Step 7: Clean up temporary directory
```bash
rm -rf temp-icons/
echo "✅ Cleaned up temporary files"
```

## Alternative: One-line extraction
If you want to do it all at once:
```bash
mkdir -p temp-icons && unzip -o icon.zip -d temp-icons/ && find temp-icons -type f \( -name "*.png" -o -name "*.ico" -o -name "*.svg" -o -name "*.webmanifest" -o -name "*.json" \) -exec cp {} public/ \; && rm -rf temp-icons/ && echo "✅ Extraction complete!"
```

## Expected Results

After extraction, you should have files like:
- `favicon.ico` - Legacy browser support
- `favicon-16x16.png` - Standard small favicon
- `favicon-32x32.png` - Standard favicon  
- `favicon-48x48.png` - High-DPI favicon
- `apple-touch-icon-*.png` - iOS homescreen icons
- `android-chrome-*.png` - Android homescreen icons
- `mstile-*.png` - Windows tile icons
- `site.webmanifest` - PWA manifest

## Generated HTML Meta Tags

Based on the extracted files, replace lines 63-66 in your `index.html` with:

```html
<!-- Favicons and App Icons -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">

<!-- Standard PNG favicons -->
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">

<!-- Apple Touch Icons -->
<link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png">
<link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon-144x144.png">
<link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png">

<!-- Android/Chrome icons -->
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">

<!-- Windows tiles -->
<meta name="msapplication-TileImage" content="/mstile-144x144.png">
<meta name="msapplication-TileColor" content="#f97316">

<!-- Web App Manifest -->
<link rel="manifest" href="/site.webmanifest">
```

## Remove External URLs

Delete these lines from your `index.html`:
```html
<!-- DELETE THESE LINES -->
<link rel="icon" type="image/png" href="https://cdn.poehali.dev/files/2d5020d6-c707-489d-b281-9f7664f47238.png" />
<link rel="apple-touch-icon" href="https://cdn.poehali.dev/files/2d5020d6-c707-489d-b281-9f7664f47238.png" />
<link rel="icon" type="image/png" sizes="32x32" href="https://cdn.poehali.dev/files/2d5020d6-c707-489d-b281-9f7664f47238.png" />
<link rel="icon" type="image/png" sizes="16x16" href="https://cdn.poehali.dev/files/2d5020d6-c707-489d-b281-9f7664f47238.png" />
```

## Verification

After setup, test that:
1. Browser tabs show the correct favicon
2. iOS "Add to Home Screen" shows the correct icon
3. Android "Add to Home Screen" shows the correct icon
4. Windows "Pin to Start" shows the correct tile

Run these commands in your terminal to complete the extraction and setup!