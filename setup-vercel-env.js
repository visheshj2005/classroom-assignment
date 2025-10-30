#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'

console.log('🔧 Vercel Environment Variables Setup')
console.log('=' .repeat(40))

// Read environment variables from server/.env
const envPath = 'server/.env'
if (!fs.existsSync(envPath)) {
  console.log('❌ server/.env file not found')
  console.log('💡 Please create server/.env with your configuration')
  process.exit(1)
}

const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = {}

// Parse environment variables
envContent.split('\n').forEach(line => {
  line = line.trim()
  if (line && !line.startsWith('#') && line.includes('=')) {
    const [key, ...valueParts] = line.split('=')
    const value = valueParts.join('=')
    envVars[key] = value
  }
})

// Required environment variables for production
const requiredVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'BCRYPT_ROUNDS',
  'EMAIL_SERVICE',
  'EMAIL_USER',
  'EMAIL_PASS',
  'EMAIL_FROM'
]

console.log('\n📋 Checking required environment variables...')
const missingVars = []

requiredVars.forEach(varName => {
  if (envVars[varName]) {
    console.log(`   ✅ ${varName}`)
  } else {
    console.log(`   ❌ ${varName} - MISSING`)
    missingVars.push(varName)
  }
})

if (missingVars.length > 0) {
  console.log('\n❌ Missing required environment variables')
  console.log('💡 Please add these to your server/.env file:')
  missingVars.forEach(varName => {
    console.log(`   ${varName}=your_value_here`)
  })
  process.exit(1)
}

// Generate Vercel CLI commands
console.log('\n🚀 Generating Vercel environment variable commands...')
console.log('\nRun these commands to set up your Vercel environment variables:')
console.log('(Make sure you\'re in your project directory and logged into Vercel CLI)\n')

// Production environment variables
const productionVars = {
  ...envVars,
  NODE_ENV: 'production',
  RATE_LIMIT_WINDOW_MS: '900000',
  RATE_LIMIT_MAX_REQUESTS: '200',
  AUTH_RATE_LIMIT_MAX: '10',
  ENABLE_ANALYTICS: 'true',
  ENABLE_NOTIFICATIONS: 'true',
  ENABLE_FILE_UPLOADS: 'true',
  MAX_FILE_SIZE: '50MB',
  ANALYTICS_RETENTION_DAYS: '365',
  NOTIFICATION_RETENTION_DAYS: '30'
}

// Generate commands
Object.entries(productionVars).forEach(([key, value]) => {
  if (value && !value.startsWith('#')) {
    // Escape special characters in values
    const escapedValue = value.replace(/"/g, '\\"')
    console.log(`vercel env add ${key} production`)
    console.log(`# Enter value: ${escapedValue}`)
    console.log('')
  }
})

// Create a batch script for Windows users
const batchCommands = Object.entries(productionVars)
  .filter(([key, value]) => value && !value.startsWith('#'))
  .map(([key, value]) => {
    const escapedValue = value.replace(/"/g, '\\"')
    return `echo Setting ${key}...\necho ${escapedValue} | vercel env add ${key} production`
  })
  .join('\n')

fs.writeFileSync('setup-vercel-env.bat', batchCommands)
console.log('📝 Created setup-vercel-env.bat for Windows users')

// Create a shell script for Unix users
const shellCommands = Object.entries(productionVars)
  .filter(([key, value]) => value && !value.startsWith('#'))
  .map(([key, value]) => {
    const escapedValue = value.replace(/'/g, "'\"'\"'")
    return `echo "Setting ${key}..."\necho '${escapedValue}' | vercel env add ${key} production`
  })
  .join('\n')

fs.writeFileSync('setup-vercel-env.sh', `#!/bin/bash\n${shellCommands}`)
console.log('📝 Created setup-vercel-env.sh for Unix users')

console.log('\n✅ Environment setup complete!')
console.log('\n📋 Next steps:')
console.log('   1. Run the generated script for your platform')
console.log('   2. Or manually run the vercel env add commands above')
console.log('   3. Deploy with: npm run deploy')
console.log('   4. Verify with: npm run verify:deployment <your-url>')