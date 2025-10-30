#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🚀 Email Service Setup for OTP Functionality\n')

const envPath = path.join(__dirname, 'server', '.env')

// Read current .env file
let envContent = ''
try {
  envContent = fs.readFileSync(envPath, 'utf8')
} catch (error) {
  console.error('❌ Could not read server/.env file')
  process.exit(1)
}

console.log('Choose your email service provider:\n')
console.log('1. Gmail (Easy setup, good for development)')
console.log('2. SendGrid (Recommended for production)')
console.log('3. AWS SES (Enterprise solution)')
console.log('4. Custom SMTP (Any SMTP server)')
console.log('5. Keep mock service (Development only)\n')

// For now, let's add the configuration options to the .env file as comments
const emailConfig = `

# Email Configuration for OTP
# Uncomment and configure the service you want to use

# Option 1: Gmail
# EMAIL_SERVICE=gmail
# EMAIL_USER=your-gmail@gmail.com
# EMAIL_PASS=your-app-password
# EMAIL_FROM=your-gmail@gmail.com

# Option 2: SendGrid
# EMAIL_SERVICE=sendgrid
# SENDGRID_API_KEY=your-sendgrid-api-key
# EMAIL_FROM=noreply@yourdomain.com

# Option 3: AWS SES
# EMAIL_SERVICE=aws-ses
# AWS_REGION=us-east-1
# AWS_ACCESS_KEY_ID=your-access-key
# AWS_SECRET_ACCESS_KEY=your-secret-key
# EMAIL_FROM=noreply@yourdomain.com

# Option 4: Custom SMTP
# EMAIL_SERVICE=smtp
# SMTP_HOST=smtp.yourdomain.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your-smtp-user
# SMTP_PASS=your-smtp-password
# EMAIL_FROM=noreply@yourdomain.com

# Option 5: Mock (Development only - logs to console)
# EMAIL_SERVICE=mock
`

// Check if email config already exists
if (!envContent.includes('EMAIL_SERVICE')) {
  // Add email configuration to .env file
  fs.writeFileSync(envPath, envContent + emailConfig)
  console.log('✅ Email configuration options added to server/.env')
  console.log('\n📝 Next steps:')
  console.log('1. Open server/.env file')
  console.log('2. Uncomment and configure your preferred email service')
  console.log('3. Install required dependencies:')
  console.log('   - For Gmail/SMTP: cd server && npm install nodemailer')
  console.log('   - For SendGrid: cd server && npm install @sendgrid/mail')
  console.log('   - For AWS SES: cd server && npm install @aws-sdk/client-ses')
  console.log('4. Restart your server')
  console.log('\n📖 See OTP-SETUP-GUIDE.md for detailed instructions')
} else {
  console.log('✅ Email configuration already exists in server/.env')
  console.log('📝 Edit server/.env to configure your email service')
}

console.log('\n🔧 Current status: OTP emails will be logged to console until you configure an email service')
console.log('🚀 The OTP functionality is ready to use once you configure email sending!')