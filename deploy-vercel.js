#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

console.log('🚀 Starting Vercel deployment process...')

// Check if .env.production exists
if (!fs.existsSync('.env.production')) {
  console.error('❌ .env.production file not found!')
  console.log('Please create .env.production with your production environment variables.')
  process.exit(1)
}

// Read environment variables from .env.production
const envContent = fs.readFileSync('.env.production', 'utf8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const trimmedLine = line.trim()
  if (trimmedLine && !trimmedLine.startsWith('#')) {
    const [key, ...valueParts] = trimmedLine.split('=')
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim()
    }
  }
})

console.log('📋 Found environment variables:', Object.keys(envVars))

try {
  // Build the project
  console.log('🔨 Building project...')
  execSync('npm run build', { stdio: 'inherit' })

  // Set environment variables in Vercel
  console.log('🔧 Setting environment variables in Vercel...')
  
  for (const [key, value] of Object.entries(envVars)) {
    try {
      execSync(`vercel env add ${key} production`, {
        input: value,
        stdio: ['pipe', 'inherit', 'inherit']
      })
      console.log(`✅ Set ${key}`)
    } catch (error) {
      // Variable might already exist, try to remove and add again
      try {
        execSync(`vercel env rm ${key} production --yes`, { stdio: 'pipe' })
        execSync(`vercel env add ${key} production`, {
          input: value,
          stdio: ['pipe', 'inherit', 'inherit']
        })
        console.log(`✅ Updated ${key}`)
      } catch (updateError) {
        console.log(`⚠️  Could not set ${key}: ${updateError.message}`)
      }
    }
  }

  // Deploy to Vercel
  console.log('🚀 Deploying to Vercel...')
  execSync('vercel --prod', { stdio: 'inherit' })

  console.log('✅ Deployment completed successfully!')
  console.log('🌐 Your app should be available at your Vercel URL')

} catch (error) {
  console.error('❌ Deployment failed:', error.message)
  process.exit(1)
}