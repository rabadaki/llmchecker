#!/usr/bin/env node

/**
 * Environment Setup Helper
 * Helps create .env files and configure Vercel environment variables
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function print(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function prompt(question) {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    readline.question(question, (answer) => {
      readline.close();
      resolve(answer);
    });
  });
}

async function main() {
  print('\n🔧 LLM Checker Environment Setup', 'blue');
  print('================================\n', 'blue');

  // Check if .env.local exists
  const envPath = path.join(process.cwd(), '.env.local');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  if (!fs.existsSync(envPath)) {
    print('No .env.local file found. Creating from template...', 'yellow');
    
    // Create .env.example if it doesn't exist
    if (!fs.existsSync(envExamplePath)) {
      const envTemplate = `# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Base URL for sharing
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Google Analytics (optional)
NEXT_PUBLIC_GA_ID=your_ga_id_here
`;
      fs.writeFileSync(envExamplePath, envTemplate);
      print('Created .env.example template', 'green');
    }
    
    // Copy to .env.local
    fs.copyFileSync(envExamplePath, envPath);
    print('Created .env.local - Please update with your values', 'yellow');
  }

  // Check if we should set up Vercel env vars
  const setupVercel = await prompt('\nDo you want to set up Vercel environment variables? (y/n): ');
  
  if (setupVercel.toLowerCase() === 'y') {
    print('\nSetting up Vercel environment variables...', 'blue');
    
    // Read current .env.local
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      if (line && !line.startsWith('#') && line.includes('=')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        if (value && value !== 'your_' + key.toLowerCase() + '_here') {
          envVars[key.trim()] = value;
        }
      }
    });

    // Check if Vercel CLI is available
    try {
      execSync('vercel --version', { stdio: 'ignore' });
    } catch {
      print('Vercel CLI not found. Please install it first: npm i -g vercel', 'red');
      process.exit(1);
    }

    // Set each environment variable
    for (const [key, value] of Object.entries(envVars)) {
      if (key.startsWith('NEXT_PUBLIC_') || key === 'NODE_ENV') {
        try {
          print(`Setting ${key}...`, 'yellow');
          
          // Set for all environments
          execSync(`vercel env add ${key} production`, {
            input: value + '\n',
            stdio: ['pipe', 'pipe', 'pipe']
          });
          execSync(`vercel env add ${key} preview`, {
            input: value + '\n',
            stdio: ['pipe', 'pipe', 'pipe']
          });
          execSync(`vercel env add ${key} development`, {
            input: value + '\n',
            stdio: ['pipe', 'pipe', 'pipe']
          });
          
          print(`✓ ${key} set successfully`, 'green');
        } catch (error) {
          print(`✗ Failed to set ${key}: ${error.message}`, 'red');
        }
      }
    }

    print('\n✅ Vercel environment variables configured!', 'green');
  }

  // Create production env checklist
  print('\n📋 Production Environment Checklist:', 'blue');
  print('1. Update NEXT_PUBLIC_API_URL to your production URL');
  print('2. Update NEXT_PUBLIC_BASE_URL to your production URL');
  print('3. Ensure Supabase is configured for production');
  print('4. Add Google Analytics ID if needed');
  print('5. Configure custom domain in Vercel dashboard');
  
  print('\n✨ Environment setup complete!', 'green');
}

main().catch(error => {
  print(`\nError: ${error.message}`, 'red');
  process.exit(1);
});