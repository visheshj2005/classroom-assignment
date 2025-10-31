#!/usr/bin/env node

import axios from 'axios'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Get the deployment URL from command line argument
const deploymentUrl = process.argv[2]

if (!deploymentUrl) {
  console.error('❌ Please provide the Cloud Run service URL as an argument')
  console.log('Usage: node test-cloudrun-deployment.js https://your-service-url.run.app')
  process.exit(1)
}

console.log(`🔍 Testing Cloud Run deployment at: ${deploymentUrl}`)
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
  },
  {
    name: 'CORS Headers',
    url: `${deploymentUrl}/api/health`,
    method: 'OPTIONS',
    expectedStatus: 200,
    checkCors: true
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
    
    const config = {
      method: test.method,
      url: test.url,
      timeout: 15000, // Cloud Run can be slower on cold starts
      validateStatus: () => true // Don't throw on non-2xx status
    }

    // Add CORS test headers
    if (test.checkCors) {
      config.headers = {
        'Origin': 'https://example.com',
        'Access-Control-Request-Method': 'GET'
      }
    }
    
    const response = await axios(config)
    
    // Check status code
    if (response.status !== test.expectedStatus) {
      console.log(`   ❌ Status: ${response.status} (expected ${test.expectedStatus})`)
      if (response.status === 503) {
        console.log(`   💡 Hint: Service might be cold starting, try again in a few seconds`)
      }
      return false
    }
    
    console.log(`   ✅ Status: ${response.status}`)
    
    // Check CORS headers
    if (test.checkCors) {
      const corsHeader = response.headers['access-control-allow-origin']
      if (corsHeader) {
        console.log(`   ✅ CORS: ${corsHeader}`)
      } else {
        console.log(`   ⚠️  CORS headers not found`)
      }
      return true
    }
    
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
        if (response.data.version) {
          console.log(`   ✅ Version: ${response.data.version}`)
        }
      } else {
        console.log(`   ❌ Response: Not valid JSON`)
        console.log(`   📝 Response: ${response.data.substring(0, 200)}...`)
        return false
      }
    }
    
    return true
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
    if (error.code === 'ENOTFOUND') {
      console.log(`   💡 Hint: Check if the URL is correct and accessible`)
    } else if (error.code === 'ECONNREFUSED') {
      console.log(`   💡 Hint: Service might be down or not responding`)
    } else if (error.code === 'ETIMEDOUT') {
      console.log(`   💡 Hint: Request timed out, Cloud Run might be cold starting`)
      console.log(`   💡 Try: Wait a few seconds and test again`)
    }
    return false
  }
}

// Run all tests
async function runAllTests() {
  console.log(`\n🚀 Starting Cloud Run deployment tests...\n`)
  
  for (const test of tests) {
    const passed = await runTest(test)
    if (passed) {
      passedTests++
    }
    
    // Add delay between tests to avoid overwhelming the service
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  // Summary
  console.log('\n' + '=' .repeat(60))
  console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`)
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Your Cloud Run deployment is working correctly.')
    console.log('\n✅ Next steps:')
    console.log('   1. Test user registration and login')
    console.log('   2. Verify email OTP functionality')
    console.log('   3. Test all main features')
    console.log('   4. Set up monitoring and alerts')
    console.log('   5. Configure custom domain if needed')
  } else {
    console.log('❌ Some tests failed. Please check the issues above.')
    console.log('\n🔧 Troubleshooting steps:')
    console.log('   1. Check Cloud Run service logs: gcloud logs read "resource.type=cloud_run_revision"')
    console.log('   2. Verify environment variables are set correctly')
    console.log('   3. Check MongoDB Atlas connection and network access')
    console.log('   4. Ensure the service has finished deploying')
    console.log('   5. Try testing again after a few minutes (cold start)')
    process.exit(1)
  }
}

// Performance test
async function runPerformanceTest() {
  console.log('\n⚡ Running performance test...')
  
  try {
    const startTime = Date.now()
    const response = await axios.get(`${deploymentUrl}/api/health`)
    const endTime = Date.now()
    const responseTime = endTime - startTime
    
    console.log(`   ⏱️  Response time: ${responseTime}ms`)
    
    if (responseTime < 1000) {
      console.log(`   ✅ Performance: Excellent (< 1s)`)
    } else if (responseTime < 3000) {
      console.log(`   ✅ Performance: Good (< 3s)`)
    } else if (responseTime < 10000) {
      console.log(`   ⚠️  Performance: Slow (< 10s) - might be cold start`)
    } else {
      console.log(`   ❌ Performance: Very slow (> 10s)`)
    }
    
  } catch (error) {
    console.log(`   ❌ Performance test failed: ${error.message}`)
  }
}

// Run the verification
runAllTests()
  .then(() => runPerformanceTest())
  .catch(error => {
    console.error('❌ Testing failed:', error.message)
    process.exit(1)
  })