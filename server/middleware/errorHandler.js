import AnalyticsService from '../services/analyticsService.js'

// Custom error class
export class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
    
    Error.captureStackTrace(this, this.constructor)
  }
}

// Async error handler wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Development error response
const sendErrorDev = (err, res) => {
  // Check if headers have already been sent
  if (res.headersSent) {
    return
  }
  
  res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack
  })
}

// Production error response
const sendErrorProd = (err, res) => {
  // Check if headers have already been sent
  if (res.headersSent) {
    return
  }
  
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message
    })
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err)
    
    res.status(500).json({
      success: false,
      message: 'Something went wrong!'
    })
  }
}

// Handle MongoDB cast errors
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`
  return new AppError(message, 400)
}

// Handle MongoDB duplicate field errors
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]
  const message = `Duplicate field value: ${value}. Please use another value!`
  return new AppError(message, 400)
}

// Handle MongoDB validation errors
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message)
  const message = `Invalid input data. ${errors.join('. ')}`
  return new AppError(message, 400)
}

// Handle JWT errors
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401)

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401)

// Handle Multer errors
const handleMulterError = (err) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return new AppError('File too large. Please upload a smaller file.', 400)
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return new AppError('Too many files. Please upload fewer files.', 400)
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError('Unexpected file field. Please check your upload.', 400)
  }
  return new AppError('File upload error. Please try again.', 400)
}

// Main error handling middleware
export const globalErrorHandler = async (err, req, res, next) => {
  // If headers have already been sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err)
  }

  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  // Track error in analytics
  try {
    if (req.user) {
      await AnalyticsService.trackError(req.user._id, {
        errorMessage: err.message,
        statusCode: err.statusCode,
        path: req.path,
        method: req.method,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        stack: err.stack
      })
    }
  } catch (analyticsError) {
    console.error('Error tracking analytics:', analyticsError)
  }

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res)
  } else {
    let error = { ...err }
    error.message = err.message

    // Handle specific error types
    if (error.name === 'CastError') error = handleCastErrorDB(error)
    if (error.code === 11000) error = handleDuplicateFieldsDB(error)
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error)
    if (error.name === 'JsonWebTokenError') error = handleJWTError()
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError()
    if (error.name === 'MulterError') error = handleMulterError(error)

    sendErrorProd(error, res)
  }
}

// 404 handler
export const notFoundHandler = (req, res, next) => {
  const err = new AppError(`Can't find ${req.originalUrl} on this server!`, 404)
  next(err)
}

// Unhandled promise rejection handler
export const handleUnhandledRejection = () => {
  process.on('unhandledRejection', (err, promise) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...')
    console.log(err.name, err.message)
    process.exit(1)
  })
}

// Uncaught exception handler
export const handleUncaughtException = () => {
  process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...')
    console.log(err.name, err.message)
    process.exit(1)
  })
}

// Graceful shutdown handler
export const handleGracefulShutdown = (server) => {
  const shutdown = (signal) => {
    console.log(`${signal} received. Shutting down gracefully...`)
    server.close(() => {
      console.log('Process terminated')
      process.exit(0)
    })
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}