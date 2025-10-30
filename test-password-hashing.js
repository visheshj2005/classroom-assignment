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
    console.log('MongoDB Connected for password testing')
  } catch (error) {
    console.error('Database connection error:', error)
    process.exit(1)
  }
}

const testPasswordHashing = async () => {
  try {
    console.log('🧪 Testing password hashing functionality...\n')
    
    // Test 1: Create a new user and verify password is hashed
    console.log('Test 1: Creating new user with pre-save middleware')
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: 'testpassword123',
      role: 'student'
    })
    
    await testUser.save()
    console.log('✅ User created successfully')
    
    // Verify password is hashed
    const savedUser = await User.findOne({ email: 'test@example.com' }).select('+passwordHash')
    const isHashed = savedUser.passwordHash !== 'testpassword123'
    console.log(`✅ Password hashed: ${isHashed ? 'YES' : 'NO'}`)
    console.log(`   Original: testpassword123`)
    console.log(`   Stored: ${savedUser.passwordHash.substring(0, 20)}...`)
    
    // Test 2: Verify password comparison works
    console.log('\nTest 2: Testing password comparison')
    const isValidPassword = await savedUser.comparePassword('testpassword123')
    const isInvalidPassword = await savedUser.comparePassword('wrongpassword')
    console.log(`✅ Correct password validates: ${isValidPassword ? 'YES' : 'NO'}`)
    console.log(`✅ Wrong password rejects: ${!isInvalidPassword ? 'YES' : 'NO'}`)
    
    // Test 3: Test updating password
    console.log('\nTest 3: Testing password update')
    savedUser.passwordHash = 'newpassword456'
    await savedUser.save()
    
    const updatedUser = await User.findOne({ email: 'test@example.com' }).select('+passwordHash')
    const newPasswordWorks = await updatedUser.comparePassword('newpassword456')
    const oldPasswordFails = await updatedUser.comparePassword('testpassword123')
    console.log(`✅ New password works: ${newPasswordWorks ? 'YES' : 'NO'}`)
    console.log(`✅ Old password fails: ${!oldPasswordFails ? 'YES' : 'NO'}`)
    
    // Test 4: Check existing users
    console.log('\nTest 4: Checking existing users')
    const allUsers = await User.find({}).select('+passwordHash').limit(5)
    
    for (const user of allUsers) {
      if (user.email === 'test@example.com') continue // Skip our test user
      
      try {
        // Check if password looks hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
        const looksHashed = /^\$2[aby]\$/.test(user.passwordHash)
        console.log(`   ${user.email}: ${looksHashed ? '✅ Hashed' : '❌ Plain text'}`)
        
        if (!looksHashed) {
          console.log(`     ⚠️  Password appears to be plain text: ${user.passwordHash}`)
        }
      } catch (error) {
        console.log(`   ${user.email}: ❌ Error checking password`)
      }
    }
    
    // Cleanup test user
    await User.deleteOne({ email: 'test@example.com' })
    console.log('\n🧹 Cleaned up test user')
    
    console.log('\n🎉 Password hashing tests completed!')
    
  } catch (error) {
    console.error('❌ Error testing password hashing:', error)
    
    // Cleanup test user in case of error
    try {
      await User.deleteOne({ email: 'test@example.com' })
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
  }
}

const main = async () => {
  try {
    await connectDB()
    await testPasswordHashing()
    
    console.log('\n📋 Summary:')
    console.log('- If you see any plain text passwords above, run: npm run fix-passwords')
    console.log('- For new users created via admin portal, passwords should now be properly hashed')
    console.log('- For new registrations, passwords are hashed automatically')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Test script failed:', error)
    process.exit(1)
  }
}

main()