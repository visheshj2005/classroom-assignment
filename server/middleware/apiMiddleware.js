import AnalyticsService from '../services/analyticsService.js'
import logger from '../utils/logger.js'

// API request tracking middleware
export const apiTracker = async (req, res, next) => {
  const start = Date.now()
  
  // Track API call
  res.on('finish', async () => {
    const duration = Date.now() - start
    
    try {
      if (req.user) {
        await AnalyticsService.trackApiCall(req.user._id, {
          path: req.path,
          method: req.method,
          statusCode: res.statusCode,
          duration,
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip
        })
      }
    } catch (error) {
      logger.error('Failed to track API call', { error: error.message })
    }
  })
  
  next()
}

// Request validation middleware
export const validateRequest = (req, res, next) => {
  // Check for required headers
  if (!req.get('Content-Type') && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
    return res.status(400).json({
      success: false,
      message: 'Content-Type header is required'
    })
  }
  
  // Check for oversized requests
  const contentLength = parseInt(req.get('Content-Length') || '0')
  const maxSize = 50 * 1024 * 1024 // 50MB
  
  if (contentLength > maxSize) {
    return res.status(413).json({
      success: false,
      message: 'Request entity too large'
    })
  }
  
  next()
}

// Response time middleware
export const responseTime = (req, res, next) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    
    // Only set header if headers haven't been sent yet
    if (!res.headersSent) {
      res.set('X-Response-Time', `${duration}ms`)
    }
    
    // Log slow requests
    if (duration > 1000) {
      logger.performanceLogger(`${req.method} ${req.path}`, duration, {
        userId: req.user?._id,
        statusCode: res.statusCode
      })
    }
  })
  
  next()
}

// Request ID middleware
export const requestId = (req, res, next) => {
  const id = Math.random().toString(36).substring(2, 15)
  req.requestId = id
  
  // Only set header if headers haven't been sent yet
  if (!res.headersSent) {
    res.set('X-Request-ID', id)
  }
  
  next()
}

// CORS headers middleware (additional to main CORS)
export const corsHeaders = (req, res, next) => {
  // Only set headers if they haven't been sent yet
  if (!res.headersSent) {
    res.set('X-Content-Type-Options', 'nosniff')
    res.set('X-Frame-Options', 'DENY')
    res.set('X-XSS-Protection', '1; mode=block')
  }
  next()
}

// API versioning middleware
export const apiVersion = (req, res, next) => {
  // Only set header if headers haven't been sent yet
  if (!res.headersSent) {
    res.set('API-Version', '1.0.0')
  }
  next()
}

// Health check middleware (removed to avoid conflicts with dedicated route)
export const healthCheck = (req, res, next) => {
  // Let dedicated health route handle health checks
  next()
}

// Request sanitization middleware
export const sanitizeRequest = (req, res, next) => {
  // Remove null bytes
  const sanitizeString = (str) => {
    if (typeof str === 'string') {
      return str.replace(/\0/g, '')
    }
    return str
  }
  
  const sanitizeObject = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = sanitizeString(obj[key])
        } else if (typeof obj[key] === 'object') {
          sanitizeObject(obj[key])
        }
      }
    }
  }
  
  sanitizeObject(req.body)
  sanitizeObject(req.query)
  sanitizeObject(req.params)
  
  next()
}

// Rate limit info middleware
export const rateLimitInfo = (req, res, next) => {
  res.on('finish', () => {
    const remaining = res.get('X-RateLimit-Remaining')
    const limit = res.get('X-RateLimit-Limit')
    
    if (remaining && limit) {
      const usage = ((limit - remaining) / limit) * 100
      
      if (usage > 80) {
        logger.warn('High rate limit usage', {
          ip: req.ip,
          usage: `${usage.toFixed(1)}%`,
          remaining,
          limit
        })
      }
    }
  })
  
  next()
}

// Database connection check middleware
export const dbHealthCheck = async (req, res, next) => {
  try {
    const mongoose = await import('mongoose')
    
    if (mongoose.default.connection.readyState !== 1) {
      logger.error('Database connection lost')
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable'
      })
    }
  } catch (error) {
    logger.error('Database health check failed', { error: error.message })
    return res.status(503).json({
      success: false,
      message: 'Database health check failed'
    })
  }
  
  next()
}

// Maintenance mode middleware
export const maintenanceMode = (req, res, next) => {
  if (process.env.MAINTENANCE_MODE === 'true') {
    return res.status(503).json({
      success: false,
      message: 'System is under maintenance. Please try again later.',
      retryAfter: process.env.MAINTENANCE_RETRY_AFTER || '3600'
    })
  }
  next()
}

// Feature flag middleware
export const featureFlag = (flagName) => {
  return (req, res, next) => {
    const isEnabled = process.env[`ENABLE_${flagName.toUpperCase()}`] === 'true'
    
    if (!isEnabled) {
      return res.status(404).json({
        success: false,
        message: 'Feature not available'
      })
    }
    
    next()
  }
}