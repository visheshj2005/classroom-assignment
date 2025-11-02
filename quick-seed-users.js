#!/usr/bin/env node

// Quick seeder to create essential users
import mongoose from 'mongoose'
import User from './server/models/User.js'
import dotenv from 'dotenv'

dotenv.config({ path: './server/.env' })

async function quickSeedUsers() {
    try {
        console.log('🌱 Quick Seed Users...')
        console.log('=' .repeat(40))

        // Connect with better timeout settings
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 60000,
            connectTimeoutMS: 30000,
            maxPoolSize: 5,
            minPoolSize: 1
        })
        console.log('✅ Connected to database')

        // Essential users to create
        const users = [
            {
                name: 'Admin User',
                email: 'admin@example.com',
                passwordHash: 'admin123',
                role: 'admin'
            },
            {
                name: 'Vishesh Jain',
                email: 'viditj47@gmail.com',
                passwordHash: 'Visheshjain18@',
                role: 'admin'
            },
            {
                name: 'System Administrator',
                email: 'admin@classroom.com',
                passwordHash: 'admin123',
                role: 'admin'
            },
            {
                name: 'Dr. Sarah Johnson',
                email: 'sarah.johnson@classroom.com',
                passwordHash: 'teacher123',
                role: 'teacher'
            },
            {
                name: 'Test Student',
                email: 'student@example.com',
                passwordHash: 'student123',
                role: 'student'
            }
        ]

        console.log('🗑️ Clearing existing users...')
        await User.deleteMany({})

        console.log('👥 Creating users...')
        for (const userData of users) {
            const user = new User({
                name: userData.name,
                email: userData.email,
                passwordHash: userData.passwordHash, // Will be hashed by pre-save middleware
                role: userData.role,
                isActive: true,
                createdAt: new Date()
            })

            await user.save()
            console.log(`✅ Created: ${userData.email} (${userData.role})`)
        }

        console.log('\n🧪 Testing password hashing...')
        for (const userData of users) {
            const user = await User.findOne({ email: userData.email })
            const isValid = await user.comparePassword(userData.passwordHash)
            console.log(`${userData.email}: ${isValid ? '✅ VALID' : '❌ INVALID'}`)
        }

        await mongoose.disconnect()
        
        console.log('\n🎉 Users created successfully!')
        console.log('\n📋 Login Credentials:')
        users.forEach(user => {
            console.log(`   ${user.email} / ${user.passwordHash}`)
        })
        
        console.log('\n🌐 Test at: https://classroom-assignment-pqcj.vercel.app/login')

    } catch (error) {
        console.error('❌ Seeding failed:', error.message)
        
        if (error.message.includes('timeout')) {
            console.log('\n🔧 Database connection timeout. Possible solutions:')
            console.log('1. Check if MongoDB URI is correct')
            console.log('2. Verify network connectivity')
            console.log('3. Check if MongoDB Atlas allows connections from your IP')
            console.log('4. Try running from a different network')
        }
        
        process.exit(1)
    }
}

quickSeedUsers()