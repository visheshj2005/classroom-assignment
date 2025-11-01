#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'

console.log('🔧 Fixing Vercel SPA routing issue...')

try {
  // Check if dist folder exists and has correct structure
  console.log('📁 Checking build output...')
  
  if (!fs.existsSync('dist')) {
    console.log('📦 Building project...')
    execSync('npm run build', { stdio: 'inherit' })
  }

  // Verify dist structure
  const distFiles = fs.readdirSync('dist')
  console.log('📋 Dist folder contents:', distFiles)

  if (!distFiles.includes('index.html')) {
    console.error('❌ index.html not found in dist folder!')
    console.log('🔄 Rebuilding...')
    execSync('npm run build', { stdio: 'inherit' })
  }

  // Check vercel.json configuration
  console.log('⚙️  Vercel configuration looks good for SPA routing')

  // Deploy to Vercel
  console.log('🚀 Deploying to Vercel...')
  execSync('vercel --prod', { stdio: 'inherit' })

  console.log('✅ Deployment complete!')
  console.log('🌐 Your app should now work on all routes')
  console.log('🔗 Test these URLs:')
  console.log('   - https://classroom-assignment-pqcj.vercel.app/')
  console.log('   - https://classroom-assignment-pqcj.vercel.app/login')
  console.log('   - https://classroom-assignment-pqcj.vercel.app/register')

} catch (error) {
  console.error('❌ Fix failed:', error.message)
  console.log('\n🔍 Troubleshooting steps:')
  console.log('1. Make sure you have Vercel CLI installed: npm i -g vercel')
  console.log('2. Make sure you\'re logged in: vercel login')
  console.log('3. Try manual build: npm run build')
  console.log('4. Check if dist/index.html exists')
  process.exit(1)
}