#!/usr/bin/env node

/**
 * Fix Vercel Environment Variables for Ngrok Hybrid Deployment
 */

import { execSync } from 'child_process'

const NGROK_API_URL = 'https://paronymous-jacki-gelatinously.ngrok-free.dev/api'

console.log('🔧 Fixing Vercel Environment Variables...')
console.log(`🔗 Setting VITE_API_URL to: ${NGROK_API_URL}`)

try {
  // Check if vercel CLI is available
  execSync('vercel --version', { stdio: 'pipe' })
  console.log('✅ Vercel CLI found')
  
  // Set environment variable for production
  console.log('\n📝 Setting production environment variable...')
  execSync(`vercel env add VITE_API_URL production`, {
    input: NGROK_API_URL,
    stdio: ['pipe', 'inherit', 'inherit']
  })
  
  console.log('✅ Environment variable set for production')
  
  // Set environment variable for preview
  console.log('\n📝 Setting preview environment variable...')
  execSync(`vercel env add VITE_API_URL preview`, {
    input: NGROK_API_URL,
    stdio: ['pipe', 'inherit', 'inherit']
  })
  
  console.log('✅ Environment variable set for preview')
  
  // Trigger a new deployment
  console.log('\n🚀 Triggering new deployment...')
  execSync('vercel --prod', { stdio: 'inherit' })
  
  console.log('\n✅ Deployment complete!')
  console.log('🌐 Your app should now work at: https://classroom-assignment-pqcj.vercel.app')
  
} catch (error) {
  console.log('❌ Error with Vercel CLI:', error.message)
  console.log('\n📋 Manual steps:')
  console.log('1. Go to https://vercel.com/dashboard')
  console.log('2. Select your project: classroom-assignment-pqcj')
  console.log('3. Go to Settings → Environment Variables')
  console.log('4. Add/Update VITE_API_URL:')
  console.log(`   Value: ${NGROK_API_URL}`)
  console.log('   Environment: Production')
  console.log('5. Redeploy your project')
}

console.log('\n🧪 After deployment, test with:')
console.log('npm run test:cors')