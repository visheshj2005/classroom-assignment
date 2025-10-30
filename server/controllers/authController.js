import jwt from 'jsonwebtoken'
import { validationResult } from 'express-validator'
import User from '../models/User.js'
import OTPService from '../services/otpService.js'
// Analytics service removed for simplicity

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' } // Extended to 30 days
  )
}

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

    // Generate token
    const token = generateToken(user._id)

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Registration successful
    console.log(`New user registered: ${email}`)

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
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
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      })
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Generate token
    const token = generateToken(user._id)

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Login successful
    console.log(`User logged in: ${email}`)

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    })
  } catch (error) {
    console.error('Login error:', error)
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

// Forgot password (simplified - just allows password reset with email verification)
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
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      })
    }

    // In a real app, you would send an email with a reset token
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error processing password reset request'
    })
  }
}

// Reset password (simplified version)
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

    const { email, newPassword } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Update password
    user.passwordHash = newPassword // Will be hashed by pre-save middleware
    await user.save()

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

// Logout (client-side token removal)
export const logout = async (req, res) => {
  try {
    // Logout successful
    console.log(`User logged out: ${req.user.email}`)

    res.json({
      success: true,
      message: 'Logout successful'
    })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    })
  }
}