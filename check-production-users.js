// Check what users exist in production database
// This will help identify if the user exists and what the correct email is

import mongoose from 'mongoose'
import User from './server/models/User.js'
import dotenv from 'dotenv'

// Load production environment
dotenv.config({ path: './server/.env.production' })

const checkUsers = async () => {
  console.log('👥 CHECKING PRODUCTION USERS')
  console.log('=' .repeat(50))
  
  try {
    // Connect to the same database as production
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB Atlas')
    
    // Get all users
    const users = await User.find({}, 'name email role isActive createdAt').limit(10)
    
    console.log(`\n📊 Found ${users.length} users:`)
    console.log('-'.repeat(50))
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Active: ${user.isActive}`)
      console.log(`   Created: ${user.createdAt}`)
      console.log('')
    })
    
    // Check for specific emails that might be used for testing
    const testEmails = [
      'admin@test.com',
      'admin@example.com',
      'teacher@test.com',
      'student@test.com'
    ]
    
    console.log('🔍 Checking for test emails:')
    for (const email of testEmails) {
      const user = await User.findOne({ email })
      if (user) {
        console.log(`✅ ${email} - EXISTS (${user.name}, ${user.role})`)
      } else {
        console.log(`❌ ${email} - NOT FOUND`)
      }
    }
    
    // Get user count by role
    const roleStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ])
    
    console.log('\n📈 Users by role:')
    roleStats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count}`)
    })
    
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

checkUsers()