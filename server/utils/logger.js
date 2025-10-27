import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
}

class Logger {
  constructor() {
    this.logLevel = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] || LOG_LEVELS.INFO
    this.logFile = process.env.LOG_FILE || path.join(logsDir, 'app.log')
    this.errorFile = path.join(logsDir, 'error.log')
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString()
    const metaString = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : ''
    return `[${timestamp}] [${level}] ${message}${metaString}\n`
  }

  writeToFile(filename, content) {
    try {
      fs.appendFileSync(filename, content)
    } catch (error) {
      console.error('Failed to write to log file:', error)
    }
  }

  log(level, message, meta = {}) {
    const levelValue = LOG_LEVELS[level]
    
    if (levelValue <= this.logLevel) {
      const formattedMessage = this.formatMessage(level, message, meta)
      
      // Console output with colors
      const colors = {
        ERROR: '\x1b[31m', // Red
        WARN: '\x1b[33m',  // Yellow
        INFO: '\x1b[36m',  // Cyan
        DEBUG: '\x1b[35m'  // Magenta
      }
      
      console.log(`${colors[level]}${formattedMessage.trim()}\x1b[0m`)
      
      // File output
      this.writeToFile(this.logFile, formattedMessage)
      
      // Error file for errors and warnings
      if (levelValue <= LOG_LEVELS.WARN) {
        this.writeToFile(this.errorFile, formattedMessage)
      }
    }
  }

  error(message, meta = {}) {
    this.log('ERROR', message, meta)
  }

  warn(message, meta = {}) {
    this.log('WARN', message, meta)
  }

  info(message, meta = {}) {
    this.log('INFO', message, meta)
  }

  debug(message, meta = {}) {
    this.log('DEBUG', message, meta)
  }

  // HTTP request logger
  httpLogger() {
    return (req, res, next) => {
      const start = Date.now()
      
      res.on('finish', () => {
        const duration = Date.now() - start
        const { method, url, ip } = req
        const { statusCode } = res
        
        const level = statusCode >= 400 ? 'ERROR' : 'INFO'
        const message = `${method} ${url} ${statusCode} ${duration}ms`
        
        this.log(level, message, {
          ip,
          userAgent: req.get('User-Agent'),
          userId: req.user?._id,
          duration
        })
      })
      
      next()
    }
  }

  // Database operation logger
  dbLogger(operation, collection, meta = {}) {
    this.info(`DB ${operation} on ${collection}`, meta)
  }

  // Authentication logger
  authLogger(event, userId, meta = {}) {
    this.info(`Auth ${event}`, { userId, ...meta })
  }

  // File operation logger
  fileLogger(operation, filename, meta = {}) {
    this.info(`File ${operation}: ${filename}`, meta)
  }

  // Performance logger
  performanceLogger(operation, duration, meta = {}) {
    const level = duration > 1000 ? 'WARN' : 'INFO'
    this.log(level, `Performance: ${operation} took ${duration}ms`, meta)
  }

  // Security logger
  securityLogger(event, meta = {}) {
    this.warn(`Security: ${event}`, meta)
  }

  // Cleanup old logs (call this periodically)
  cleanupLogs(daysToKeep = 30) {
    try {
      const files = fs.readdirSync(logsDir)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      files.forEach(file => {
        const filePath = path.join(logsDir, file)
        const stats = fs.statSync(filePath)
        
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath)
          this.info(`Cleaned up old log file: ${file}`)
        }
      })
    } catch (error) {
      this.error('Failed to cleanup logs', { error: error.message })
    }
  }
}

// Create singleton instance
const logger = new Logger()

export default logger