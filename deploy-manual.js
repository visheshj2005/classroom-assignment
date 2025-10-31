#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'

console.log('🚀 Manual deployment process...')

// Check if .env.production exists
if (!fs.existsSync('.env.production')) {
  console.error('❌ .env.production file not found!')
  console.log('Please create .env.production with your production environment variables.')
  process.exit(1)
}

try {
  // Build the project
  console.log('🔨 Building project...')
  execSync('npm run build', { stdio: 'inherit' })

  console.log('✅ Build completed!')
  console.log('')
  console.log('📋 Manual deployment steps:')
  console.log('1. Upload the dist/ folder to your hosting provider')
  console.log('2. Set up your server with the environment variables from .env.production')
  console.log('3. Configure your web server to serve index.html for all routes (SPA routing)')
  console.log('4. Set up your API endpoints to handle /api/* routes')
  console.log('')
  console.log('🔧 Environment variables to set on your server:')
  
  const envContent = fs.readFileSync('.env.production', 'utf8')
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim()
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key] = trimmedLine.split('=')
      if (key) {
        console.log(`   ${key.trim()}`)
      }
    }
  })

} catch (error) {
  console.error('❌ Build failed:', error.message)
  process.exit(1)
}