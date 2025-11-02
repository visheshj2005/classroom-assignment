#!/usr/bin/env node

/**
 * Test what environment variables the frontend is receiving
 */

import fetch from 'node-fetch'

const VERCEL_URL = 'https://classroom-assignment-pqcj.vercel.app'

console.log('🔍 Testing Frontend Environment Configuration...')
console.log(`📱 Frontend URL: ${VERCEL_URL}`)

async function testFrontendConfig() {
  try {
    console.log('\n📄 Fetching frontend page...')
    const response = await fetch(VERCEL_URL)
    const html = await response.text()
    
    // Look for any environment variable references in the built code
    const apiUrlMatches = html.match(/https:\/\/[^"'\s]+ngrok[^"'\s]*/g)
    
    if (apiUrlMatches) {
      console.log('✅ Found API URLs in frontend:')
      apiUrlMatches.forEach(url => {
        console.log(`   ${url}`)
      })
    } else {
      console.log('❌ No ngrok API URLs found in frontend')
      console.log('💡 This suggests the environment variable is not set correctly')
    }
    
    // Check if there are any localhost references (which would be wrong)
    const localhostMatches = html.match(/localhost:\d+/g)
    if (localhostMatches) {
      console.log('⚠️  Found localhost references (should not be in production):')
      localhostMatches.forEach(url => {
        console.log(`   ${url}`)
      })
    }
    
  } catch (error) {
    console.log('❌ Error fetching frontend:', error.message)
  }
}

async function testDirectAPICall() {
  console.log('\n🔗 Testing direct API call from browser perspective...')
  
  try {
    // Simulate what the browser would do
    const response = await fetch('https://paronymous-jacki-gelatinously.ngrok-free.dev/api/auth/me', {
      method: 'GET',
      headers: {
        'Origin': VERCEL_URL,
        'ngrok-skip-browser-warning': 'true'
      },
      // Note: fetch in Node.js doesn't support credentials: 'include' the same way
    })
    
    console.log(`Status: ${response.status}`)
    console.log(`CORS Origin: ${response.headers.get('access-control-allow-origin')}`)
    console.log(`CORS Credentials: ${response.headers.get('access-control-allow-credentials')}`)
    
    if (response.headers.get('access-control-allow-origin') === '*') {
      console.log('❌ PROBLEM: Server returning wildcard origin!')
    } else {
      console.log('✅ Server CORS looks correct')
    }
    
  } catch (error) {
    console.log('❌ API call failed:', error.message)
  }
}

async function main() {
  await testFrontendConfig()
  await testDirectAPICall()
  
  console.log('\n📋 Next Steps:')
  console.log('1. If no ngrok URLs found in frontend:')
  console.log('   → Run: fix-vercel-env.bat')
  console.log('   → Set VITE_API_URL in Vercel dashboard')
  console.log('')
  console.log('2. If server returning wildcard:')
  console.log('   → Restart server: npm run restart:clean')
  console.log('')
  console.log('3. Clear browser cache and test again')
}

main().catch(console.error)