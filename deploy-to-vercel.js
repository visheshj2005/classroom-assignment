#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

console.log('🚀 Starting Vercel deployment process...')
console.log('=' .repeat(50))

// Check if required files exist
const requiredFiles = [
  'vercel.json',
  'package.json',
  'api/index.js',
  '.env.production'
]

console.log('\n📋 Checking required files...')
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`)
  } else {
    console.log(`   ❌ ${file} - MISSING`)
    process.exit(1)
  }
}

// Check if Vercel CLI is installed
console.log('\n🔧 Checking Vercel CLI...')
try {
  execSync('vercel --version', { stdio: 'pipe' })
  console.log('   ✅ Vercel CLI is installed')
} catch (error) {
  console.log('   ❌ Vercel CLI not found')
  console.log('   💡 Install with: npm i -g vercel')
  process.exit(1)
}

// Build the project
console.log('\n🏗️  Building project...')
try {
  execSync('npm run build', { stdio: 'inherit' })
  console.log('   ✅ Build completed')
} catch (error) {
  console.log('   ❌ Build failed')
  process.exit(1)
}

// Check if dist directory exists
if (fs.existsSync('dist')) {
  console.log('   ✅ dist directory created')
} else {
  console.log('   ❌ dist directory not found')
  process.exit(1)
}

// Deploy to Vercel
console.log('\n🚀 Deploying to Vercel...')
try {
  const output = execSync('vercel --prod --yes', { 
    stdio: 'pipe',
    encoding: 'utf8'
  })
  
  console.log('   ✅ Deployment completed')
  
  // Extract deployment URL from output
  const urlMatch = output.match(/https:\/\/[^\s]+\.vercel\.app/)
  if (urlMatch) {
    const deploymentUrl = urlMatch[0]
    console.log(`   🌐 Deployment URL: ${deploymentUrl}`)
    
    // Save deployment URL for verification
    fs.writeFileSync('.vercel-url', deploymentUrl)
    
    console.log('\n🔍 Running deployment verification...')
    setTimeout(() => {
      try {
        execSync(`node verify-vercel-deployment.js ${deploymentUrl}`, { stdio: 'inherit' })
      } catch (error) {
        console.log('   ⚠️  Verification script failed, but deployment might still be successful')
        console.log(`   🌐 Please manually test: ${deploymentUrl}`)
      }
    }, 5000) // Wait 5 seconds for deployment to be ready
    
  } else {
    console.log('   ⚠️  Could not extract deployment URL from output')
    console.log('   📝 Full output:')
    console.log(output)
  }
  
} catch (error) {
  console.log('   ❌ Deployment failed')
  console.log('   📝 Error:', error.message)
  process.exit(1)
}

console.log('\n🎉 Deployment process completed!')
console.log('\n📋 Next steps:')
console.log('   1. Set environment variables in Vercel dashboard')
console.log('   2. Test the deployed application')
console.log('   3. Monitor function logs for any issues')
console.log('   4. Update DNS if using custom domain')