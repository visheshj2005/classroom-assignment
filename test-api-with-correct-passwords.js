#!/usr/bin/env node

// Test API with correct passwords from seeder (plain text that gets hashed)
const API_URL = 'https://classroom-assignment-50uu.onrender.com/api'

async function testAPIWithCorrectPasswords() {
    console.log('🧪 Testing API with Correct Seeder Passwords...')
    console.log('='.repeat(60))
    console.log('Note: These are the ORIGINAL passwords from seeder that get hashed')
    console.log('='.repeat(60))

    try {
        // Test 1: Health Check
        console.log('\n1️⃣ Health Check...')
        const healthResponse = await fetch(`${API_URL}/health`)
        const healthData = await healthResponse.json()

        console.log(`Status: ${healthResponse.status}`)
        console.log('Response:', JSON.stringify(healthData, null, 2))

        if (!healthData.success) {
            console.log('❌ Backend health check failed - stopping tests')
            return
        }

        console.log('✅ Backend is healthy')
        console.log(`   Database: ${healthData.database}`)
        console.log(`   Environment: ${healthData.environment}`)

        // Test 2: Login with EXACT seeder credentials
        // These are the plain text passwords that get hashed by the User model
        const seederCredentials = [
            {
                // name: 'System Administrator',
                email: 'admin@classroom.com',
                password: 'admin123'  // This gets hashed to passwordHash in DB
                // role: 'admin'
            },
            {
                // name: 'Dr. Sarah Johnson',
                email: 'sarah.johnson@classroom.com',
                password: 'teacher123'  // This gets hashed to passwordHash in DB
                // role: 'teacher'
            },
            {
                // name: 'Prof. Michael Chen',
                email: 'michael.chen@classroom.com',
                password: 'teacher123',  // This gets hashed to passwordHash in DB
                // role: 'teacher'
            },
            {
                // name: 'Dr. Emily Rodriguez',
                email: 'emily.rodriguez@classroom.com',
                password: 'teacher123',  // This gets hashed to passwordHash in DB
                // role: 'teacher'
            },
            {
                // name: 'Alice Smith',
                email: 'alice.smith@student.com',
                password: 'student123',  // This gets hashed to passwordHash in DB
                // role: 'student'
            },
            {
                // name: 'Bob Wilson',
                email: 'bob.wilson@student.com',
                password: 'student123',  // This gets hashed to passwordHash in DB
                // role: 'student'
            }
        ]

        console.log('\n2️⃣ Testing Seeder Credentials...')
        console.log('='.repeat(60))

        let successfulLogins = []
        let failedLogins = []

        for (const creds of seederCredentials) {
            console.log(`\n🔐 Testing: ${creds.email}`)
            console.log(`   Expected: ${creds.name} (${creds.role})`)
            console.log(`   Password: ${creds.password}`)

            try {
                const loginResponse = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: creds.email,
                        password: creds.password
                    })
                })

                const loginData = await loginResponse.json()

                console.log(`   Status: ${loginResponse.status}`)

                if (loginData.success) {
                    console.log(`   ✅ SUCCESS!`)
                    console.log(`   👤 User: ${loginData.data.user.name}`)
                    console.log(`   🎭 Role: ${loginData.data.user.role}`)
                    console.log(`   📧 Email: ${loginData.data.user.email}`)
                    console.log(`   ✅ Active: ${loginData.data.user.isActive}`)

                    successfulLogins.push({
                        email: creds.email,
                        password: creds.password,
                        user: loginData.data.user
                    })
                } else {
                    console.log(`   ❌ FAILED: ${loginData.message}`)
                    failedLogins.push({
                        email: creds.email,
                        password: creds.password,
                        error: loginData.message,
                        status: loginResponse.status
                    })
                }
            } catch (error) {
                console.log(`   ❌ ERROR: ${error.message}`)
                failedLogins.push({
                    email: creds.email,
                    password: creds.password,
                    error: error.message,
                    status: 'network_error'
                })
            }
        }

        // Test 3: Also test your personal admin account
        console.log('\n3️⃣ Testing Personal Admin Account...')
        console.log('='.repeat(60))

        const personalAdmin = {
            email: 'viditj47@gmail.com',
            password: 'Visheshjain18@'
        }

        console.log(`\n🔐 Testing: ${personalAdmin.email}`)
        console.log(`   Password: ${personalAdmin.password}`)

        try {
            const loginResponse = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(personalAdmin)
            })

            const loginData = await loginResponse.json()

            console.log(`   Status: ${loginResponse.status}`)

            if (loginData.success) {
                console.log(`   ✅ SUCCESS!`)
                console.log(`   👤 User: ${loginData.data.user.name}`)
                console.log(`   🎭 Role: ${loginData.data.user.role}`)
                successfulLogins.push({
                    email: personalAdmin.email,
                    password: personalAdmin.password,
                    user: loginData.data.user
                })
            } else {
                console.log(`   ❌ FAILED: ${loginData.message}`)
                failedLogins.push({
                    email: personalAdmin.email,
                    password: personalAdmin.password,
                    error: loginData.message,
                    status: loginResponse.status
                })
            }
        } catch (error) {
            console.log(`   ❌ ERROR: ${error.message}`)
        }

        // Summary
        console.log('\n' + '='.repeat(60))
        console.log('📊 TEST RESULTS SUMMARY')
        console.log('='.repeat(60))

        console.log(`✅ Successful Logins: ${successfulLogins.length}`)
        console.log(`❌ Failed Logins: ${failedLogins.length}`)

        if (successfulLogins.length > 0) {
            console.log('\n🎉 WORKING CREDENTIALS:')
            successfulLogins.forEach(login => {
                console.log(`   📧 ${login.email}`)
                console.log(`   🔑 ${login.password}`)
                console.log(`   👤 ${login.user.name} (${login.user.role})`)
                console.log('   ---')
            })

            console.log('\n✅ SOLUTION FOUND!')
            console.log('Use any of the working credentials above to login.')
            console.log('🌐 Login URL: https://classroom-assignment-pqcj.vercel.app/login')

            console.log('\n📋 For Frontend Testing:')
            console.log('1. Go to the login page')
            console.log('2. Use any of the working email/password combinations above')
            console.log('3. You should be able to login successfully')

        } else {
            console.log('\n❌ NO WORKING CREDENTIALS FOUND')
            console.log('\n🔍 Analysis of Failed Logins:')

            const errorTypes = {}
            failedLogins.forEach(fail => {
                const errorKey = fail.error || 'unknown'
                if (!errorTypes[errorKey]) {
                    errorTypes[errorKey] = []
                }
                errorTypes[errorKey].push(fail.email)
            })

            Object.keys(errorTypes).forEach(error => {
                console.log(`   ${error}: ${errorTypes[error].length} accounts`)
                errorTypes[error].forEach(email => {
                    console.log(`     - ${email}`)
                })
            })

            console.log('\n💡 Possible Solutions:')
            if (failedLogins.some(f => f.error === 'Invalid email or password')) {
                console.log('1. Users might not exist in database - run seeder')
                console.log('2. Password hashing might be inconsistent')
                console.log('3. Database might be empty')
            }
            console.log('4. Check Render logs for detailed debugging')
            console.log('5. Run: node server/seeders/demoData.js')
        }

    } catch (error) {
        console.error('❌ API test failed:', error.message)
        console.log('\n🔧 Troubleshooting:')
        console.log('1. Check if Render service is running')
        console.log('2. Verify the API URL is correct')
        console.log('3. Check network connectivity')
        console.log('4. Verify backend deployment is complete')
    }
}

testAPIWithCorrectPasswords()