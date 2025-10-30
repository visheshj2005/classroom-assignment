#!/usr/bin/env node

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import User from './server/models/User.js'

// Load environment variables
dotenv.config({ path: './server/.env' })

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/classroom-assignment')
    console.log('MongoDB Connected for password fixing')
  } catch (error) {
    console.error('Database connection error:', error)
    process.exit(1)
  }
}

const fixPasswords = async () => {
  try {
    console.log('🔍 Checking for users with plain text passwords...')
    
    // Get all users
    const users = await User.find({}).select('+passwordHash')
    console.log(`Found ${users.length} users to check`)
    
    let fixedCount = 0
    
    for (const user of users) {
      try {
        // Try to compare the stored password with itself using bcrypt
        // If it's already hashed, this will work. If it's plain text, it will fail.
        const isHashed = await bcrypt.compare(user.passwordHash, user.passwordHash)
        
        if (!isHashed) {
          // Password is likely plain text, need to hash it
          console.log(`🔧 Fixing password for user: ${user.email}`)
          
          // Hash the plain text password
          const salt = await bcrypt.genSalt(12)
          const hashedPassword = await bcrypt.hash(user.passwordHash, salt)
          
          // Update the user directly in the database
          await User.updateOne(
            { _id: user._id },
            { passwordHash: hashedPassword }
          )
          
          fixedCount++
        } else {
          console.log(`✅ Password already hashed for user: ${user.email}`)
        }
      } catch (error) {
        // If bcrypt.compare fails, the password is likely plain text
        console.log(`🔧 Fixing password for user: ${user.email} (bcrypt compare failed)`)
        
        try {
          // Hash the plain text password
          const salt = await bcrypt.genSalt(12)
          const hashedPassword = await bcrypt.hash(user.passwordHash, salt)
          
          // Update the user directly in the database
          await User.updateOne(
            { _id: user._id },
            { passwordHash: hashedPassword }
          )
          
          fixedCount++
        } catch (hashError) {
          console.error(`❌ Failed to fix password for user ${user.email}:`, hashError.message)
        }
      }
    }
    
    console.log(`\n✅ Password fixing complete!`)
    console.log(`📊 Fixed ${fixedCount} passwords`)
    console.log(`📊 ${users.length - fixedCount} passwords were already hashed`)
    
  } catch (error) {
    console.error('❌ Error fixing passwords:', error)
  }
}

const main = async () => {
  try {
    await connectDB()
    await fixPasswords()
    
    console.log('\n🎉 All done! You can now test login with the following credentials:')
    console.log('Admin: admin@classroom.com / admin123')
    console.log('Teacher: sarah.johnson@classroom.com / teacher123')
    console.log('Student: alice.smith@student.com / student123')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Script failed:', error)
    process.exit(1)
  }
}

main()