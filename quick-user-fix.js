#!/usr/bin/env node

// Quick fix for user login issue
import mongoose from 'mongoose'
import User from './server/models/User.js'
import dotenv from 'dotenv'

dotenv.config({ path: './server/.env' })

async function quickFix() {
    try {
        console.log('🚀 Quick User Fix Starting...')

        // Set shorter timeout
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        })
        console.log('✅ Connected to database')

        const email = 'viditj47@gmail.com'
        const password = 'Visheshjain18@'

        // Delete existing user if any
        await User.deleteOne({ email })
        console.log('🗑️ Cleared existing user')

        // Create fresh user
        const user = new User({
            name: 'Vishesh Jain',
            email: email,
            passwordHash: password, // Will be auto-hashed
            role: 'admin',
            isActive: true,
            createdAt: new Date(),
            lastLogin: null
        })

        await user.save()
        console.log('✅ User created successfully')

        // Test password immediately
        const testUser = await User.findOne({ email })
        const isValid = await testUser.comparePassword(password)

        console.log('\n🧪 Password Test Results:')
        console.log('✅ User found:', !!testUser)
        console.log('✅ Password valid:', isValid)
        console.log('✅ User active:', testUser.isActive)
        console.log('✅ User role:', testUser.role)

        if (isValid) {
            console.log('\n🎉 SUCCESS! User is ready for login')
            console.log(`📧 Email: ${email}`)
            console.log(`🔑 Password: ${password}`)
            console.log('\n🌐 Try logging in now at:')
            console.log('https://classroom-assignment-pqcj.vercel.app/login')
        } else {
            console.log('\n❌ Password test failed - there may be a hashing issue')
        }

        await mongoose.disconnect()
        process.exit(0)

    } catch (error) {
        console.error('❌ Error:', error.message)
        process.exit(1)
    }
}

quickFix()