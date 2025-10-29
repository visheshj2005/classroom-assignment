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
    name: 'Authentication Endpoint',
    url: '/api/auth/me',
    method: 'GET',
    expectStatus: 401 // Should be unauthorized without token
  }
]

async function runTests() {
  let passed = 0
  let failed = 0

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}...`)
      
      const response = await axios({
        method: test.method,
        url: `${BASE_URL}${test.url}`,
        validateStatus: () => true // Don't throw on any status
      })

      const expectedStatus = test.expectStatus || 200
      
      if (response.status === expectedStatus) {
        console.log(`✅ ${test.name} - Status: ${response.status}`)
        
        if (test.url === '/api/health') {
          const data = response.data
          console.log(`   Environment: ${data.environment}`)
          console.log(`   Database: ${data.database}`)
          console.log(`   File Storage: ${data.fileStorage}`)
        }
        
        passed++
      } else {
        console.log(`❌ ${test.name} - Expected: ${expectedStatus}, Got: ${response.status}`)
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
    process.exit(1)
  }
}

runTests().catch(error => {
  console.error('Test runner error:', error.message)
  process.exit(1)
})