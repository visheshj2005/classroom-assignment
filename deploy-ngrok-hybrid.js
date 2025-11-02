#!/usr/bin/env node

/**
 * Ngrok Hybrid Deployment Script
 * Frontend: Vercel, Backend: Ngrok tunnel
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const NGROK_URL = 'https://paronymous-jacki-gelatinously.ngrok-free.dev'
const VERCEL_URL = 'https://classroom-assignment-pqcj.vercel.app'

console.log('🚀 Starting Ngrok Hybrid Deployment Setup...')
console.log(`📱 Frontend: ${VERCEL_URL}`)
console.log(`🔗 Backend: ${NGROK_URL}`)

// Step 1: Update environment variables
console.log('\n📝 Step 1: Updating environment variables...')

const envContent = `# Ngrok Hybrid Deployment - Frontend on Vercel, Backend via ngrok
VITE_API_URL=${NGROK_URL}
`

fs.writeFileSync('.env', envContent)
console.log('✅ Updated .env file')

// Step 2: Set Vercel environment variables
console.log('\n🌐 Step 2: Setting Vercel environment variables...')

try {
  execSync(`vercel env add VITE_API_URL production`, { 
    input: NGROK_URL,
    stdio: ['pipe', 'inherit', 'inherit'] 
  })
  console.log('✅ Set VITE_API_URL in Vercel')
} catch (error) {
  console.log('⚠️  Manual step required: Set VITE_API_URL in Vercel dashboard')
  console.log(`   Value: ${NGROK_URL}`)
}

// Step 3: Build and deploy frontend
console.log('\n🏗️  Step 3: Building and deploying frontend to Vercel...')

try {
  execSync('npm run build', { stdio: 'inherit' })
  console.log('✅ Frontend built successfully')
  
  execSync('vercel --prod', { stdio: 'inherit' })
  console.log('✅ Frontend deployed to Vercel')
} catch (error) {
  console.log('❌ Frontend deployment failed:', error.message)
}

// Step 4: Instructions for backend
console.log('\n🔧 Step 4: Backend setup instructions...')
console.log('To start your backend with ngrok:')
console.log('')
console.log('1. Start your backend server:')
console.log('   cd server && npm start')
console.log('')
console.log('2. In another terminal, start ngrok:')
console.log('   ngrok http 5000')
console.log('')
console.log('3. Update the ngrok URL if it changes:')
console.log('   - Update VITE_API_URL in .env')
console.log('   - Update VITE_API_URL in Vercel dashboard')
console.log('   - Redeploy frontend: vercel --prod')

console.log('\n✨ Hybrid deployment setup complete!')
console.log(`🌐 Your app should be accessible at: ${VERCEL_URL}`)
console.log(`🔗 Backend API accessible at: ${NGROK_URL}`)

console.log('\n📋 Quick test commands:')
console.log(`curl ${NGROK_URL}/api/health`)
console.log(`curl ${NGROK_URL}/api/test`)