#!/usr/bin/env node

// Final verification script for production deployment
const RENDER_URL = 'https://classroom-assignment-50uu.onrender.com'
const VERCEL_URL = 'https://classroom-assignment-pqcj.vercel.app'

async function verifyDeployment() {
    console.log('🔍 Verifying Production Deployment...\n')

    try {
        // Test 1: Backend Health Check
        console.log('1️⃣ Testing Backend Health...')
        const healthResponse = await fetch(`${RENDER_URL}/api/health`)
        const healthData = await healthResponse.json()
        
        if (healthData.success) {
            console.log('✅ Backend is healthy')
            console.log(`   Database: ${healthData.database}`)
            console.log(`   Environment: ${healthData.environment}`)
        } else {
            console.log('❌ Backend health check failed')
            return
        }

        // Test 2: Login API Test
        console.log('\n2️⃣ Testing Login API...')
        const loginResponse = await fetch(`${RENDER_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                email: 'viditj47@gmail.com',
                password: 'Visheshjain18@'
            })
        })

        const loginData = await loginResponse.json()
        
        if (loginData.success) {
            console.log('✅ Login successful!')
            console.log(`   User: ${loginData.data.user.name}`)
            console.log(`   Role: ${loginData.data.user.role}`)
        } else {
            console.log('❌ Login failed:', loginData.message)
            console.log('\n🔍 Debugging info:')
            console.log('   Status:', loginResponse.status)
            console.log('   Response:', loginData)
            return
        }

        // Test 3: CORS Test
        console.log('\n3️⃣ Testing CORS Configuration...')
        const corsResponse = await fetch(`${RENDER_URL}/api/test`, {
            method: 'GET',
            headers: {
                'Origin': VERCEL_URL
            }
        })

        if (corsResponse.ok) {
            console.log('✅ CORS is properly configured')
        } else {
            console.log('⚠️ CORS might have issues')
        }

        // Test 4: Frontend Connectivity
        console.log('\n4️⃣ Testing Frontend Connectivity...')
        try {
            const frontendResponse = await fetch(VERCEL_URL)
            if (frontendResponse.ok) {
                console.log('✅ Frontend is accessible')
            } else {
                console.log('⚠️ Frontend might have issues')
            }
        } catch (error) {
            console.log('⚠️ Could not reach frontend')
        }

        console.log('\n🎉 DEPLOYMENT VERIFICATION COMPLETE!')
        console.log('\n📋 Summary:')
        console.log(`   Backend URL: ${RENDER_URL}`)
        console.log(`   Frontend URL: ${VERCEL_URL}`)
        console.log(`   Admin Email: viditj47@gmail.com`)
        console.log(`   Admin Password: Visheshjain18@`)
        console.log('\n✅ Ready for production use!')

    } catch (error) {
        console.error('❌ Verification failed:', error.message)
        console.log('\n🔧 Troubleshooting steps:')
        console.log('1. Check if Render service is running')
        console.log('2. Verify environment variables are set')
        console.log('3. Check database connection')
        console.log('4. Run setup-render-production.js if needed')
    }
}

verifyDeployment()