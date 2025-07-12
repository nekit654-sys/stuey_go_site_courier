import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function extractIcons() {
  try {
    console.log('🔍 Extracting and analyzing icon.zip...');
    console.log('=' .repeat(40));

    // Create extracted-icons directory
    if (!fs.existsSync('extracted-icons')) {
      fs.mkdirSync('extracted-icons');
    }

    // Try to extract using system unzip command
    try {
      const { stdout, stderr } = await execAsync('unzip -o icon.zip -d extracted-icons/');
      console.log('📦 Successfully extracted icon.zip');
      if (stdout) console.log(stdout);
    } catch (error) {
      console.log('⚠️  System unzip failed, trying manual extraction...');
      
      // Fallback: try to read the zip file manually
      const zipBuffer = fs.readFileSync('icon.zip');
      console.log(`📊 Zip file size: ${zipBuffer.length} bytes`);
      
      // For now, let's just note that we have the zip file
      console.log('📝 Zip file found and ready for extraction');
      
      // Let's see if we can find any existing icon files in the project
      console.log('\n🔍 Checking for existing icon files in project...');
      await findExistingIcons();
      
      return;
    }

    // Analyze extracted files
    await analyzeExtractedIcons();

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function findExistingIcons() {
  const iconExtensions = ['.png', '.jpg', '.jpeg', '.ico', '.svg', '.gif', '.webp'];
  const iconFiles = [];

  function scanDirectory(dir, relativePath = '') {
    try {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          scanDirectory(filePath, path.join(relativePath, file));
        } else if (stats.isFile()) {
          const ext = path.extname(file).toLowerCase();
          if (iconExtensions.includes(ext)) {
            iconFiles.push({
              name: file,
              path: path.join(relativePath, file),
              fullPath: filePath,
              size: stats.size,
              extension: ext
            });
          }
        }
      });
    } catch (error) {
      // Skip directories we can't read
    }
  }

  // Scan common directories
  ['public', 'src', '.'].forEach(dir => {
    if (fs.existsSync(dir)) {
      scanDirectory(dir, dir === '.' ? '' : dir);
    }
  });

  if (iconFiles.length > 0) {
    console.log('\n📁 EXISTING ICON FILES FOUND:');
    console.log('=' .repeat(30));
    
    iconFiles.forEach(file => {
      console.log(`📄 ${file.name}`);
      console.log(`   📍 Path: ${file.path}`);
      console.log(`   📊 Size: ${formatBytes(file.size)}`);
      console.log(`   🎨 Format: ${file.extension.replace('.', '').toUpperCase()}`);
      console.log('');
    });
  }

  return iconFiles;
}

async function analyzeExtractedIcons() {
  console.log('\n📁 ANALYZING EXTRACTED ICONS...');
  
  if (!fs.existsSync('extracted-icons')) {
    console.log('❌ No extracted-icons directory found');
    return;
  }

  const iconFiles = [];
  
  function analyzeDirectory(dir, relativePath = '') {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const fullRelativePath = path.join(relativePath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        analyzeDirectory(filePath, fullRelativePath);
      } else if (stats.isFile()) {
        const ext = path.extname(file).toLowerCase();
        const iconExtensions = ['.png', '.jpg', '.jpeg', '.ico', '.svg', '.gif', '.webp'];
        
        if (iconExtensions.includes(ext)) {
          const baseName = path.basename(file, ext);
          
          // Try to extract dimensions from filename
          const dimensionMatch = baseName.match(/(\d+)x(\d+)/) || baseName.match(/(\d+)/);
          const dimensions = dimensionMatch ? 
            (dimensionMatch[2] ? `${dimensionMatch[1]}x${dimensionMatch[2]}` : `${dimensionMatch[1]}x${dimensionMatch[1]}`) : 
            'Unknown';
          
          iconFiles.push({
            name: file,
            path: fullRelativePath,
            size: stats.size,
            extension: ext,
            dimensions: dimensions,
            baseName: baseName
          });
        }
      }
    });
  }

  analyzeDirectory('extracted-icons');

  if (iconFiles.length === 0) {
    console.log('❌ No icon files found in extracted directory');
    return;
  }

  // Sort by extension, then by dimensions
  iconFiles.sort((a, b) => {
    if (a.extension !== b.extension) {
      return a.extension.localeCompare(b.extension);
    }
    
    const aDim = parseInt(a.dimensions.split('x')[0]) || 0;
    const bDim = parseInt(b.dimensions.split('x')[0]) || 0;
    return aDim - bDim;
  });

  console.log('\n📄 EXTRACTED ICON FILES:');
  console.log('=' .repeat(25));

  iconFiles.forEach(file => {
    console.log(`📄 ${file.name}`);
    console.log(`   📍 Path: ${file.path}`);
    console.log(`   📏 Dimensions: ${file.dimensions}`);
    console.log(`   📊 Size: ${formatBytes(file.size)}`);
    console.log(`   🎨 Format: ${file.extension.replace('.', '').toUpperCase()}`);
    console.log('');
  });

  // Generate usage recommendations
  generateUsageRecommendations(iconFiles);
  
  // Generate HTML tags
  generateHTMLTags(iconFiles);
}

