import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('🔧 TESTING BASH COMMANDS FOR ICON EXTRACTION');
console.log('=============================================\n');

// Check if icon.zip exists
if (!existsSync('icon.zip')) {
    console.log('❌ icon.zip file not found!');
    process.exit(1);
}

console.log('✅ icon.zip file found\n');

// Test each command
const commands = [
    {
        cmd: 'unzip -l icon.zip',
        desc: 'Step 1: List contents of icon.zip'
    },
    {
        cmd: 'unzip -o icon.zip -d temp-icons/',
        desc: 'Step 2: Extract icon.zip to temp-icons/'
    },
    {
        cmd: 'ls -la temp-icons/',
        desc: 'Step 3: List contents of temp-icons/'
    },
    {
        cmd: 'find temp-icons -name "*.png" -o -name "*.ico" -o -name "*.svg" -o -name "*.webmanifest"',
        desc: 'Step 4: Find all icon files'
    },
    {
        cmd: 'cp temp-icons/* public/',
        desc: 'Step 5: Copy all files to public/'
    },
    {
        cmd: 'ls -la public/',
        desc: 'Step 6a: List all files in public/'
    },
    {
        cmd: 'ls -la public/ | grep -E "\\.(png|ico|svg|webmanifest)$"',
        desc: 'Step 6b: Filter icon files in public/'
    },
    {
        cmd: 'rm -rf temp-icons',
        desc: 'Step 7: Clean up temp-icons directory'
    }
];

for (let i = 0; i < commands.length; i++) {
    const { cmd, desc } = commands[i];
    
    console.log(`${desc}`);
    console.log('='.repeat(desc.length));
    console.log(`$ ${cmd}\n`);
    
    try {
        const output = execSync(cmd, { 
            encoding: 'utf8',
            stdio: ['inherit', 'pipe', 'pipe']
        });
        
        if (output && output.trim()) {
            console.log(output);
        } else {
            console.log('✅ Command executed successfully (no output)');
        }
        
    } catch (error) {
        console.log(`❌ Error executing command: ${error.message}`);
        
        if (error.stdout) {
            console.log('Output:', error.stdout);
        }
        
        // For some commands, continue even if they fail
        if (cmd.includes('grep') || cmd.includes('rm -rf')) {
            console.log('⚠️  Continuing despite error...');
        } else if (i < 4) { // Stop if early commands fail
            console.log('⚠️  Stopping due to critical error');
            break;
        }
    }
    
    console.log('\n' + '-'.repeat(50) + '\n');
}

console.log('✅ Command execution complete!');
console.log('Check the output above for extraction results.');