// Test script to verify class creation functionality
const axios = require('axios')

const API_BASE = 'http://localhost:5000/api'

async function testClassCreation() {
  try {
    console.log('🧪 Testing Class Creation...')
    
    // First, login as a teacher
    console.log('1. Logging in as teacher...')
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'teacher@example.com',
      password: 'password123'
    })
    
    if (!loginResponse.data.success) {
      console.error('❌ Login failed:', loginResponse.data.message)
      return
    }
    
    const token = loginResponse.data.data.token
    console.log('✅ Login successful')
    
    // Create a class
    console.log('2. Creating a test class...')
    const classResponse = await axios.post(`${API_BASE}/classes`, {
      title: 'Test Class - ' + new Date().toISOString(),
      description: 'This is a test class created by the test script',
      subject: 'Computer Science'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (classResponse.data.success) {
      console.log('✅ Class created successfully!')
      console.log('📋 Class details:', {
        id: classResponse.data.data._id,
        title: classResponse.data.data.title,
        joinCode: classResponse.data.data.joinCode
      })
    } else {
      console.error('❌ Class creation failed:', classResponse.data.message)
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:')
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Data:', error.response.data)
    } else {
      console.error('Error:', error.message)
    }
  }
}

// Run the test
testClassCreation()