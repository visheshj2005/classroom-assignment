#!/usr/bin/env node

// Test API directly without database connection
const API_URL = 'https://classroom-assignment-50uu.onrender.com/api'

async function testAPIDirectly() {
    console.log('🧪 Testing API Directly...')
    console.log('=' .repeat(50))

    try {
        // Test 1: Health Check
        console.log('\n1️⃣ Health Check...')
        const healthResponse = await fetch(`${API_URL}/health`)
        const healthData = await healthResponse.json()
        
        console.log(`Status: ${healthResponse.status}`)
        console.log('Response:', JSON.stringify(healthData, null, 2))
        
        if (healthData.success) {
            console.log('✅ Backend is healthy')
            console.log(`   Database: ${healthData.database}`)
            console.log(`   Environment: ${healthData.environment}`)
        } else {
            console.log('❌ Backend health check failed')
            return
        }

        // Test 2: Test endpoint
        console.log('\n2️⃣ Test Endpoint...')
        const testResponse = await fetch(`${API_URL}/test`)
        const testData = await testResponse.json()
        
        console.log(`Status: ${testResponse.status}`)
        console.log('Response:', JSON.stringify(testData, null, 2))

        // Test 3: Try common login credentials
        const testCredentials = [
            { email: 'admin@example.com', password: 'admin123' },
            { email: 'viditj47@gmail.com', password: 'Visheshjain18@' },
            { email: 'admin@classroom.com', password: 'admin123' },
            { email: 'sarah.johnson@classroom.com', password: 'teacher123' },
            { email: 'michael.chen@classroom.com', password: 'teacher123' },
            { email: 'alice.smith@student.com', password: 'student123' },
            { email: 'test@example.com', password: 'password123' }
        ]

        console.log('\n3️⃣ Testing Login Credentials...')
        console.log('=' .repeat(50))
        
        let successfulLogins = []
        
        for (const creds of testCredentials) {
            console.log(`\nTesting: ${creds.email}`)
            
            try {
                const loginResponse = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(creds)
                })

                const loginData = await loginResponse.json()
                
                console.log(`   Status: ${loginResponse.status}`)
                
                if (loginData.success) {
                    console.log(`   ✅ SUCCESS!`)
                    console.log(`   User: ${loginData.data.user.name}`)
                    console.log(`   Role: ${loginData.data.user.role}`)
                    successfulLogins.push({
                        email: creds.email,
                        password: creds.password,
                        user: loginData.data.user
                    })
                } else {
                    console.log(`   ❌ FAILED: ${loginData.message}`)
                }
            } catch (error) {
                console.log(`   ❌ ERROR: ${error.message}`)
            }
        }

        // Summary
        console.log('\n' + '=' .repeat(50))
        console.log('📋 SUMMARY')
        console.log('=' .repeat(50))
        
        if (successfulLogins.length > 0) {
            console.log(`✅ Found ${successfulLogins.length} working login(s):`)
            successfulLogins.forEach(login => {
                console.log(`   📧 ${login.email} / ${login.password}`)
                console.log(`   👤 ${login.user.name} (${login.user.role})`)
                console.log('   ---')
            })
            
            console.log('\n🎉 SOLUTION FOUND!')
            console.log('Use any of the working credentials above to login.')
            console.log('Frontend URL: https://classroom-assignment-pqcj.vercel.app/login')
        } else {
            console.log('❌ No working credentials found.')
            console.log('\n🔧 Possible issues:')
            console.log('1. No users exist in database')
            console.log('2. Password hashing is inconsistent')
            console.log('3. Database connection issues')
            console.log('4. Users exist but with different passwords')
            
            console.log('\n💡 Next steps:')
            console.log('1. Check Render logs for detailed login debugging')
            console.log('2. Run the database seeder to create users')
            console.log('3. Try the Postman collection with different passwords')
        }

    } catch (error) {
        console.error('❌ API test failed:', error.message)
        console.log('\n🔧 Troubleshooting:')
        console.log('1. Check if Render service is running')
        console.log('2. Verify the API URL is correct')
        console.log('3. Check network connectivity')
    }
}

testAPIDirectly()