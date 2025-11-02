#!/usr/bin/env node

/**
 * Test CORS Configuration for Ngrok Hybrid Deployment
 */

import fetch from 'node-fetch'

const NGROK_URL = 'https://paronymous-jacki-gelatinously.ngrok-free.dev'
const VERCEL_URL = 'https://classroom-assignment-pqcj.vercel.app'

console.log('🧪 Testing CORS Configuration...')
console.log(`🔗 Backend: ${NGROK_URL}`)
console.log(`📱 Frontend: ${VERCEL_URL}`)

async function testCORSWithCredentials() {
  console.log('\n🔐 Testing CORS with credentials...')
  
  try {
    // Test preflight request
    console.log('1. Testing OPTIONS preflight request...')
    const preflightResponse = await fetch(`${NGROK_URL}/api/auth/me`, {
      method: 'OPTIONS',
      headers: {
        'Origin': VERCEL_URL,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type',
        'ngrok-skip-browser-warning': 'true'
      }
    })
    
    console.log(`   Status: ${preflightResponse.status}`)
    console.log(`   Access-Control-Allow-Origin: ${preflightResponse.headers.get('access-control-allow-origin')}`)
    console.log(`   Access-Control-Allow-Credentials: ${preflightResponse.headers.get('access-control-allow-credentials')}`)
    
    // Test actual request
    console.log('\n2. Testing GET request with credentials...')
    const actualResponse = await fetch(`${NGROK_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Origin': VERCEL_URL,
        'ngrok-skip-browser-warning': 'true'
      },
      credentials: 'include'
    })
    
    console.log(`   Status: ${actualResponse.status}`)
    console.log(`   Access-Control-Allow-Origin: ${actualResponse.headers.get('access-control-allow-origin')}`)
    console.log(`   Access-Control-Allow-Credentials: ${actualResponse.headers.get('access-control-allow-credentials')}`)
    
    if (actualResponse.headers.get('access-control-allow-origin') === '*') {
      console.log('❌ PROBLEM: Server is returning wildcard (*) origin with credentials!')
      console.log('💡 This will cause CORS errors in browsers.')
    } else if (actualResponse.headers.get('access-control-allow-origin') === VERCEL_URL) {
      console.log('✅ CORS configuration looks correct!')
    } else {
      console.log('⚠️  Unexpected Access-Control-Allow-Origin header')
    }
    
  } catch (error) {
    console.log('❌ CORS test failed:', error.message)
  }
}

async function testHealthEndpoint() {
  console.log('\n🏥 Testing health endpoint...')
  
  try {
    const response = await fetch(`${NGROK_URL}/api/health`, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Health check passed')
      console.log(`   Environment: ${data.environment}`)
      console.log(`   Database: ${data.database}`)
    } else {
      console.log('❌ Health check failed:', response.status)
    }
    
  } catch (error) {
    console.log('❌ Health check error:', error.message)
  }
}

// Run tests
async function runTests() {
  await testHealthEndpoint()
  await testCORSWithCredentials()
  
  console.log('\n📋 Next Steps:')
  console.log('1. If CORS test shows wildcard (*), restart your server with:')
  console.log('   npm run start:ngrok-win')
  console.log('')
  console.log('2. Make sure NODE_ENV=production is set')
  console.log('')
  console.log('3. Test your frontend at:')
  console.log(`   ${VERCEL_URL}`)
}

runTests().catch(console.error)