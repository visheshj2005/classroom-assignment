#!/usr/bin/env node

// Create admin user for production database
import mongoose from 'mongoose'
import User from './server/models/User.js'
import dotenv from 'dotenv'

// Load production environment
dotenv.config({ path: './server/.env' })

const adminUsers = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    passwordHash: 'admin123',
    role: 'admin'
  },
  {
    name: 'Test Admin',
    email: 'admin@test.com', 
    passwordHash: 'password123',
    role: 'admin'
  },
  {
    name: 'Demo Teacher',
    email: 'teacher@demo.com',
    passwordHash: 'teacher123',
    role: 'teacher'
  },
  {
    name: 'Demo Student',
    email: 'student@demo.com',
    passwordHash: 'student123',
    role: 'student'
  }
]

async function createProductionUsers() {
  try {
    console.log('🔗 Connecting to production database...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB Atlas')

    console.log('👥 Creating production users...')
    
    for (const userData of adminUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email })
      
      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists, skipping...`)
        continue
      }

      // Create new user
      const user = new User(userData)
      await user.save()
      console.log(`✅ Created ${userData.role}: ${userData.email}`)
    }

    console.log('\n🎉 Production users created successfully!')
    console.log('\n🔑 Login credentials:')
    adminUsers.forEach(user => {
      console.log(`${user.role.toUpperCase()}: ${user.email} / ${user.passwordHash}`)
    })

    console.log('\n🌐 Test your login at:')
    console.log('Frontend: https://classroom-assignment-pqcj.vercel.app/login')
    console.log('Backend: https://classroom-assignment-50uu.onrender.com/api/health')

    await mongoose.disconnect()
    console.log('📴 Disconnected from database')
    process.exit(0)

  } catch (error) {
    console.error('❌ Error creating production users:', error)
    process.exit(1)
  }
}

createProductionUsers()