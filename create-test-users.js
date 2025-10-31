// Test user creation script for local testing
// Run this with: node create-test-users.js
// Working on localhost
import mongoose from 'mongoose'
import User from './server/models/User.js'
import dotenv from 'dotenv'

dotenv.config({ path: './server/.env' })

const testUsers = [
  {
    name: 'Admin User',
    email: 'admin@test.com',
    passwordHash: 'password123',
    role: 'admin'
  },
  {
    name: 'Teacher One',
    email: 'teacher1@test.com',
    passwordHash: 'password123',
    role: 'teacher'
  },
  {
    name: 'Teacher Two',
    email: 'teacher2@test.com',
    passwordHash: 'password123',
    role: 'teacher'
  },
  {
    name: 'Student One',
    email: 'student1@test.com',
    passwordHash: 'password123',
    role: 'student'
  },
  {
    name: 'Student Two',
    email: 'student2@test.com',
    passwordHash: 'password123',
    role: 'student'
  },
  {
    name: 'Student Three',
    email: 'student3@test.com',
    passwordHash: 'password123',
    role: 'student'
  }
]

async function createTestUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/classroom-assignment')
    console.log('Connected to MongoDB')

    // Clear existing test users
    await User.deleteMany({ email: { $in: testUsers.map(u => u.email) } })
    console.log('Cleared existing test users')

    // Create new test users
    for (const userData of testUsers) {
      const user = new User(userData)
      await user.save()
      console.log(`Created user: ${userData.email} (${userData.role})`)
    }

    console.log('\n✅ Test users created successfully!')
    console.log('\nYou can now login with:')
    testUsers.forEach(user => {
      console.log(`${user.role}: ${user.email} / password123`)
    })

    process.exit(0)
  } catch (error) {
    console.error('Error creating test users:', error)
    process.exit(1)
  }
}

createTestUsers()