#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'

console.log('🚀 Deploying Frontend to Vercel...')

try {
  console.log('🔧 Using production environment variables...')
  console.log('📍 Backend URL: https://classroom-assignment-50uu.onrender.com/api')

  console.log('📦 Building frontend with production config...')
  execSync('npm run build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      VITE_API_URL: 'https://classroom-assignment-50uu.onrender.com/api'
    }
  })

  console.log('🌐 Deploying to Vercel...')
  execSync('vercel --prod', { stdio: 'inherit' })

  console.log('✅ Frontend deployed successfully to Vercel!')
  console.log('🔗 Frontend: https://classroom-assignment-pqcj.vercel.app')
  console.log('🔗 Backend: https://classroom-assignment-50uu.onrender.com')
  console.log('🎉 Your full-stack app is now live!')

} catch (error) {
  console.error('❌ Deployment failed:', error.message)
  process.exit(1)
}