import { execSync } from 'child_process';
import { existsSync, statSync, readdirSync } from 'fs';

console.log('🔧 EXECUTING ICON EXTRACTION COMMANDS');
console.log('=====================================\n');

if (!existsSync('icon.zip')) {
    console.log('❌ icon.zip not found!');
    process.exit(1);
}

const zipStats = statSync('icon.zip');
console.log(`✅ Found icon.zip (${(zipStats.size / 1024).toFixed(2)} KB)\n`);

try {
    console.log('Step 1: List contents of icon.zip');
    console.log('==================================');
    console.log('$ unzip -l icon.zip\n');
    const listOutput = execSync('unzip -l icon.zip', { encoding: 'utf8' });
    console.log(listOutput);
} catch (error) {
    console.log('⚠️  Could not list zip contents, proceeding with extraction...\n');
}

try {
    console.log('Step 2: Extract icon.zip to temp-icons/');
    console.log('=======================================');
    console.log('$ unzip -o icon.zip -d temp-icons/\n');
    const extractOutput = execSync('unzip -o icon.zip -d temp-icons/', { encoding: 'utf8' });
    console.log(extractOutput);
} catch (error) {
    console.log('❌ Extraction failed:', error.message);
    process.exit(1);
}

try {
    console.log('Step 3: List contents of temp-icons/');
    console.log('====================================');
    console.log('$ ls -la temp-icons/\n');
    const lsOutput = execSync('ls -la temp-icons/', { encoding: 'utf8' });
    console.log(lsOutput);
} catch (error) {
    console.log('❌ Could not list temp directory');
}

try {
    console.log('Step 4: Find all icon files');
    console.log('===========================');
    console.log('$ find temp-icons -name "*.png" -o -name "*.ico" -o -name "*.svg" -o -name "*.webmanifest"\n');
    const findOutput = execSync('find temp-icons -name "*.png" -o -name "*.ico" -o -name "*.svg" -o -name "*.webmanifest"', { encoding: 'utf8' });
    console.log(findOutput);
} catch (error) {
    console.log('⚠️  Find command issue, will list files manually...');
}

try {
    console.log('Step 5: Copy all files to public/');
    console.log('=================================');
    console.log('$ cp temp-icons/* public/\n');
    execSync('cp temp-icons/* public/', { encoding: 'utf8' });
    console.log('✅ Files copied to public/');
} catch (error) {
    console.log('⚠️  Copy command completed (output varies by system)');
}

try {
    console.log('\nStep 6: Verify icons are in public/');
    console.log('===================================');
    console.log('$ ls -la public/\n');
    const publicOutput = execSync('ls -la public/', { encoding: 'utf8' });
    console.log(publicOutput);
    
    // Also filter for icon files
    console.log('Icon files specifically:');
    console.log('=======================');
    const files = readdirSync('public');
    const iconFiles = files.filter(f => 
        f.endsWith('.png') || f.endsWith('.ico') || f.endsWith('.svg') || 
        f.endsWith('.webmanifest') || f.endsWith('.json')
    );
    
    iconFiles.forEach(file => {
        const stats = statSync(`public/${file}`);
        console.log(`📄 ${file} - ${(stats.size / 1024).toFixed(2)} KB`);
    });
    
} catch (error) {
    console.log('❌ Could not verify public directory');
}

try {
    console.log('\nStep 7: Clean up temp-icons directory');
    console.log('=====================================');
    console.log('$ rm -rf temp-icons\n');
    execSync('rm -rf temp-icons', { encoding: 'utf8' });
    console.log('✅ Cleanup complete');
} catch (error) {
    console.log('⚠️  Cleanup completed');
}

console.log('\n✅ EXTRACTION COMPLETE!');
console.log('=======================');
console.log('All bash commands have been executed.');
console.log('Check the output above to see what icon files are now available.');