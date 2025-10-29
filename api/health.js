import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

export default async function handler(req, res) {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    
    res.json({
      success: true,
      message: 'API is working',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
      mongodb_uri: process.env.MONGODB_URI ? 'configured' : 'missing',
      jwt_secret: process.env.JWT_SECRET ? 'configured' : 'missing'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    })
  }
}