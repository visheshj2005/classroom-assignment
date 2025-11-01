#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

console.log('🚀 Deploying Frontend to Vercel...')

try {
  // Check if .env.vercel exists
  if (!fs.existsSync('.env.vercel')) {
    console.error('❌ .env.vercel file not found!')
    console.log('Please create .env.vercel with your Render backend URL:')
    console.log('VITE_API_URL=https://your-render-backend-url.onrender.com/api')
    process.exit(1)
  }

  // Read environment variables from .env.vercel
  const envContent = fs.readFileSync('.env.vercel', 'utf8')
  const envVars = envContent
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .map(line => {
      const [key, value] = line.split('=')
      return `${key.trim()}="${value.trim()}"`
    })

  console.log('📦 Building frontend...')
  execSync('npm run build', { stdio: 'inherit' })

  console.log('🌐 Deploying to Vercel...')
  
  // Set environment variables for this deployment
  const envString = envVars.join(' ')
  execSync(`${envString} vercel --prod`, { stdio: 'inherit' })

  console.log('✅ Frontend deployed successfully to Vercel!')
  console.log('🔗 Your frontend should be available at your Vercel URL')
  console.log('⚠️  Make sure to update VITE_API_URL in .env.vercel with your actual Render backend URL')

} catch (error) {
  console.error('❌ Deployment failed:', error.message)
  process.exit(1)
}