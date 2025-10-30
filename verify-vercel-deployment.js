#!/usr/bin/env node

import axios from 'axios'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Get the deployment URL from command line argument
const deploymentUrl = process.argv[2]

if (!deploymentUrl) {
  console.error('❌ Please provide the deployment URL as an argument')
  console.log('Usage: node verify-vercel-deployment.js https://your-app.vercel.app')
  process.exit(1)
}

console.log(`🔍 Verifying deployment at: ${deploymentUrl}`)
console.log('=' .repeat(60))

// Test configuration
const tests = [
  {
    name: 'Health Check',
    url: `${deploymentUrl}/api/health`,
    method: 'GET',
    expectedStatus: 200,
    expectedFields: ['success', 'message', 'database']
  },
  {
    name: 'API Test',
    url: `${deploymentUrl}/api/test`,
    method: 'GET',
    expectedStatus: 200,
    expectedFields: ['success', 'message']
  },
  {
    name: 'Frontend Loading',
    url: deploymentUrl,
    method: 'GET',
    expectedStatus: 200,
    isHtml: true
  }
]

// Test results
let passedTests = 0
let totalTests = tests.length

// Helper function to run a test
async function runTest(test) {
  try {
    console.log(`\n🧪 Testing: ${test.name}`)
    console.log(`   URL: ${test.url}`)
    
    const response = await axios({
      method: test.method,
      url: test.url,
      timeout: 10000,
      validateStatus: () => true // Don't throw on non-2xx status
    })
    
    // Check status code
    if (response.status !== test.expectedStatus) {
      console.log(`   ❌ Status: ${response.status} (expected ${test.expectedStatus})`)
      return false
    }
    
    console.log(`   ✅ Status: ${response.status}`)
    
    // Check response content
    if (test.isHtml) {
      if (response.headers['content-type']?.includes('text/html')) {
        console.log(`   ✅ Content-Type: HTML`)
        if (response.data.includes('<div id="root">')) {
          console.log(`   ✅ React app detected`)
        } else {
          console.log(`   ⚠️  React app root not found`)
        }
      } else {
        console.log(`   ❌ Content-Type: Not HTML`)
        return false
      }
    } else {
      // Check JSON response
      if (typeof response.data === 'object') {
        console.log(`   ✅ Response: Valid JSON`)
        
        // Check expected fields
        if (test.expectedFields) {
          const missingFields = test.expectedFields.filter(field => !(field in response.data))
          if (missingFields.length > 0) {
            console.log(`   ❌ Missing fields: ${missingFields.join(', ')}`)
            return false
          }
          console.log(`   ✅ Fields: All expected fields present`)
        }
        
        // Log important response data
        if (response.data.success !== undefined) {
          console.log(`   ✅ Success: ${response.data.success}`)
        }
        if (response.data.database) {
          console.log(`   ✅ Database: ${response.data.database}`)
        }
        if (response.data.environment) {
          console.log(`   ✅ Environment: ${response.data.environment}`)
        }
      } else {
        console.log(`   ❌ Response: Not valid JSON`)
        return false
      }
    }
    
    return true
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
    if (error.code === 'ENOTFOUND') {
      console.log(`   💡 Hint: Check if the URL is correct and accessible`)
    } else if (error.code === 'ECONNREFUSED') {
      console.log(`   💡 Hint: Server might be down or not responding`)
    } else if (error.code === 'ETIMEDOUT') {
      console.log(`   💡 Hint: Request timed out, server might be slow`)
    }
    return false
  }
}

// Run all tests
async function runAllTests() {
  console.log(`\n🚀 Starting verification tests...\n`)
  
  for (const test of tests) {
    const passed = await runTest(test)
    if (passed) {
      passedTests++
    }
  }
  
  // Summary
  console.log('\n' + '=' .repeat(60))
  console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`)
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Your deployment is working correctly.')
    console.log('\n✅ Next steps:')
    console.log('   1. Test user registration and login')
    console.log('   2. Verify email OTP functionality')
    console.log('   3. Test all main features')
    console.log('   4. Monitor Vercel function logs')
  } else {
    console.log('❌ Some tests failed. Please check the issues above.')
    console.log('\n🔧 Troubleshooting steps:')
    console.log('   1. Check Vercel function logs in dashboard')
    console.log('   2. Verify environment variables are set')
    console.log('   3. Check MongoDB Atlas connection')
    console.log('   4. Review the deployment guide')
    process.exit(1)
  }
}

// Additional API tests
async function runAdvancedTests() {
  console.log('\n🔬 Running advanced API tests...')
  
  try {
    // Test CORS
    console.log('\n🧪 Testing CORS configuration...')
    const corsResponse = await axios.options(`${deploymentUrl}/api/health`, {
      headers: {
        'Origin': 'https://example.com',
        'Access-Control-Request-Method': 'GET'
      }
    })
    
    if (corsResponse.headers['access-control-allow-origin']) {
      console.log('   ✅ CORS headers present')
    } else {
      console.log('   ⚠️  CORS headers not found')
    }
    
    // Test rate limiting (gentle test)
    console.log('\n🧪 Testing rate limiting...')
    const rateLimitPromises = Array(5).fill().map(() => 
      axios.get(`${deploymentUrl}/api/test`)
    )
    
    const rateLimitResults = await Promise.all(rateLimitPromises)
    const allSuccessful = rateLimitResults.every(r => r.status === 200)
    
    if (allSuccessful) {
      console.log('   ✅ Rate limiting allows normal requests')
    } else {
      console.log('   ⚠️  Some requests were rate limited')
    }
    
  } catch (error) {
    console.log(`   ⚠️  Advanced tests failed: ${error.message}`)
  }
}

// Run the verification
runAllTests()
  .then(() => runAdvancedTests())
  .catch(error => {
    console.error('❌ Verification failed:', error.message)
    process.exit(1)
  })