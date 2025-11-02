#!/usr/bin/env node

/**
 * Comprehensive CORS Test for Ngrok Hybrid Deployment
 */

import fetch from 'node-fetch'

const NGROK_URL = 'https://paronymous-jacki-gelatinously.ngrok-free.dev'
const VERCEL_URL = 'https://classroom-assignment-pqcj.vercel.app'

console.log('🔍 Comprehensive CORS Testing...')
console.log(`🔗 Backend: ${NGROK_URL}`)
console.log(`📱 Frontend: ${VERCEL_URL}`)

async function testEndpoint(endpoint, method = 'GET', includeCredentials = true) {
  console.log(`\n🧪 Testing ${method} ${endpoint}`)
  
  try {
    const options = {
      method,
      headers: {
        'Origin': VERCEL_URL,
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json'
      }
    }
    
    if (includeCredentials) {
      options.credentials = 'include'
    }
    
    if (method === 'OPTIONS') {
      options.headers['Access-Control-Request-Method'] = 'GET'
      options.headers['Access-Control-Request-Headers'] = 'Content-Type'
    }
    
    const response = await fetch(`${NGROK_URL}${endpoint}`, options)
    
    const corsOrigin = response.headers.get('access-control-allow-origin')
    const corsCredentials = response.headers.get('access-control-allow-credentials')
    
    console.log(`   Status: ${response.status}`)
    console.log(`   Access-Control-Allow-Origin: ${corsOrigin}`)
    console.log(`   Access-Control-Allow-Credentials: ${corsCredentials}`)
    
    // Check for the problematic wildcard
    if (corsOrigin === '*' && corsCredentials === 'true') {
      console.log('   ❌ PROBLEM: Wildcard origin with credentials!')
      return false
    } else if (corsOrigin === VERCEL_URL) {
      console.log('   ✅ CORS headers correct')
      return true
    } else {
      console.log(`   ⚠️  Unexpected origin: ${corsOrigin}`)
      return false
    }
    
  } catch (error) {
    console.log(`   ❌ Request failed: ${error.message}`)
    return false
  }
}

async function runComprehensiveTest() {
  console.log('\n🏥 Testing Health Endpoint...')
  const healthOk = await testEndpoint('/api/health', 'GET', false)
  
  console.log('\n🔐 Testing Auth Endpoints...')
  const authMeOptions = await testEndpoint('/api/auth/me', 'OPTIONS', true)
  const authMeGet = await testEndpoint('/api/auth/me', 'GET', true)
  
  console.log('\n📊 Testing Stats Endpoint...')
  const statsOptions = await testEndpoint('/api/users/stats', 'OPTIONS', true)
  const statsGet = await testEndpoint('/api/users/stats', 'GET', true)
  
  console.log('\n📋 Test Summary:')
  const allPassed = healthOk && authMeOptions && authMeGet && statsOptions && statsGet
  
  if (allPassed) {
    console.log('✅ All CORS tests passed!')
    console.log('\n🎉 Your server should work correctly with Vercel frontend')
    console.log(`🌐 Test your app: ${VERCEL_URL}`)
  } else {
    console.log('❌ Some CORS tests failed')
    console.log('\n🔧 Troubleshooting steps:')
    console.log('1. Restart your server: npm run restart-server-clean')
    console.log('2. Make sure NODE_ENV=production')
    console.log('3. Check server logs for CORS middleware messages')
  }
  
  return allPassed
}

// Test with different scenarios
async function testDifferentOrigins() {
  console.log('\n🌍 Testing Different Origins...')
  
  const testOrigins = [
    VERCEL_URL,
    'http://localhost:5173',
    'https://another-domain.com'
  ]
  
  for (const origin of testOrigins) {
    console.log(`\n🔍 Testing origin: ${origin}`)
    
    try {
      const response = await fetch(`${NGROK_URL}/api/health`, {
        headers: {
          'Origin': origin,
          'ngrok-skip-browser-warning': 'true'
        }
      })
      
      const corsOrigin = response.headers.get('access-control-allow-origin')
      console.log(`   Returned origin: ${corsOrigin}`)
      
      if (corsOrigin === '*') {
        console.log('   ❌ Wildcard detected!')
      } else if (corsOrigin === origin) {
        console.log('   ✅ Correct specific origin')
      } else {
        console.log('   ⚠️  Different origin returned')
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`)
    }
  }
}

// Run all tests
async function main() {
  await runComprehensiveTest()
  await testDifferentOrigins()
  
  console.log('\n🔄 If tests still fail, try:')
  console.log('1. Stop your server (Ctrl+C)')
  console.log('2. Run: restart-server-clean.bat')
  console.log('3. Wait for server to fully start')
  console.log('4. Run this test again')
}

main().catch(console.error)