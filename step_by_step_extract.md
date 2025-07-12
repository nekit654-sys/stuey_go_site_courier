# Step-by-Step Icon Extraction Commands

Let me extract the icon.zip file step by step using individual bash commands:

## Step 1: Create temporary directory
```bash
mkdir -p temp-icons
```

## Step 2: Extract the zip file
```bash
unzip -o icon.zip -d temp-icons/
```

## Step 3: List extracted files with sizes
```bash
find temp-icons -type f -exec ls -lah {} \;
```

## Step 4: Show just the filenames and sizes
```bash
find temp-icons -type f -exec du -h {} \;
```

## Step 5: Move icon files to public directory
```bash
find temp-icons -type f \( -name "*.png" -o -name "*.ico" -o -name "*.svg" \) -exec cp {} public/ \;
```

## Step 6: List final public directory contents
```bash
ls -lah public/*.png public/*.ico public/*.svg public/*.webmanifest public/*.json 2>/dev/null || echo "Some file types not found"
```

## Step 7: Clean up
```bash
rm -rf temp-icons/
```

Let me execute these commands one by one...