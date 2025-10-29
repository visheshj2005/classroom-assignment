import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Import routes
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import classRoutes from './routes/classes.js'
import assignmentRoutes from './routes/assignments.js'
import submissionRoutes from './routes/submissions.js'
import commentRoutes from './routes/comments.js'
import notificationRoutes from './routes/notifications.js'
import analyticsRoutes from './routes/analytics.js'
import uploadRoutes from './routes/uploads.js'

// Import services
import './services/notificationService.js'
import './services/analyticsService.js'

// Import middleware
import logger from './utils/logger.js'
import {
  apiTracker,
  validateRequest,
  responseTime,
  requestId,
  corsHeaders,
  apiVersion,
  healthCheck,
  sanitizeRequest,
  rateLimitInfo,
  dbHealthCheck,
  maintenanceMode,
  featureFlag
} from './middleware/apiMiddleware.js'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000
const isProduction = process.env.NODE_ENV === 'production'

// Security middleware
app.use(helmet({
  contentSecurityPolicy: isProduction ? undefined : false,
  crossOriginEmbedderPolicy: false
}))

// Trust proxy for Vercel
if (isProduction) {
  app.set('trust proxy', 1)
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 200 : 1000, // More requests in production
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// Auth rate limiting (more restrictive)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Slightly more lenient for production
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
})

app.use(limiter)

// Custom middleware (simplified to avoid conflicts)
app.use(requestId)
app.use(responseTime)
app.use(corsHeaders)
app.use(apiVersion)
app.use(sanitizeRequest)
app.use(logger.httpLogger())

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
].filter(Boolean)

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
      return callback(null, true)
    }
    
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Database connection
const connectDB = async () => {
  try {
    const options = {
      maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10,
      minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE) || 5,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    }

    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/classroom-assignment',
      options
    )
    
    logger.info(`📊 MongoDB Connected: ${conn.connection.host}`)
    
    // Log database events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', { error: err.message })
    })
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected')
    })
    
    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected')
    })
    
  } catch (error) {
    logger.error('Database connection error', { error: error.message })
    process.exit(1)
  }
}

// Serve static files in production
if (isProduction) {
  app.use(express.static(path.join(__dirname, '../dist')))
}

// Routes
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/classes', classRoutes)
app.use('/api/assignments', assignmentRoutes)
app.use('/api/submissions', submissionRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/notifications', featureFlag('notifications'), notificationRoutes)
app.use('/api/analytics', featureFlag('analytics'), analyticsRoutes)
app.use('/api/uploads', featureFlag('file_uploads'), uploadRoutes)

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    
    // Check S3 configuration (if enabled)
    const { isS3Configured } = await import('./services/s3Service.js')
    const s3Status = isS3Configured() ? 'configured' : 'local-storage'
    
    res.json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
      fileStorage: s3Status,
      version: '1.0.0'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    })
  }
})

// Serve React app in production
if (isProduction) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'))
  })
} else {
  // 404 handler for development
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found'
    })
  })
}

// Import error handlers
import { 
  globalErrorHandler, 
  notFoundHandler, 
  handleUnhandledRejection, 
  handleUncaughtException,
  handleGracefulShutdown 
} from './middleware/errorHandler.js'

// Handle uncaught exceptions
handleUncaughtException()

// 404 handler for undefined routes
app.use(notFoundHandler)

// Global error handler
app.use(globalErrorHandler)

// Start server
const startServer = async () => {
  await connectDB()
  
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`)
    console.log(`📁 Upload path: ${process.env.UPLOAD_PATH || './uploads'}`)
  })

  // Handle graceful shutdown
  handleGracefulShutdown(server)
  
  return server
}

// Handle unhandled promise rejections
handleUnhandledRejection()

startServer().catch(error => {
  console.error('❌ Failed to start server:', error)
  process.exit(1)
})