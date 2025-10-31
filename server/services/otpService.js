import crypto from 'crypto'

// In-memory storage for OTPs (in production, use Redis or database)
const otpStorage = new Map()

// OTP configuration
const OTP_LENGTH = 6
const OTP_EXPIRY = 10 * 60 * 1000 // 10 minutes in milliseconds
const MAX_ATTEMPTS = 3

class OTPService {
  // Generate OTP
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Store OTP
  static storeOTP(email, otp) {
    const key = email.toLowerCase()
    const expiresAt = Date.now() + OTP_EXPIRY
    
    otpStorage.set(key, {
      otp,
      expiresAt,
      attempts: 0,
      createdAt: Date.now()
    })

    // Auto cleanup after expiry
    setTimeout(() => {
      otpStorage.delete(key)
    }, OTP_EXPIRY)

    return otp
  }

  // Verify OTP
  static verifyOTP(email, providedOTP) {
    const key = email.toLowerCase()
    const otpData = otpStorage.get(key)

    if (!otpData) {
      return { success: false, message: 'OTP not found or expired' }
    }

    // Check if expired
    if (Date.now() > otpData.expiresAt) {
      otpStorage.delete(key)
      return { success: false, message: 'OTP has expired' }
    }

    // Check attempts
    if (otpData.attempts >= MAX_ATTEMPTS) {
      otpStorage.delete(key)
      return { success: false, message: 'Too many failed attempts' }
    }

    // Verify OTP
    if (otpData.otp !== providedOTP) {
      otpData.attempts++
      return { success: false, message: 'Invalid OTP' }
    }

    // OTP is valid
    otpStorage.delete(key)
    return { success: true, message: 'OTP verified successfully' }
  }

  // Send OTP via email
  static async sendOTP(email, otp) {
    try {
      const emailService = process.env.EMAIL_SERVICE || 'mock'
      console.log(`🔧 OTP Service - Email service: ${emailService}, NODE_ENV: ${process.env.NODE_ENV}`)
      
      if (emailService === 'mock') {
        // Mock email sending for development
        console.log(`📧 Sending OTP to ${email}: ${otp}`)
        console.log(`
          ═══════════════════════════════════════
          📧 EMAIL SIMULATION (Development Mode)
          ═══════════════════════════════════════
          To: ${email}
          Subject: Your OTP Code
          
          Your OTP code is: ${otp}
          
          This code will expire in 10 minutes.
          Do not share this code with anyone.
          ═══════════════════════════════════════
        `)
        return { success: true, message: 'OTP sent successfully (development mode)' }
      }

      // Production email sending
      console.log(`📧 Attempting to send real email to: ${email}`)
      const emailSender = await import('./emailService.js')
      const result = await emailSender.default.sendOTP(email, otp)
      console.log(`📧 Email send result:`, result)
      
      return result
    } catch (error) {
      console.error('Error sending OTP:', error)
      return { success: false, message: 'Failed to send OTP' }
    }
  }

  // Send HTML email (for password reset)
  static async sendEmail(email, subject, htmlContent) {
    try {
      const emailService = process.env.EMAIL_SERVICE || 'mock'
      
      if (emailService === 'mock') {
        // Mock email sending for development
        console.log(`📧 Sending email to ${email}`)
        console.log(`
          ═══════════════════════════════════════
          📧 EMAIL SIMULATION (Development Mode)
          ═══════════════════════════════════════
          To: ${email}
          Subject: ${subject}
          
          ${htmlContent.replace(/<[^>]*>/g, '')} // Strip HTML for console
          ═══════════════════════════════════════
        `)
        return { success: true, message: 'Email sent successfully (development mode)' }
      }

      // Production email sending
      console.log(`📧 Attempting to send real email to: ${email}`)
      const emailSender = await import('./emailService.js')
      const result = await emailSender.default.sendEmail(email, subject, htmlContent)
      console.log(`📧 Email send result:`, result)
      
      return result
    } catch (error) {
      console.error('Error sending email:', error)
      return { success: false, message: 'Failed to send email' }
    }
  }

  // Clean expired OTPs (optional cleanup method)
  static cleanupExpiredOTPs() {
    const now = Date.now()
    for (const [email, otpData] of otpStorage.entries()) {
      if (now > otpData.expiresAt) {
        otpStorage.delete(email)
      }
    }
  }

  // Get OTP status (for debugging)
  static getOTPStatus(email) {
    const key = email.toLowerCase()
    const otpData = otpStorage.get(key)
    
    if (!otpData) {
      return { exists: false }
    }

    return {
      exists: true,
      expiresAt: otpData.expiresAt,
      attempts: otpData.attempts,
      timeRemaining: Math.max(0, otpData.expiresAt - Date.now())
    }
  }
}

// Cleanup expired OTPs every 5 minutes
setInterval(() => {
  OTPService.cleanupExpiredOTPs()
}, 5 * 60 * 1000)

export default OTPService