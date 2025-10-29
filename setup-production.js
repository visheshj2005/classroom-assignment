#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🚀 Classroom Assignment Portal - Production Setup\n')

// Check if server/.env exists
const serverEnvPath = path.join(__dirname, 'server', '.env')
const serverEnvExamplePath = path.join(__dirname, 'server', '.env.example')

if (!fs.existsSync(serverEnvPath)) {
  console.log('📝 Creating server/.env from template...')
  
  if (fs.existsSync(serverEnvExamplePath)) {
    fs.copyFileSync(serverEnvExamplePath, serverEnvPath)
    console.log('✅ Created server/.env file')
    console.log('⚠️  Please update the environment variables in server/.env')
  } else {
    console.log('❌ server/.env.example not found')
  }
} else {
  console.log('✅ server/.env already exists')
}

console.log('\n📋 Production Deployment Checklist:')
console.log('   □ MongoDB Atlas cluster created')
console.log('   □ AWS S3 bucket created with proper permissions')
console.log('   □ Environment variables configured in Vercel')
console.log('   □ Domain configured (optional)')

console.log('\n🔗 Helpful Links:')
console.log('   📖 Full deployment guide: ./DEPLOYMENT.md')
console.log('   🌐 MongoDB Atlas: https://mongodb.com/atlas')
console.log('   ☁️  AWS S3: https://aws.amazon.com/s3/')
console.log('   🚀 Vercel: https://vercel.com')

console.log('\n🛠  Next Steps:')
console.log('   1. Update server/.env with your database and AWS credentials')
console.log('   2. Run: npm run build')
console.log('   3. Deploy to Vercel: npm run deploy')
console.log('   4. Configure environment variables in Vercel dashboard')

console.log('\n✨ Happy deploying!')