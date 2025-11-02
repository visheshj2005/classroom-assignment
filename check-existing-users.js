#!/usr/bin/env node

// Check what users actually exist in the production database
import mongoose from 'mongoose'
import User from './server/models/User.js'
import dotenv from 'dotenv'

dotenv.config({ path: './server/.env' })

async function checkExistingUsers() {
    try {
        console.log('🔍 Checking Existing Users in Production Database...')
        console.log('=' .repeat(60))

        // Try with longer timeout and better connection options
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 60000,
            connectTimeoutMS: 30000,
            maxPoolSize: 5,
            minPoolSize: 1,
            retryWrites: true,
            retryReads: true
        })
        console.log('✅ Connected to production database')

        // Get all users from database
        const users = await User.find({}).select('name email role isActive createdAt lastLogin')
        
        console.log(`\n📊 Found ${users.length} users in database:`)
        console.log('=' .repeat(60))

        if (users.length === 0) {
            console.log('❌ NO USERS FOUND IN DATABASE!')
            console.log('This explains why login is failing.')
        } else {
            users.forEach((user, index) => {
                console.log(`\n${index + 1}. User Details:`)
                console.log(`   📧 Email: ${user.email}`)
                console.log(`   👤 Name: ${user.name}`)
                console.log(`   🎭 Role: ${user.role}`)
                console.log(`   ✅ Active: ${user.isActive}`)
                console.log(`   📅 Created: ${user.createdAt}`)
                console.log(`   🕐 Last Login: ${user.lastLogin || 'Never'}`)
            })
        }

        // Also check if there are any users with specific emails
        const commonEmails = [
            'admin@example.com',
            'viditj47@gmail.com',
            'admin@classroom.com',
            'sarah.johnson@classroom.com',
            'test@example.com'
        ]

        console.log('\n🔍 Checking for common test emails:')
        console.log('=' .repeat(60))

        for (const email of commonEmails) {
            const user = await User.findOne({ email })
            console.log(`${email}: ${user ? '✅ EXISTS' : '❌ NOT FOUND'}`)
            if (user) {
                console.log(`   Role: ${user.role}, Active: ${user.isActive}`)
            }
        }

        // Get database stats
        const totalUsers = await User.countDocuments()
        const activeUsers = await User.countDocuments({ isActive: true })
        const adminUsers = await User.countDocuments({ role: 'admin' })
        const teacherUsers = await User.countDocuments({ role: 'teacher' })
        const studentUsers = await User.countDocuments({ role: 'student' })

        console.log('\n📈 Database Statistics:')
        console.log('=' .repeat(60))
        console.log(`Total Users: ${totalUsers}`)
        console.log(`Active Users: ${activeUsers}`)
        console.log(`Admin Users: ${adminUsers}`)
        console.log(`Teacher Users: ${teacherUsers}`)
        console.log(`Student Users: ${studentUsers}`)

        await mongoose.disconnect()
        console.log('\n✅ Database check complete')

        // Generate Postman collection based on found users
        if (users.length > 0) {
            console.log('\n📋 POSTMAN TEST CREDENTIALS:')
            console.log('Use these emails with their likely passwords:')
            users.forEach(user => {
                console.log(`   ${user.email} - Try passwords: admin123, teacher123, student123, password123`)
            })
        }

    } catch (error) {
        console.error('❌ Error checking users:', error.message)
        console.error('Stack:', error.stack)
        process.exit(1)
    }
}

checkExistingUsers()