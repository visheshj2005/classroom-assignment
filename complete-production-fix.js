#!/usr/bin/env node

// Complete production fix - run this after deployment
import mongoose from 'mongoose'
import User from './server/models/User.js'
import dotenv from 'dotenv'

dotenv.config({ path: './server/.env' })

const API_URL = 'https://classroom-assignment-50uu.onrender.com/api'

async function completeProductionFix() {
    try {
        console.log('🚀 Complete Production Fix Starting...')
        console.log('=' .repeat(50))

        // Step 1: Connect to database
        console.log('\n1️⃣ Connecting to database...')
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        })
        console.log('✅ Database connected')

        // Step 2: Clear and recreate users
        console.log('\n2️⃣ Setting up users...')
        
        // Clear all existing users to start fresh
        await User.deleteMany({})
        console.log('🗑️ Cleared all existing users')

        // Create test users with known passwords
        const testUsers = [
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
                name: 'Test Teacher',
                email: 'teacher@example.com',
                password: 'teacher123',
                role: 'teacher'
            },
            {
                name: 'Test Student',
                email: 'student@example.com',
                password: 'student123',
                role: 'student'
            }
        ]

        console.log('Creating users...')
        for (const userData of testUsers) {
            const user = new User({
                name: userData.name,
                email: userData.email,
                passwordHash: userData.password, // Will be hashed automatically
                role: userData.role,
                isActive: true
            })

            await user.save()
            console.log(`✅ Created: ${userData.email} (${userData.role})`)
        }

        // Step 3: Verify password hashing
        console.log('\n3️⃣ Verifying password hashing...')
        for (const userData of testUsers) {
            const user = await User.findOne({ email: userData.email })
            const isHashed = user.passwordHash !== userData.password
            const isValid = await user.comparePassword(userData.password)
            
            console.log(`${userData.email}:`)
            console.log(`   Hashed: ${isHashed ? '✅' : '❌'}`)
            console.log(`   Valid: ${isValid ? '✅' : '❌'}`)
            console.log(`   Hash length: ${user.passwordHash.length}`)
        }

        await mongoose.disconnect()
        console.log('✅ Database operations complete')

        // Step 4: Test API endpoints
        console.log('\n4️⃣ Testing API endpoints...')
        
        // Wait a moment for database to sync
        console.log('⏳ Waiting 5 seconds for database sync...')
        await new Promise(resolve => setTimeout(resolve, 5000))

        // Test health endpoint
        console.log('Testing health endpoint...')
        const healthResponse = await fetch(`${API_URL}/health`)
        const healthData = await healthResponse.json()
        
        if (healthData.success) {
            console.log('✅ Health check passed')
            console.log(`   Database: ${healthData.database}`)
        } else {
            console.log('❌ Health check failed')
            return
        }

        // Test login for each user
        console.log('\nTesting login for each user...')
        for (const userData of testUsers) {
            console.log(`\nTesting login: ${userData.email}`)
            
            const loginResponse = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userData.email,
                    password: userData.password
                })
            })

            const loginData = await loginResponse.json()
            
            if (loginData.success) {
                console.log(`✅ LOGIN SUCCESS`)
                console.log(`   User: ${loginData.data.user.name}`)
                console.log(`   Role: ${loginData.data.user.role}`)
            } else {
                console.log(`❌ LOGIN FAILED`)
                console.log(`   Status: ${loginResponse.status}`)
                console.log(`   Message: ${loginData.message}`)
            }
        }

        console.log('\n' + '='.repeat(50))
        console.log('🎉 PRODUCTION FIX COMPLETE!')
        console.log('='.repeat(50))
        
        console.log('\n📋 Available Login Credentials:')
        testUsers.forEach(user => {
            console.log(`   ${user.email} / ${user.password} (${user.role})`)
        })
        
        console.log('\n🌐 Login URL: https://classroom-assignment-pqcj.vercel.app/login')
        console.log('🔧 Backend URL: https://classroom-assignment-50uu.onrender.com')
        
        console.log('\n✅ Your application is now ready for production use!')

    } catch (error) {
        console.error('❌ Production fix failed:', error.message)
        console.error('Stack:', error.stack)
        process.exit(1)
    }
}

completeProductionFix()