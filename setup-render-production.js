#!/usr/bin/env node

// Production setup script for Render deployment
import mongoose from 'mongoose'
import User from './server/models/User.js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: './server/.env' })

async function setupProduction() {
    try {
        console.log('🚀 Setting up production environment...')

        // Connect to database with production settings
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        })
        console.log('✅ Connected to production database')

        // Create admin user with consistent hashing
        const adminEmail = 'viditj47@gmail.com'
        const adminPassword = 'Visheshjain18@'

        // Delete existing admin if any
        await User.deleteOne({ email: adminEmail })
        console.log('🗑️ Cleared existing admin user')

        // Create fresh admin user
        const admin = new User({
            name: 'Vishesh Jain',
            email: adminEmail,
            passwordHash: adminPassword, // Will be hashed by pre-save middleware
            role: 'admin',
            isActive: true,
            createdAt: new Date(),
            lastLogin: null
        })

        await admin.save()
        console.log('✅ Admin user created successfully')

        // Verify password hashing worked correctly
        const testAdmin = await User.findOne({ email: adminEmail })
        const isPasswordValid = await testAdmin.comparePassword(adminPassword)

        console.log('\n🧪 Production Setup Verification:')
        console.log('✅ Admin user found:', !!testAdmin)
        console.log('✅ Password validation:', isPasswordValid)
        console.log('✅ User active:', testAdmin.isActive)
        console.log('✅ User role:', testAdmin.role)
        console.log('✅ Password hashed:', testAdmin.passwordHash !== adminPassword)

        if (isPasswordValid) {
            console.log('\n🎉 SUCCESS! Production setup complete')
            console.log(`📧 Admin Email: ${adminEmail}`)
            console.log(`🔑 Admin Password: ${adminPassword}`)
            console.log('\n🌐 Ready for deployment!')
        } else {
            console.log('\n❌ Password validation failed - check environment variables')
            console.log('Make sure BCRYPT_ROUNDS is set consistently')
        }

        await mongoose.disconnect()
        process.exit(0)

    } catch (error) {
        console.error('❌ Production setup failed:', error.message)
        console.error('Stack:', error.stack)
        process.exit(1)
    }
}

setupProduction()