#!/usr/bin/env node

// Direct API test for production login
const API_URL = 'https://classroom-assignment-50uu.onrender.com/api'

async function testProductionLogin() {
    console.log('🧪 Testing Production Login API...')
    console.log(`API URL: ${API_URL}`)

    try {
        // Test 1: Health Check
        console.log('\n1️⃣ Health Check...')
        const healthResponse = await fetch(`${API_URL}/health`)
        const healthData = await healthResponse.json()
        
        if (healthData.success) {
            console.log('✅ Backend is healthy')
            console.log(`   Database: ${healthData.database}`)
            console.log(`   Environment: ${healthData.environment}`)
        } else {
            console.log('❌ Backend health check failed')
            return
        }

        // Test 2: Try multiple login credentials
        const testCredentials = [
            { email: 'admin@example.com', password: 'admin123' },
            { email: 'viditj47@gmail.com', password: 'Visheshjain18@' },
            { email: 'admin@classroom.com', password: 'admin123' }
        ]

        console.log('\n2️⃣ Testing Login Credentials...')
        
        for (const creds of testCredentials) {
            console.log(`\nTesting: ${creds.email}`)
            
            const loginResponse = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(creds)
            })

            const loginData = await loginResponse.json()
            
            console.log(`Status: ${loginResponse.status}`)
            console.log(`Success: ${loginData.success}`)
            
            if (loginData.success) {
                console.log(`✅ LOGIN SUCCESS for ${creds.email}`)
                console.log(`   User: ${loginData.data.user.name}`)
                console.log(`   Role: ${loginData.data.user.role}`)
            } else {
                console.log(`❌ LOGIN FAILED for ${creds.email}`)
                console.log(`   Message: ${loginData.message}`)
                
                // Additional debugging
                if (loginData.message === 'Invalid email or password') {
                    console.log('   🔍 This could mean:')
                    console.log('     - User does not exist in database')
                    console.log('     - Password hash mismatch')
                    console.log('     - User is not active')
                }
            }
        }

        // Test 3: Check if any users exist
        console.log('\n3️⃣ Checking database connection...')
        const testResponse = await fetch(`${API_URL}/test`)
        if (testResponse.ok) {
            console.log('✅ API endpoints are accessible')
        } else {
            console.log('❌ API endpoints have issues')
        }

        console.log('\n📋 Next Steps:')
        console.log('1. Run: node fix-production-users.js')
        console.log('2. Wait 30 seconds for database sync')
        console.log('3. Try login again with: admin@example.com / admin123')

    } catch (error) {
        console.error('❌ Test failed:', error.message)
        console.log('\n🔧 Troubleshooting:')
        console.log('1. Check if Render service is running')
        console.log('2. Verify database connection')
        console.log('3. Check environment variables')
    }
}

testProductionLogin()