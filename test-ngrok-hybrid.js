#!/usr/bin/env node

/**
 * Test Ngrok Hybrid Deployment
 * Verifies that frontend and backend are properly connected
 */

import fetch from 'node-fetch'

const NGROK_URL = 'https://paronymous-jacki-gelatinously.ngrok-free.dev'
const VERCEL_URL = 'https://classroom-assignment-pqcj.vercel.app'

console.log('🧪 Testing Ngrok Hybrid Deployment...')
console.log(`📱 Frontend: ${VERCEL_URL}`)
console.log(`🔗 Backend: ${NGROK_URL}`)

async function testBackend() {
  console.log('\n🔧 Testing Backend API...')
  
  try {
    // Test health endpoint
    console.log('Testing /api/health...')
    const healthResponse = await fetch(`${NGROK_URL}/api/health`, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    })
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json()
      console.log('✅ Health check passed')
      console.log(`   Database: ${healthData.database}`)
      console.log(`   Environment: ${healthData.environment}`)
    } else {
      console.log('❌ Health check failed:', healthResponse.status)
    }
    
    // Test basic API endpoint
    console.log('Testing /api/test...')
    const testResponse = await fetch(`${NGROK_URL}/api/test`, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    })
    
    if (testResponse.ok) {
      const testData = await testResponse.json()
      console.log('✅ Test endpoint working')
      console.log(`   Message: ${testData.message}`)
    } else {
      console.log('❌ Test endpoint failed:', testResponse.status)
    }
    
  } catch (error) {
    console.log('❌ Backend connection failed:', error.message)
    console.log('💡 Make sure:')
    console.log('   1. Backend server is running (cd server && npm start)')
    console.log('   2. Ngrok tunnel is active (ngrok http 5000)')
    console.log('   3. Ngrok URL is correct in environment variables')
  }
}

async function testFrontend() {
  console.log('\n📱 Testing Frontend...')
  
  try {
    const response = await fetch(VERCEL_URL)
    
    if (response.ok) {
      console.log('✅ Frontend is accessible')
      console.log(`   Status: ${response.status}`)
    } else {
      console.log('❌ Frontend not accessible:', response.status)
    }
    
  } catch (error) {
    console.log('❌ Frontend connection failed:', error.message)
  }
}

async function testCORS() {
  console.log('\n🌐 Testing CORS Configuration...')
  
  try {
    const response = await fetch(`${NGROK_URL}/api/test`, {
      method: 'OPTIONS',
      headers: {
        'Origin': VERCEL_URL,
        'Access-Control-Request-Method': 'GET',
        'ngrok-skip-browser-warning': 'true'
      }
    })
    
    if (response.ok) {
      console.log('✅ CORS preflight successful')
      const corsHeaders = response.headers.get('access-control-allow-origin')
      console.log(`   Allowed origins: ${corsHeaders || 'Not specified'}`)
    } else {
      console.log('❌ CORS preflight failed:', response.status)
    }
    
  } catch (error) {
    console.log('❌ CORS test failed:', error.message)
  }
}

// Run all tests
async function runTests() {
  await testBackend()
  await testFrontend()
  await testCORS()
  
  console.log('\n📋 Summary:')
  console.log('If all tests pass, your hybrid deployment is working!')
  console.log('If tests fail, check the troubleshooting steps above.')
  console.log('')
  console.log('🔗 Quick links:')
  console.log(`   Frontend: ${VERCEL_URL}`)
  console.log(`   Backend API: ${NGROK_URL}/api/health`)
  console.log(`   Test endpoint: ${NGROK_URL}/api/test`)
}

runTests().catch(console.error)