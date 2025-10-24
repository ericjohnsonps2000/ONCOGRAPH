#!/usr/bin/env node

/**
 * OncoGraph Quick Test Script
 * Verifies that the application is working correctly
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 OncoGraph Quick Test Suite\n');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

// Test 1: Check if knowledge graph data is valid JSON
log('📊 Testing Knowledge Graph Data:', 'blue');

try {
  const kgPath = 'src/knowledge_graph_enhanced.json';
  if (fs.existsSync(kgPath)) {
    const kgData = JSON.parse(fs.readFileSync(kgPath, 'utf8'));
    
    // Validate structure
    const requiredFields = ['nodes', 'edges', 'meta'];
    const hasAllFields = requiredFields.every(field => field in kgData);
    
    if (hasAllFields) {
      log(`✅ Knowledge graph structure valid`, 'green');
      log(`   - Nodes: ${kgData.nodes?.length || 0}`, 'green');
      log(`   - Edges: ${kgData.edges?.length || 0}`, 'green');
      log(`   - Version: ${kgData.meta?.version || 'Unknown'}`, 'green');
    } else {
      log(`❌ Knowledge graph structure invalid`, 'red');
    }
  } else {
    log(`❌ Knowledge graph file not found`, 'red');
  }
} catch (error) {
  log(`❌ Knowledge graph JSON parse error: ${error.message}`, 'red');
}

// Test 2: Check TypeScript compilation
log('\n🔧 Testing TypeScript Compilation:', 'blue');

try {
  const { execSync } = require('child_process');
  
  // Check if TypeScript can compile without errors
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  log(`✅ TypeScript compilation successful`, 'green');
} catch (error) {
  log(`❌ TypeScript compilation failed`, 'red');
  log(`   Error: ${error.message}`, 'red');
}

// Test 3: Check key React components
log('\n⚛️ Testing React Components:', 'blue');

const components = [
  'src/App.tsx',
  'src/components/ChatMessage.tsx',
  'src/components/ChatInput.tsx',
  'src/components/KnowledgeGraphVisualization.tsx'
];

for (const component of components) {
  if (fs.existsSync(component)) {
    try {
      const content = fs.readFileSync(component, 'utf8');
      
      // Basic checks
      const hasImport = content.includes('import');
      const hasExport = content.includes('export') || content.includes('default');
      const hasJSX = content.includes('<') && content.includes('>');
      
      if (hasImport && hasExport && hasJSX) {
        log(`✅ ${component}`, 'green');
      } else {
        log(`⚠️ ${component} - potential issues`, 'yellow');
      }
    } catch (error) {
      log(`❌ ${component} - read error`, 'red');
    }
  } else {
    log(`❌ ${component} - not found`, 'red');
  }
}

// Test 4: Check package.json dependencies
log('\n📦 Testing Dependencies:', 'blue');

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['react', 'react-dom', 'vite', 'd3', 'openai', 'tailwindcss'];
  
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  for (const dep of requiredDeps) {
    if (allDeps[dep]) {
      log(`✅ ${dep}: ${allDeps[dep]}`, 'green');
    } else {
      log(`❌ ${dep}: missing`, 'red');
    }
  }
} catch (error) {
  log(`❌ Package.json error: ${error.message}`, 'red');
}

// Test 5: Environment configuration
log('\n🔐 Testing Environment Configuration:', 'blue');

if (fs.existsSync('.env')) {
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    
    if (envContent.includes('VITE_OPENAI_API_KEY=')) {
      const hasValidKey = !envContent.includes('your_openai_api_key_here');
      if (hasValidKey) {
        log(`✅ OpenAI API key configured`, 'green');
      } else {
        log(`⚠️ OpenAI API key needs to be set`, 'yellow');
      }
    } else {
      log(`❌ VITE_OPENAI_API_KEY not found in .env`, 'red');
    }
  } catch (error) {
    log(`❌ .env file error: ${error.message}`, 'red');
  }
} else {
  log(`⚠️ .env file not found (will use defaults)`, 'yellow');
}

// Summary
log('\n📋 Test Summary:', 'blue');
log('If all tests pass, your OncoGraph app should work correctly!');
log('If there are errors, check SETUP.md for troubleshooting steps.');
log('\nTo start the app: npm run dev');
log('To run setup check: npm run setup-check');

console.log('\n🧬 Happy cancer biology exploration! ✨');