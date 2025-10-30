#!/usr/bin/env node

import dotenv from 'dotenv'
import nodemailer from 'nodemailer'

// Load environment variables
dotenv.config({ path: './server/.env' })

console.log('🔍 Email Configuration Debug Tool\n')

// Check environment variables
console.log('📋 Environment Variables:')
console.log(`EMAIL_SERVICE: ${process.env.EMAIL_SERVICE}`)
console.log(`EMAIL_USER: ${process.env.EMAIL_USER}`)
console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '[SET]' : '[NOT SET]'}`)
console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM}`)
console.log(`NODE_ENV: ${process.env.NODE_ENV}\n`)

// Test Gmail configuration
async function testGmailConnection() {
  try {
    console.log('🧪 Testing Gmail connection...')
    
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    // Verify connection
    const verified = await transporter.verify()
    console.log('✅ Gmail connection verified:', verified)
    
    return transporter
  } catch (error) {
    console.error('❌ Gmail connection failed:', error.message)
    
    if (error.message.includes('Invalid login')) {
      console.log('\n🔧 Troubleshooting steps:')
      console.log('1. Make sure you\'re using an App Password, not your regular Gmail password')
      console.log('2. Enable 2-factor authentication on your Google account')
      console.log('3. Generate an App Password: https://myaccount.google.com/apppasswords')
      console.log('4. Use the 16-character app password (without spaces)')
    }
    
    return null
  }
}

// Send test email
async function sendTestEmail(transporter, testEmail) {
  try {
    console.log(`\n📧 Sending test email to ${testEmail}...`)
    
    const testOTP = '123456'
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: testEmail,
      subject: 'Test OTP - Classroom Portal',
      text: `Your test OTP code is: ${testOTP}\n\nThis is a test email to verify email configuration.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Test OTP Code</h2>
          <p>Your test OTP code is:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <span style="font-size: 32px; font-weight: bold; color: #4f46e5; letter-spacing: 4px;">${testOTP}</span>
          </div>
          <p>This is a test email to verify your email configuration is working.</p>
          <p style="color: #6b7280; font-size: 14px;">© 2024 Classroom Portal</p>
        </div>
      `
    })

    console.log('✅ Test email sent successfully!')
    console.log(`📬 Message ID: ${info.messageId}`)
    console.log('📥 Check your inbox (and spam folder) for the test email')
    
    return true
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message)
    return false
  }
}

// Main debug function
async function debugEmail() {
  try {
    // Check if Gmail is configured
    if (process.env.EMAIL_SERVICE !== 'gmail') {
      console.log('⚠️  EMAIL_SERVICE is not set to "gmail"')
      console.log('Current value:', process.env.EMAIL_SERVICE)
      return
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('❌ Gmail credentials not configured')
      console.log('Please set EMAIL_USER and EMAIL_PASS in server/.env')
      return
    }

    // Test connection
    const transporter = await testGmailConnection()
    if (!transporter) {
      return
    }

    // Ask for test email (in a real CLI, you'd use readline)
    const testEmail = process.env.EMAIL_USER // Send to same email for testing
    console.log(`\n🎯 Using ${testEmail} as test recipient`)
    
    // Send test email
    const success = await sendTestEmail(transporter, testEmail)
    
    if (success) {
      console.log('\n🎉 Email configuration is working!')
      console.log('✅ OTP emails should now be delivered successfully')
    } else {
      console.log('\n❌ Email configuration needs fixing')
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error)
  }
}

// Test the email service directly
async function testEmailService() {
  try {
    console.log('\n🧪 Testing EmailService class...')
    
    const emailService = await import('./server/services/emailService.js')
    const result = await emailService.default.sendOTP(process.env.EMAIL_USER, '123456')
    
    console.log('📧 EmailService result:', result)
    
  } catch (error) {
    console.error('❌ EmailService test failed:', error.message)
    console.log('\n🔧 This might be because the EmailService is not properly initialized')
  }
}

// Run all tests
async function runAllTests() {
  await debugEmail()
  await testEmailService()
  
  console.log('\n📋 Summary:')
  console.log('- If Gmail connection test passed, your credentials are correct')
  console.log('- If test email was sent, check your inbox and spam folder')
  console.log('- If EmailService test passed, OTP emails should work')
  console.log('\n🚀 Try the OTP registration flow now!')
}

runAllTests()