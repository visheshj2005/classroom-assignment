#!/usr/bin/env node

// Complete production user setup and verification
import mongoose from 'mongoose'
import User from './server/models/User.js'
import dotenv from 'dotenv'

dotenv.config({ path: './server/.env' })

async function fixProductionUsers() {
    try {
        console.log('🚀 Fixing Production Users...')

        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        })
        console.log('✅ Connected to production database')

        // First, let's see what users currently exist
        console.log('\n🔍 Checking existing users...')
        const existingUsers = await User.find({}).select('name email role isActive')
        console.log('Current users in database:')
        existingUsers.forEach(user => {
            console.log(`   - ${user.email} (${user.role}) - Active: ${user.isActive}`)
        })

        // Create multiple admin users for testing
        const adminUsers = [
            {
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'admin123',
                role: 'admin'
            },
            {
                name: 'Vishesh Jain',
                email: 'viditj47@gmail.com',
                password: 'Visheshjain18@',
                role: 'admin'
            },
            {
                name: 'System Admin',
                email: 'admin@classroom.com',
                password: 'admin123',
                role: 'admin'
            }
        ]

        console.log('\n🔧 Creating/Updating admin users...')
        
        for (const userData of adminUsers) {
            // Delete existing user if any
            await User.deleteOne({ email: userData.email })
            
            // Create fresh user
            const user = new User({
                name: userData.name,
                email: userData.email,
                passwordHash: userData.password, // Will be hashed by pre-save middleware
                role: userData.role,
                isActive: true,
                createdAt: new Date(),
                lastLogin: null
            })

            await user.save()
            console.log(`✅ Created user: ${userData.email}`)

            // Immediately test the password
            const testUser = await User.findOne({ email: userData.email })
            const isValid = await testUser.comparePassword(userData.password)
            
            console.log(`   Password test: ${isValid ? '✅ PASS' : '❌ FAIL'}`)
            console.log(`   Hash length: ${testUser.passwordHash.length}`)
            console.log(`   Is hashed: ${testUser.passwordHash !== userData.password ? '✅ YES' : '❌ NO'}`)
        }

        // Test all users
        console.log('\n🧪 Testing all admin users...')
        for (const userData of adminUsers) {
            const user = await User.findOne({ email: userData.email })
            if (user) {
                const isValid = await user.comparePassword(userData.password)
                console.log(`${userData.email}: ${isValid ? '✅ LOGIN OK' : '❌ LOGIN FAILED'}`)
            }
        }

        console.log('\n🎉 Production users setup complete!')
        console.log('\n📋 Available login credentials:')
        adminUsers.forEach(user => {
            console.log(`   Email: ${user.email}`)
            console.log(`   Password: ${user.password}`)
            console.log(`   Role: ${user.role}`)
            console.log('   ---')
        })

        console.log('\n🌐 Test at: https://classroom-assignment-pqcj.vercel.app/login')

        await mongoose.disconnect()
        process.exit(0)

    } catch (error) {
        console.error('❌ Error:', error.message)
        console.error('Stack:', error.stack)
        process.exit(1)
    }
}

fixProductionUsers()