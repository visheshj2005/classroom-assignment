#!/usr/bin/env node

// Fix specific user password in production database
import mongoose from 'mongoose'
import User from './server/models/User.js'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

// Load production environment
dotenv.config({ path: './server/.env' })

async function fixUserPassword() {
  try {
    console.log('🔗 Connecting to production database...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB Atlas')

    const email = 'viditj47@gmail.com'
    const newPassword = 'Visheshjain18@'

    console.log(`🔍 Looking for user: ${email}`)
    
    // Find the user
    let user = await User.findOne({ email })
    
    if (!user) {
      console.log('❌ User not found, creating new user...')
      
      // Create the user if not exists
      user = new User({
        name: 'Vishesh Jain',
        email: email,
        passwordHash: newPassword, // Will be hashed by pre-save middleware
        role: 'admin',
        isActive: true
      })
      
      await user.save()
      console.log('✅ User created successfully')
    } else {
      console.log('✅ User found, updating password...')
      
      // Update password directly (will be hashed by pre-save middleware)
      user.passwordHash = newPassword
      user.isActive = true // Ensure user is active
      
      await user.save()
      console.log('✅ Password updated successfully')
    }

    // Test the password
    console.log('🧪 Testing password...')
    const isValid = await user.comparePassword(newPassword)
    
    if (isValid) {
      console.log('✅ Password test successful!')
    } else {
      console.log('❌ Password test failed!')
    }

    console.log('\n🎉 User is ready for login!')
    console.log(`📧 Email: ${email}`)
    console.log(`🔑 Password: ${newPassword}`)
    console.log(`👤 Role: ${user.role}`)
    console.log(`🟢 Active: ${user.isActive}`)

    console.log('\n🌐 Try logging in at:')
    console.log('https://classroom-assignment-pqcj.vercel.app/login')

    await mongoose.disconnect()
    console.log('📴 Disconnected from database')
    process.exit(0)

  } catch (error) {
    console.error('❌ Error fixing user password:', error)
    process.exit(1)
  }
}

fixUserPassword()