function generateUsageRecommendations(iconFiles) {
  console.log('\n🎯 USAGE RECOMMENDATIONS:');
  console.log('=' .repeat(26));

  iconFiles.forEach(file => {
    const usage = getIconUsage(file.dimensions, file.extension, file.baseName);
    console.log(`🔸 ${file.name} (${file.dimensions})`);
    usage.forEach(use => {
      console.log(`   • ${use}`);
    });
    console.log('');
  });
}

function generateHTMLTags(iconFiles) {
  console.log('\n📝 RECOMMENDED HTML META TAGS:');
  console.log('=' .repeat(31));

  const htmlTags = [];

  iconFiles.forEach(file => {
    const dim = file.dimensions;
    const ext = file.extension;
    const filePath = file.path;

    if (ext === '.ico') {
      htmlTags.push(`<link rel="icon" type="image/x-icon" href="/${filePath}">`);
    }

    if (ext === '.png' && dim !== 'Unknown') {
      const size = dim.split('x')[0];

      // Standard favicons
      if (['16', '32', '48', '64'].includes(size)) {
        htmlTags.push(`<link rel="icon" type="image/png" sizes="${dim}" href="/${filePath}">`);
      }

      // Apple touch icons
      if (['120', '144', '152', '180'].includes(size)) {
        htmlTags.push(`<link rel="apple-touch-icon" sizes="${dim}" href="/${filePath}">`);
      }

      // Android Chrome icons
      if (['192', '512'].includes(size)) {
        htmlTags.push(`<link rel="icon" type="image/png" sizes="${dim}" href="/${filePath}">`);
      }
    }
  });

  // Remove duplicates
  const uniqueTags = [...new Set(htmlTags)];
  uniqueTags.forEach(tag => {
    console.log(tag);
  });

  console.log(`\n✅ Analysis complete!`);
  console.log(`📊 Total icons found: ${iconFiles.length}`);
}

function getIconUsage(dimensions, extension, baseName) {
  const usage = [];
  const dim = dimensions;
  const ext = extension;
  const name = baseName.toLowerCase();

  // Standard favicon sizes
  if (dim === '16x16') {
    if (ext === '.ico') {
      usage.push('Standard favicon (favicon.ico)');
    } else if (ext === '.png') {
      usage.push('PNG favicon 16x16');
    }
  }

  if (dim === '32x32' && ext === '.png') {
    usage.push('PNG favicon 32x32');
  }

  if (dim === '48x48' && ext === '.png') {
    usage.push('PNG favicon 48x48');
  }

  // Apple Touch Icons
  if (dim === '120x120' && ext === '.png') {
    usage.push('Apple Touch Icon (iPhone)');
  }

  if (dim === '144x144' && ext === '.png') {
    usage.push('Apple Touch Icon (iPad)');
    usage.push('Windows tile (144x144)');
  }

  if (dim === '152x152' && ext === '.png') {
    usage.push('Apple Touch Icon (iPad)');
  }

  if (dim === '180x180' && ext === '.png') {
    usage.push('Apple Touch Icon (iPhone/iPad)');
  }

  // Android Chrome icons
  if (dim === '192x192' && ext === '.png') {
    usage.push('Android Chrome icon (192x192)');
    usage.push('Web App Manifest icon');
  }

  if (dim === '512x512' && ext === '.png') {
    usage.push('Android Chrome icon (512x512)');
    usage.push('Web App Manifest icon');
  }

  // Generic usage based on size
  try {
    const size = parseInt(dim.split('x')[0]) || 0;
    if (size >= 512) {
      usage.push('High-resolution app icon');
    } else if (size >= 192) {
      usage.push('Standard app icon');
    } else if (size >= 64) {
      usage.push('Medium app icon');
    } else if (size >= 16) {
      usage.push('Small app icon');
    }
  } catch (e) {
    // Ignore parsing errors
  }

  if (usage.length === 0) {
    usage.push('General purpose icon');
  }

  return usage;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

extractIcons();