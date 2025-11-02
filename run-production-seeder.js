#!/usr/bin/env node

// Run the seeder on production database to ensure users exist
import mongoose from 'mongoose'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: './server/.env' })

// Import the seeder
import seedDatabase from './server/seeders/demoData.js'

async function runProductionSeeder() {
    try {
        console.log('🌱 Running Production Seeder...')
        console.log('=' .repeat(50))
        console.log('This will create demo users in your production database')
        console.log('=' .repeat(50))

        // Override the MongoDB URI to use production
        console.log('Database URI:', process.env.MONGODB_URI ? 'Set' : 'Not set')
        
        if (!process.env.MONGODB_URI) {
            console.log('❌ MONGODB_URI not found in environment variables')
            console.log('Make sure server/.env file exists with MONGODB_URI')
            process.exit(1)
        }

        console.log('\n🚀 Starting seeder...')
        
        // The seeder will handle connection and seeding
        await seedDatabase()
        
        console.log('\n🎉 Production seeding complete!')
        console.log('\n📋 You can now test with these credentials:')
        console.log('Admin: admin@classroom.com / admin123')
        console.log('Teacher: sarah.johnson@classroom.com / teacher123')
        console.log('Student: alice.smith@student.com / student123')
        
        console.log('\n🧪 Run this to test:')
        console.log('node test-api-with-correct-passwords.js')

    } catch (error) {
        console.error('❌ Production seeding failed:', error.message)
        console.error('Stack:', error.stack)
        
        if (error.message.includes('timeout')) {
            console.log('\n🔧 Database connection timeout. Solutions:')
            console.log('1. Check if MongoDB URI is correct')
            console.log('2. Verify network connectivity')
            console.log('3. Check if MongoDB Atlas allows connections')
        }
        
        process.exit(1)
    }
}

runProductionSeeder()