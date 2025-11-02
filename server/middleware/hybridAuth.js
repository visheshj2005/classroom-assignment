import jwt from 'jsonwebtoken'
import User from '../models/User.js'

/**
 * Hybrid authentication middleware that supports both sessions and JWT tokens
 * This helps with incognito mode and cross-origin cookie issues
 */
export const hybridAuthMiddleware = async (req, res, next) => {
  try {
    let user = null
    let authMethod = 'none'

    // Method 1: Try session-based auth first (preferred)
    if (req.session && req.session.userId) {
      console.log('🔍 Hybrid Auth: Trying session auth')
      user = await User.findById(req.session.userId).select('-passwordHash')
      if (user && user.isActive) {
        authMethod = 'session'
        console.log('✅ Hybrid Auth: Session auth successful')
      }
    }

    // Method 2: Fallback to JWT token (for incognito mode)
    if (!user) {
      const authHeader = req.headers.authorization
      if (authHeader && authHeader.startsWith('Bearer ')) {
        console.log('🔍 Hybrid Auth: Trying JWT auth')
        const token = authHeader.substring(7)
        
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET)
          user = await User.findById(decoded.userId).select('-passwordHash')
          if (user && user.isActive) {
            authMethod = 'jwt'
            console.log('✅ Hybrid Auth: JWT auth successful')
          }
        } catch (jwtError) {
          console.log('❌ Hybrid Auth: JWT verification failed:', jwtError.message)
        }
      }
    }

    // Check if authentication was successful
    if (!user) {
      console.log('❌ Hybrid Auth: No valid authentication found')
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. Please log in.',
        authMethod: 'none'
      })
    }

    if (!user.isActive) {
      console.log('❌ Hybrid Auth: User account is deactivated')
      return res.status(401).json({ 
        success: false, 
        message: 'Account is deactivated.' 
      })
    }

    console.log(`✅ Hybrid Auth: User authenticated via ${authMethod}:`, user.name)
    req.user = user
    req.authMethod = authMethod
    next()

  } catch (error) {
    console.error('Hybrid auth middleware error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication.' 
    })
  }
}

// Export as default and named export
export default hybridAuthMiddleware
export const hybridAuth = hybridAuthMiddleware