import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🔍 DIRECT ICON EXTRACTION');
console.log('=========================\n');

// Check if icon.zip exists
if (!fs.existsSync('icon.zip')) {
    console.log('❌ icon.zip file not found!');
    process.exit(1);
}

const zipStats = fs.statSync('icon.zip');
console.log(`📦 Found icon.zip (${(zipStats.size / 1024).toFixed(2)} KB)\n`);

try {
    // Step 1: Create temp directory
    console.log('📁 Step 1: Creating temporary directory...');
    if (!fs.existsSync('temp-icons')) {
        fs.mkdirSync('temp-icons');
    }
    console.log('✅ Created temp-icons directory\n');

    // Step 2: Extract using system unzip
    console.log('📦 Step 2: Extracting icon.zip...');
    try {
        const output = execSync('unzip -o icon.zip -d temp-icons/', { encoding: 'utf8' });
        console.log('✅ Extraction completed successfully\n');
        if (output.trim()) {
            console.log('Extraction details:');
            console.log(output);
        }
    } catch (error) {
        console.log('⚠️  System unzip failed, trying manual approach...');
        console.log('Please extract icon.zip manually into temp-icons/ directory\n');
        // We'll continue anyway to check if there are files
    }

    // Step 3: List extracted files
    console.log('📋 Step 3: Listing extracted files...');
    console.log('EXTRACTED FILES AND SIZES:');
    console.log('==========================');

    const extractedFiles = [];

    function scanDirectory(dir) {
        try {
            const items = fs.readdirSync(dir);
            for (const item of items) {
                const itemPath = path.join(dir, item);
                const stats = fs.statSync(itemPath);
                
                if (stats.isDirectory()) {
                    scanDirectory(itemPath);
                } else {
                    const size = (stats.size / 1024).toFixed(2) + ' KB';
                    extractedFiles.push({
                        name: item,
                        path: itemPath,
                        size: size,
                        bytes: stats.size
                    });
                    console.log(`📄 ${item} - ${size}`);
                }
            }
        } catch (error) {
            console.log(`⚠️  Could not read directory ${dir}: ${error.message}`);
        }
    }

    if (fs.existsSync('temp-icons')) {
        scanDirectory('temp-icons');
    }

    if (extractedFiles.length === 0) {
        console.log('❌ No files found in temp-icons directory');
        console.log('Please extract icon.zip manually and run this script again');
        process.exit(1);
    }

    // Step 4: Identify icon files
    console.log('\n🎨 Step 4: Identifying icon and config files...');
    
    const iconExtensions = ['.png', '.ico', '.svg', '.webp', '.gif', '.jpg', '.jpeg'];
    const configExtensions = ['.webmanifest', '.json', '.xml', '.txt'];
    
    const iconFiles = extractedFiles.filter(file => 
        iconExtensions.includes(path.extname(file.name).toLowerCase())
    );
    
    const configFiles = extractedFiles.filter(file => 
        configExtensions.includes(path.extname(file.name).toLowerCase())
    );

    console.log('ICON FILES FOUND:');
    console.log('=================');
    iconFiles.forEach(file => {
        console.log(`🔸 ${file.name} (${file.size})`);
    });

    if (configFiles.length > 0) {
        console.log('\nCONFIG FILES FOUND:');
        console.log('===================');
        configFiles.forEach(file => {
            console.log(`📄 ${file.name} (${file.size})`);
        });
    }

    // Step 5: Move files to public directory
    console.log(`\n📁 Step 5: Moving ${iconFiles.length + configFiles.length} files to public/ directory...`);

    const allFiles = [...iconFiles, ...configFiles];
    let movedCount = 0;
    let skippedCount = 0;

    allFiles.forEach(file => {
        const targetPath = path.join('public', file.name);
        
        // Skip favicon.svg if it already exists
        if (file.name === 'favicon.svg' && fs.existsSync(targetPath)) {
            console.log(`⚠️  Skipped ${file.name} (preserving existing)`);
            skippedCount++;
        } else {
            try {
                fs.copyFileSync(file.path, targetPath);
                console.log(`✅ Moved ${file.name} to public/`);
                movedCount++;
            } catch (error) {
                console.log(`❌ Failed to move ${file.name}: ${error.message}`);
            }
        }
    });

    // Step 6: List final public directory
    console.log('\n📂 Step 6: Final public/ directory contents...');
    console.log('ICON AND CONFIG FILES IN PUBLIC/:');
    console.log('=================================');

    const publicFiles = fs.readdirSync('public');
    const relevantFiles = publicFiles.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return iconExtensions.includes(ext) || configExtensions.includes(ext);
    });

    relevantFiles.sort().forEach(file => {
        const filePath = path.join('public', file);
        const stats = fs.statSync(filePath);
        const size = (stats.size / 1024).toFixed(2) + ' KB';
        console.log(`📄 ${file} - ${size}`);
    });

    // Step 7: Analyze icon purposes
    console.log('\n🎯 Step 7: Icon usage analysis...');
    console.log('ICON USAGE BY PURPOSE:');
    console.log('======================');

    relevantFiles.forEach(file => {
        const name = file.toLowerCase();
        let purpose = 'General purpose icon';

        if (name === 'favicon.ico') {
            purpose = 'Legacy browser support (IE, older browsers)';
        } else if (name === 'favicon.svg') {
            purpose = 'Modern scalable favicon (supports dark mode)';
        } else if (name.includes('favicon-16x16')) {
            purpose = 'Standard favicon 16x16 - Browser tabs';
        } else if (name.includes('favicon-32x32')) {
            purpose = 'Standard favicon 32x32 - Desktop browsers';
        } else if (name.includes('favicon-48x48')) {
            purpose = 'High-DPI favicon 48x48 - Retina displays';
        } else if (name.includes('apple-touch-icon-120x120')) {
            purpose = 'Apple Touch Icon 120x120 - iPhone';
        } else if (name.includes('apple-touch-icon-144x144')) {
            purpose = 'Apple Touch Icon 144x144 - iPad';
        } else if (name.includes('apple-touch-icon-152x152')) {
            purpose = 'Apple Touch Icon 152x152 - iPad Retina';
        } else if (name.includes('apple-touch-icon-180x180')) {
            purpose = 'Apple Touch Icon 180x180 - iPhone 6+ and newer';
        } else if (name.includes('apple-touch-icon')) {
            purpose = 'Apple Touch Icon - iOS homescreen';
        } else if (name.includes('android-chrome-192x192')) {
            purpose = 'Android Chrome icon 192x192 - Homescreen';
        } else if (name.includes('android-chrome-512x512')) {
            purpose = 'Android Chrome icon 512x512 - High-res/PWA';
        } else if (name.includes('icon-192x192')) {
            purpose = 'PWA icon 192x192 - Web App Manifest';
        } else if (name.includes('icon-512x512')) {
            purpose = 'PWA icon 512x512 - Web App Manifest';
        } else if (name.includes('mstile-144x144')) {
            purpose = 'Windows tile 144x144 - Medium tile';
        } else if (name.includes('mstile-270x270')) {
            purpose = 'Windows tile 270x270 - Large tile';
        } else if (name.includes('mstile')) {
            purpose = 'Windows tile icon';
        } else if (name === 'site.webmanifest') {
            purpose = 'PWA Web App Manifest';
        } else if (name === 'manifest.json') {
            purpose = 'PWA Manifest JSON';
        } else if (name === 'browserconfig.xml') {
            purpose = 'Windows browser configuration';
        }

        const filePath = path.join('public', file);
        const stats = fs.statSync(filePath);
        const size = (stats.size / 1024).toFixed(2) + ' KB';
        
        console.log(`🔸 ${file} (${size}) - ${purpose}`);
    });

    // Step 8: Generate HTML meta tags
    console.log('\n📝 Step 8: Generating HTML meta tags...');
    console.log('COMPLETE HTML FAVICON SETUP:');
    console.log('============================');
    console.log('<!-- Replace lines 63-66 in your index.html with these tags -->');

    const htmlTags = [];

    // Check for each type of icon
    if (relevantFiles.includes('favicon.ico')) {
        htmlTags.push('<link rel="icon" type="image/x-icon" href="/favicon.ico">');
    }

    if (relevantFiles.includes('favicon.svg')) {
        htmlTags.push('<link rel="icon" type="image/svg+xml" href="/favicon.svg">');
    }

    // Standard PNG favicons
    [16, 32, 48].forEach(size => {
        const patterns = [`favicon-${size}x${size}.png`, `icon-${size}x${size}.png`];
        for (const pattern of patterns) {
            if (relevantFiles.includes(pattern)) {
                htmlTags.push(`<link rel="icon" type="image/png" sizes="${size}x${size}" href="/${pattern}">`);
                break;
            }
        }
    });

    // Apple Touch Icons
    [120, 144, 152, 180].forEach(size => {
        const patterns = [`apple-touch-icon-${size}x${size}.png`, 'apple-touch-icon.png'];
        for (const pattern of patterns) {
            if (relevantFiles.includes(pattern)) {
                htmlTags.push(`<link rel="apple-touch-icon" sizes="${size}x${size}" href="/${pattern}">`);
                break;
            }
        }
    });

    // Android/Chrome icons
    [192, 512].forEach(size => {
        const patterns = [`android-chrome-${size}x${size}.png`, `icon-${size}x${size}.png`];
        for (const pattern of patterns) {
            if (relevantFiles.includes(pattern)) {
                htmlTags.push(`<link rel="icon" type="image/png" sizes="${size}x${size}" href="/${pattern}">`);
                break;
            }
        }
    });

    // Windows tiles
    if (relevantFiles.includes('mstile-144x144.png')) {
        htmlTags.push('<meta name="msapplication-TileImage" content="/mstile-144x144.png">');
        htmlTags.push('<meta name="msapplication-TileColor" content="#f97316">');
    }

    // Web manifest
    if (relevantFiles.includes('site.webmanifest')) {
        htmlTags.push('<link rel="manifest" href="/site.webmanifest">');
    } else if (relevantFiles.includes('manifest.json')) {
        htmlTags.push('<link rel="manifest" href="/manifest.json">');
    }

    htmlTags.forEach(tag => console.log(tag));

    // Step 9: Clean up
    console.log('\n🧹 Step 9: Cleaning up...');
    try {
        fs.rmSync('temp-icons', { recursive: true, force: true });
        console.log('✅ Temporary directory removed');
    } catch (error) {
        console.log(`⚠️  Warning: Could not remove temp directory: ${error.message}`);
    }

    // Final summary
    console.log('\n✅ EXTRACTION AND ANALYSIS COMPLETE!');
    console.log('====================================');
    console.log(`📊 Total files extracted: ${extractedFiles.length}`);
    console.log(`📊 Icon/config files moved: ${movedCount}`);
    console.log(`📊 Files skipped: ${skippedCount}`);
    console.log(`📁 All icons are now in: ${path.resolve('public')}/`);
    console.log('📝 HTML meta tags generated above');
    console.log('🔄 Next: Remove external favicon URLs from index.html');
    console.log('🧪 Test: Verify icons work in different browsers');

    // Save summary to file
    const summary = {
        timestamp: new Date().toISOString(),
        totalExtracted: extractedFiles.length,
        filesMoved: movedCount,
        filesSkipped: skippedCount,
        iconFiles: relevantFiles,
        htmlTags: htmlTags
    };

    fs.writeFileSync('icon-extraction-summary.json', JSON.stringify(summary, null, 2));
    console.log('📄 Summary saved to: icon-extraction-summary.json');

} catch (error) {
    console.error('❌ Fatal error during extraction:', error.message);
    process.exit(1);
}