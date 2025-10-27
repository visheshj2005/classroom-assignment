#!/usr/bin/env node

// API Testing Script for Classroom Assignment Portal
// Run with: node test-api.js

import axios from 'axios'

const BASE_URL = 'http://localhost:5000/api'
let authToken = ''

// Test configuration
const testConfig = {
  admin: {
    email: 'admin@classroom.com',
    password: 'admin123'
  },
  teacher: {
    email: 'sarah.johnson@classroom.com',
    password: 'teacher123'
  },
  student: {
    email: 'alice.smith@student.com',
    password: 'student123'
  }
}

// Helper functions
const log = (message, type = 'info') => {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m'
  }
  console.log(`${colors[type]}[${type.toUpperCase()}]\x1b[0m ${message}`)
}

const makeRequest = async (method, endpoint, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {}
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    if (data) {
      config.data = data
      config.headers['Content-Type'] = 'application/json'
    }
    
    const response = await axios(config)
    return { success: true, data: response.data, status: response.status }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    }
  }
}

// Test functions
const testHealthCheck = async () => {
  log('Testing health check endpoint...')
  const result = await makeRequest('GET', '/health')
  
  if (result.success) {
    log('✅ Health check passed', 'success')
    return true
  } else {
    log('❌ Health check failed', 'error')
    console.log(result.error)
    return false
  }
}

const testAuthentication = async () => {
  log('Testing authentication endpoints...')
  
  // Test login
  const loginResult = await makeRequest('POST', '/auth/login', testConfig.admin)
  
  if (loginResult.success && loginResult.data.data.token) {
    authToken = loginResult.data.data.token
    log('✅ Admin login successful', 'success')
    
    // Test profile retrieval
    const profileResult = await makeRequest('GET', '/auth/me', null, authToken)
    
    if (profileResult.success) {
      log('✅ Profile retrieval successful', 'success')
      return true
    } else {
      log('❌ Profile retrieval failed', 'error')
      return false
    }
  } else {
    log('❌ Admin login failed', 'error')
    console.log(loginResult.error)
    return false
  }
}

const testUserManagement = async () => {
  log('Testing user management endpoints...')
  
  // Test get users
  const usersResult = await makeRequest('GET', '/users', null, authToken)
  
  if (usersResult.success) {
    log('✅ Get users successful', 'success')
    log(`Found ${usersResult.data.data.users.length} users`)
    return true
  } else {
    log('❌ Get users failed', 'error')
    console.log(usersResult.error)
    return false
  }
}

const testClassManagement = async () => {
  log('Testing class management...')
  
  // Login as teacher first
  const teacherLogin = await makeRequest('POST', '/auth/login', testConfig.teacher)
  
  if (!teacherLogin.success) {
    log('❌ Teacher login failed', 'error')
    return false
  }
  
  const teacherToken = teacherLogin.data.data.token
  
  // Test get classes
  const classesResult = await makeRequest('GET', '/classes', null, teacherToken)
  
  if (classesResult.success) {
    log('✅ Get classes successful', 'success')
    log(`Found ${classesResult.data.data.classes.length} classes`)
    return true
  } else {
    log('❌ Get classes failed', 'error')
    console.log(classesResult.error)
    return false
  }
}

const testAnalytics = async () => {
  log('Testing analytics endpoints...')
  
  const analyticsResult = await makeRequest('GET', '/analytics/dashboard', null, authToken)
  
  if (analyticsResult.success) {
    log('✅ Analytics dashboard successful', 'success')
    return true
  } else {
    log('❌ Analytics dashboard failed', 'error')
    console.log(analyticsResult.error)
    return false
  }
}

const testNotifications = async () => {
  log('Testing notifications endpoints...')
  
  const notificationsResult = await makeRequest('GET', '/notifications', null, authToken)
  
  if (notificationsResult.success) {
    log('✅ Get notifications successful', 'success')
    return true
  } else {
    log('❌ Get notifications failed', 'error')
    console.log(notificationsResult.error)
    return false
  }
}

// Main test runner
const runTests = async () => {
  console.log('🧪 Starting API Tests for Classroom Assignment Portal\n')
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Authentication', fn: testAuthentication },
    { name: 'User Management', fn: testUserManagement },
    { name: 'Class Management', fn: testClassManagement },
    { name: 'Analytics', fn: testAnalytics },
    { name: 'Notifications', fn: testNotifications }
  ]
  
  let passed = 0
  let failed = 0
  
  for (const test of tests) {
    console.log(`\n--- Testing ${test.name} ---`)
    try {
      const result = await test.fn()
      if (result) {
        passed++
      } else {
        failed++
      }
    } catch (error) {
      log(`❌ ${test.name} test crashed: ${error.message}`, 'error')
      failed++
    }
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('🧪 API Test Results:')
  log(`✅ Passed: ${passed}`, 'success')
  log(`❌ Failed: ${failed}`, failed > 0 ? 'error' : 'info')
  console.log('='.repeat(50))
  
  if (failed === 0) {
    log('🎉 All API tests passed! Your backend is ready.', 'success')
  } else {
    log('⚠️ Some tests failed. Please check the errors above.', 'warning')
  }
}

// Check if server is running
const checkServer = async () => {
  try {
    await axios.get(`${BASE_URL}/health`)
    return true
  } catch (error) {
    return false
  }
}

// Start tests
const main = async () => {
  const serverRunning = await checkServer()
  
  if (!serverRunning) {
    log('❌ Server is not running at http://localhost:5000', 'error')
    log('Please start the server first with: npm run dev', 'info')
    process.exit(1)
  }
  
  await runTests()
}

main().catch(console.error)