import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { validationResult } from 'express-validator'
import User from '../models/User.js'
import OTPService from '../services/otpService.js'
// Analytics service removed for simplicity

// Send OTP for registration
export const sendRegistrationOTP = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { email } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      })
    }

    // Generate and send OTP
    const otp = OTPService.generateOTP()
    OTPService.storeOTP(email, otp)
    
    const sendResult = await OTPService.sendOTP(email, otp)
    
    if (!sendResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP'
      })
    }

    res.json({
      success: true,
      message: 'OTP sent to your email address'
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error sending OTP'
    })
  }
}

// Register new user with OTP verification
export const register = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { name, email, password, role = 'student', otp } = req.body

    // Verify OTP
    const otpVerification = OTPService.verifyOTP(email, otp)
    if (!otpVerification.success) {
      return res.status(400).json({
        success: false,
        message: otpVerification.message
      })
    }

    // Check if user already exists (double check)
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      })
    }

    // Create new user
    const user = new User({
      name,
      email,
      passwordHash: password, // Will be hashed by pre-save middleware
      role
    })

    await user.save()

    // Create session
    req.session.userId = user._id
    req.session.userRole = user.role

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Registration successful
    console.log(`New user registered: ${email}`)

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    })
  }
}

// Login user
export const login = async (req, res) => {
  try {
    console.log('🔐 Login attempt started')
    console.log('Request body:', req.body)
    
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array())
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { email, password } = req.body
    console.log(`🔍 Looking for user with email: ${email}`)

    // Find user by email
    const user = await User.findOne({ email })
    console.log(`👤 User found: ${!!user}`)
    
    if (!user) {
      console.log(`❌ No user found with email: ${email}`)
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    console.log(`📋 User details: name=${user.name}, role=${user.role}, active=${user.isActive}`)

    // Check if account is active
    if (!user.isActive) {
      console.log(`❌ User account is not active: ${email}`)
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      })
    }

    // Verify password
    console.log('🔑 Verifying password...')
    console.log(`Password provided length: ${password.length}`)
    console.log(`Stored hash length: ${user.passwordHash.length}`)
    
    const isPasswordValid = await user.comparePassword(password)
    console.log(`🔐 Password validation result: ${isPasswordValid}`)
    
    if (!isPasswordValid) {
      console.log(`❌ Password validation failed for: ${email}`)
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Create session
    req.session.userId = user._id
    req.session.userRole = user.role
    
    console.log(`📝 Session created for user: ${user._id}`)
    console.log('🔍 Session Debug:')
    console.log('- Session ID:', req.session.id)
    console.log('- Session userId:', req.session.userId)
    console.log('- Session userRole:', req.session.userRole)
    console.log('- Session cookie:', req.session.cookie)
    console.log('- Response headers will include Set-Cookie')

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate JWT token as fallback for incognito mode
    const jwtToken = jwt.sign(
      { 
        userId: user._id, 
        role: user.role,
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    )

    // Login successful
    console.log(`✅ User logged in successfully: ${email}`)
    console.log('🔑 JWT token generated for fallback auth')

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token: jwtToken, // Include JWT token for incognito mode fallback
        authMethods: ['session', 'jwt'] // Indicate supported auth methods
      }
    })
  } catch (error) {
    console.error('❌ Login error:', error)
    console.error('Error stack:', error.stack)
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    })
  }
}

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    })
  }
}

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { name, profile } = req.body
    const userId = req.user._id

    const updateData = {}
    if (name) updateData.name = name
    if (profile) updateData.profile = { ...req.user.profile, ...profile }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    )

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    })
  }
}

// Change password
export const changePassword = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user._id)

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      })
    }

    // Update password
    user.passwordHash = newPassword // Will be hashed by pre-save middleware
    await user.save()

    res.json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error changing password'
    })
  }
}

// Forgot password - Generate reset token and send email
export const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { email } = req.body

    const user = await User.findOne({ email })
    
    if (!user) {
      // User doesn't exist - return clear error message
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address. Please check your email or register for a new account.'
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    
    // Set token and expiration (1 hour)
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = Date.now() + 3600000 // 1 hour
    await user.save()

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&email=${email}`

    // Send email with reset link
    try {
      const emailContent = `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your Classroom Assignment Portal account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `

      const sendResult = await OTPService.sendEmail(email, 'Password Reset Request', emailContent)
      
      if (!sendResult.success) {
        console.error('Failed to send reset email:', sendResult.error)
        // Clear the reset token if email fails
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined
        await user.save()
        
        return res.status(500).json({
          success: false,
          message: 'Failed to send reset email. Please try again.'
        })
      }

      console.log(`Password reset email sent to: ${email}`)
      
      res.json({
        success: true,
        message: 'Password reset link has been sent to your email address. Please check your inbox and follow the instructions.'
      })
    } catch (emailError) {
      console.error('Email sending error:', emailError)
      // Clear the reset token if email fails
      user.resetPasswordToken = undefined
      user.resetPasswordExpires = undefined
      await user.save()
      
      return res.status(500).json({
        success: false,
        message: 'Failed to send reset email. Please try again.'
      })
    }
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error processing password reset request'
    })
  }
}

// Reset password with token verification
export const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { email, token, newPassword } = req.body

    const user = await User.findOne({ 
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      })
    }

    // Update password and clear reset token
    user.passwordHash = newPassword // Will be hashed by pre-save middleware
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    console.log(`Password reset successfully for: ${email}`)

    res.json({
      success: true,
      message: 'Password reset successfully'
    })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error resetting password'
    })
  }
}

// Logout (destroy session)
export const logout = async (req, res) => {
  try {
    const userEmail = req.user?.email || 'Unknown'
    
    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err)
        return res.status(500).json({
          success: false,
          message: 'Server error during logout'
        })
      }

      // Clear session cookie
      res.clearCookie('classroom.sid')
      
      console.log(`User logged out: ${userEmail}`)

      res.json({
        success: true,
        message: 'Logout successful'
      })
    })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    })
  }
}