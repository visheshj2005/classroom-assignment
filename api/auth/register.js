import { register } from '../../server/controllers/authController.js'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

// Connect to database if not connected
let isConnected = false

const connectDB = async () => {
  if (isConnected) return

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    })
    isConnected = true
    console.log('Database connected')
  } catch (error) {
    console.error('Database connection error:', error)
    throw error
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    await connectDB()
    
    // Simple validation
    const { name, email, password, role } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required'
      })
    }

    // Call the register controller
    await register(req, res)
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}