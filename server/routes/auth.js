import express from 'express'
import {
  sendRegistrationOTP,
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logout
} from '../controllers/authController.js'
import { authMiddleware } from '../middleware/auth.js'
import { hybridAuthMiddleware } from '../middleware/hybridAuth.js'
import { body } from 'express-validator'
import {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation
} from '../middleware/validation.js'

const router = express.Router()

// Public routes
router.post('/send-otp', [
  body('email').isEmail().withMessage('Valid email is required')
], sendRegistrationOTP)
router.post('/register', [
  ...registerValidation,
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], register)
router.post('/login', loginValidation, login)
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required')
], forgotPassword)
router.post('/reset-password', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], resetPassword)

// Protected routes
router.get('/me', hybridAuthMiddleware, getProfile)
router.patch('/me', hybridAuthMiddleware, updateProfileValidation, updateProfile)
router.patch('/change-password', hybridAuthMiddleware, changePasswordValidation, changePassword)
router.post('/logout', hybridAuthMiddleware, logout)

export default router