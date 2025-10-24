#!/usr/bin/env node

/**
 * OncoGraph Setup Script - Cross-Platform Compatibility Check
 * Ensures the application works on Windows, macOS, and Linux
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧬 OncoGraph Setup & Compatibility Check\n');

// Color codes for better output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const checkMark = '✅';
const crossMark = '❌';
const warningMark = '⚠️';

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function checkCommand(command, name) {
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    return { success: true, version: result.trim() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function checkFile(filePath, name) {
  try {
    const exists = fs.existsSync(filePath);
    return { exists, path: filePath };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

// System Information
log('📊 System Information:', 'blue');
log(`   Platform: ${process.platform}`);
log(`   Architecture: ${process.arch}`);
log(`   Node.js: ${process.version}`);
log(`   Working Directory: ${process.cwd()}\n`);

// Prerequisites Check
log('🔍 Prerequisites Check:', 'blue');

// Node.js Version Check
const nodeVersion = process.version;
const nodeVersionNum = parseFloat(nodeVersion.substring(1));
if (nodeVersionNum >= 16.0) {
  log(`${checkMark} Node.js: ${nodeVersion}`, 'green');
} else {
  log(`${crossMark} Node.js: ${nodeVersion} (Required: >=16.0.0)`, 'red');
}

// npm Version Check
const npmCheck = checkCommand('npm --version', 'npm');
if (npmCheck.success) {
  const npmVersionNum = parseFloat(npmCheck.version);
  if (npmVersionNum >= 8.0) {
    log(`${checkMark} npm: ${npmCheck.version}`, 'green');
  } else {
    log(`${warningMark} npm: ${npmCheck.version} (Recommended: >=8.0.0)`, 'yellow');
  }
} else {
  log(`${crossMark} npm: Not found`, 'red');
}

// Git Check
const gitCheck = checkCommand('git --version', 'git');
if (gitCheck.success) {
  log(`${checkMark} Git: ${gitCheck.version}`, 'green');
} else {
  log(`${crossMark} Git: Not found`, 'red');
}

log(''); // Empty line

// Project Structure Check
log('📁 Project Structure Check:', 'blue');

const requiredFiles = [
  'package.json',
  'src/App.tsx',
  'src/components/ChatMessage.tsx',
  'src/components/ChatInput.tsx',
  'src/components/KnowledgeGraphVisualization.tsx',
  'src/services/knowledgeGraphService.ts',
  'src/knowledge_graph_enhanced.json'
];

for (const file of requiredFiles) {
  const fileCheck = checkFile(file);
  if (fileCheck.exists) {
    log(`${checkMark} ${file}`, 'green');
  } else {
    log(`${crossMark} ${file}`, 'red');
  }
}

// Environment File Check
log(''); // Empty line
log('🔐 Environment Configuration:', 'blue');

const envCheck = checkFile('.env');
if (envCheck.exists) {
  log(`${checkMark} .env file exists`, 'green');
  
  // Check if API key is set
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    if (envContent.includes('VITE_OPENAI_API_KEY=') && !envContent.includes('your_openai_api_key_here')) {
      log(`${checkMark} OpenAI API key configured`, 'green');
    } else {
      log(`${warningMark} OpenAI API key not set properly`, 'yellow');
      log('   Please update VITE_OPENAI_API_KEY in .env file', 'yellow');
    }
  } catch (error) {
    log(`${warningMark} Could not read .env file`, 'yellow');
  }
} else {
  log(`${crossMark} .env file missing`, 'red');
  log('   Creating template .env file...', 'yellow');
  
  try {
    fs.writeFileSync('.env', 'VITE_OPENAI_API_KEY=your_openai_api_key_here\n');
    log(`${checkMark} Template .env file created`, 'green');
    log('   Please update with your actual OpenAI API key', 'yellow');
  } catch (error) {
    log(`${crossMark} Failed to create .env file: ${error.message}`, 'red');
  }
}

// Dependencies Check
log(''); // Empty line
log('📦 Dependencies Check:', 'blue');

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (fs.existsSync('node_modules')) {
    log(`${checkMark} node_modules directory exists`, 'green');
    
    // Check key dependencies
    const keyDeps = ['react', 'vite', 'd3', 'openai', 'tailwindcss'];
    for (const dep of keyDeps) {
      if (fs.existsSync(`node_modules/${dep}`)) {
        log(`${checkMark} ${dep} installed`, 'green');
      } else {
        log(`${crossMark} ${dep} missing`, 'red');
      }
    }
  } else {
    log(`${crossMark} node_modules not found`, 'red');
    log('   Run: npm install', 'yellow');
  }
} catch (error) {
  log(`${crossMark} Could not check dependencies: ${error.message}`, 'red');
}

// Platform-Specific Recommendations
log(''); // Empty line
log('🛠️ Platform-Specific Notes:', 'blue');

switch (process.platform) {
  case 'win32':
    log('   Windows detected:', 'yellow');
    log('   - Use PowerShell or Command Prompt as Administrator if needed');
    log('   - Ensure Windows Defender doesn\'t block npm operations');
    log('   - Alternative: npm run clean-win && npm install');
    break;
    
  case 'darwin':
    log('   macOS detected:', 'yellow');
    log('   - Install Xcode Command Line Tools: xcode-select --install');
    log('   - Consider using Homebrew: brew install node');
    log('   - May need to allow Node.js in Security & Privacy settings');
    break;
    
  case 'linux':
    log('   Linux detected:', 'yellow');
    log('   - Install build essentials: sudo apt install build-essential');
    log('   - Use official Node.js repositories for latest versions');
    log('   - Ensure proper permissions for npm global packages');
    break;
    
  default:
    log(`   Platform ${process.platform} detected`, 'yellow');
    log('   - Standard Node.js installation should work');
    break;
}

// Final Instructions
log(''); // Empty line
log('🚀 Next Steps:', 'blue');
log('1. Ensure all prerequisites are installed');
log('2. Set your OpenAI API key in the .env file');
log('3. Run: npm install (if dependencies are missing)');
log('4. Run: npm run dev');
log('5. Open: http://localhost:3000');

log(''); // Empty line
log('📞 Need Help?', 'blue');
log('- Check SETUP.md for detailed troubleshooting');
log('- Create an issue on GitHub with your system details');
log('- Include console errors and steps to reproduce');

log(''); // Empty line
log('✨ Ready to explore cancer biology with AI! 🧬', 'green');