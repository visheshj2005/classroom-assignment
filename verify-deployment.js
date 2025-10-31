#!/usr/bin/env node

import fetch from 'node-fetch'

const DEPLOYMENT_URL = process.argv[2] || 'http://localhost:5000'

console.log(`🔍 Verifying deployment at: ${DEPLOYMENT_URL}`)

const tests = [
  {
    name: 'Health Check',
    url: `${DEPLOYMENT_URL}/api/health`,
    method: 'GET'
  },
  {
    name: 'Frontend Landing Page',
    url: `${DEPLOYMENT_URL}/`,
    method: 'GET'
  },
  {
    name: 'SPA Routing (Dashboard)',
    url: `${DEPLOYMENT_URL}/dashboard`,
    method: 'GET'
  },
  {
    name: 'API Auth Endpoint',
    url: `${DEPLOYMENT_URL}/api/auth/me`,
    method: 'GET'
  }
]

async function runTests() {
  let passed = 0
  let failed = 0

  for (const test of tests) {
    try {
      console.log(`\n🧪 Testing: ${test.name}`)
      
      const response = await fetch(test.url, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok || response.status === 401) { // 401 is expected for protected routes
        console.log(`✅ ${test.name}: PASSED (${response.status})`)
        passed++
      } else {
        console.log(`❌ ${test.name}: FAILED (${response.status})`)
        failed++
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`)
      failed++
    }
  }

  console.log(`\n📊 Test Results:`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`)

  if (failed === 0) {
    console.log(`\n🎉 All tests passed! Deployment looks good.`)
  } else {
    console.log(`\n⚠️  Some tests failed. Check the deployment configuration.`)
  }
}

runTests().catch(console.error)