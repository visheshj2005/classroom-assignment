#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

console.log('🚀 Starting Vercel deployment process...')

// Check if vercel.json exists
if (!fs.existsSync('vercel.json')) {
  console.error('❌ vercel.json not found. Please ensure it exists in the root directory.')
  process.exit(1)
}

// Check if server directory exists
if (!fs.existsSync('server')) {
  console.error('❌ Server directory not found.')
  process.exit(1)
}

try {
  // Build the frontend
  console.log('📦 Building frontend...')
  execSync('npm run build', { stdio: 'inherit' })

  // Install server dependencies
  console.log('📦 Installing server dependencies...')
  execSync('cd server && npm install', { stdio: 'inherit' })

  // Check if Vercel CLI is installed
  try {
    execSync('vercel --version', { stdio: 'pipe' })
  } catch (error) {
    console.log('📥 Installing Vercel CLI...')
    execSync('npm install -g vercel', { stdio: 'inherit' })
  }

  // Deploy to Vercel
  console.log('🚀 Deploying to Vercel...')
  execSync('vercel --prod', { stdio: 'inherit' })

  console.log('✅ Deployment completed successfully!')
  console.log('🌐 Your application should be available at the URL provided by Vercel.')
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message)
  process.exit(1)
}