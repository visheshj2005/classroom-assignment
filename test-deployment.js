#!/usr/bin/env node

import axios from 'axios'

const BASE_URL = process.argv[2] || 'http://localhost:5000'

console.log(`🧪 Testing deployment at: ${BASE_URL}\n`)

const tests = [
  {
    name: 'Health Check',
    url: '/api/health',
    method: 'GET'
  },
  {
    name: 'Register Endpoint',
    url: '/api/auth/register',
    method: 'POST',
    data: {
      name: 'Test User',
      email: 'test@example.com',
      password: 'test123'
    },
    expectStatus: [201, 400] // 201 for success, 400 if user exists
  }
]

async function runTests() {
  let passed = 0
  let failed = 0

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}...`)
      
      const config = {
        method: test.method,
        url: `${BASE_URL}${test.url}`,
        validateStatus: () => true // Don't throw on any status
      }
      
      if (test.data) {
        config.data = test.data
        config.headers = { 'Content-Type': 'application/json' }
      }
      
      const response = await axios(config)

      const expectedStatuses = Array.isArray(test.expectStatus) ? test.expectStatus : [test.expectStatus || 200]
      
      if (expectedStatuses.includes(response.status)) {
        console.log(`✅ ${test.name} - Status: ${response.status}`)
        
        if (test.url === '/api/health') {
          const data = response.data
          console.log(`   Environment: ${data.environment}`)
          console.log(`   Database: ${data.database}`)
          console.log(`   File Storage: ${data.fileStorage}`)
        }
        
        passed++
      } else {
        console.log(`❌ ${test.name} - Expected: ${expectedStatuses.join(' or ')}, Got: ${response.status}`)
        console.log(`   Response: ${JSON.stringify(response.data)}`)
        failed++
      }
    } catch (error) {
      console.log(`❌ ${test.name} - Error: ${error.message}`)
      failed++
    }
    
    console.log('')
  }

  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`)
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Deployment looks good.')
  } else {
    console.log('⚠️  Some tests failed. Check your deployment configuration.')
  }
}

runTests().catch(error => {
  console.error('Test runner error:', error.message)
  process.exit(1)
})