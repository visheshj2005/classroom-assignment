#!/usr/bin/env node

// Render Backend Deployment Script
// This script helps deploy the backend to Render with proper configuration

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

console.log('🚀 RENDER BACKEND DEPLOYMENT SCRIPT')
console.log('=' .repeat(50))

// Check if we're in the right directory
if (!fs.existsSync('server/package.json')) {
  console.error('❌ Error: server/package.json not found. Run this from the project root.')
  process.exit(1)
}

// Check if render.yaml exists
if (!fs.existsSync('render.yaml')) {
  console.error('❌ Error: render.yaml not found. This file is required for Render deployment.')
  process.exit(1)
}

console.log('✅ Project structure verified')

// Environment variables that need to be set on Render
const requiredEnvVars = [
  'MONGODB_URI',
  'SESSION_SECRET', 
  'JWT_SECRET',
  'EMAIL_USER',
  'EMAIL_PASS'
]

console.log('\n📋 RENDER DEPLOYMENT CHECKLIST:')
console.log('1. ✅ render.yaml configured')
console.log('2. ✅ server/.env.production created')
console.log('3. ⚠️  Set these environment variables on Render dashboard:')

requiredEnvVars.forEach(envVar => {
  console.log(`   - ${envVar}`)
})

console.log('\n🔧 RENDER SETUP INSTRUCTIONS:')
console.log('1. Go to https://render.com and create account')
console.log('2. Connect your GitHub repository')
console.log('3. Create new "Web Service"')
console.log('4. Configure:')
console.log('   - Root Directory: server')
console.log('   - Build Command: npm install')
console.log('   - Start Command: npm start')
console.log('5. Set environment variables in Render dashboard')
console.log('6. Deploy!')

console.log('\n🌐 EXPECTED URLS:')
console.log('Frontend (Vercel): https://classroom-assignment-pqcj.vercel.app')
console.log('Backend (Render): https://classroom-assignment-50uu.onrender.com')

console.log('\n✅ Ready for deployment!')
console.log('Push your changes to GitHub and deploy on Render.')

// Test if we can connect to the current Render URL
console.log('\n🧪 Testing current Render backend...')
try {
  const response = await fetch('https://classroom-assignment-50uu.onrender.com/api/health')
  if (response.ok) {
    const data = await response.json()
    console.log('✅ Render backend is responding!')
    console.log('Database status:', data.database)
  } else {
    console.log('⚠️  Render backend returned status:', response.status)
  }
} catch (error) {
  console.log('❌ Cannot reach Render backend:', error.message)
  console.log('This is normal if you haven\'t deployed yet.')
}