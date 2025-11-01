#!/usr/bin/env node

// Test login API directly
import axios from 'axios'

const API_URL = 'https://classroom-assignment-50uu.onrender.com/api'

async function testLogin() {
  console.log('🧪 Testing Login API...')
  
  try {
    // Test health endpoint first
    console.log('\n1️⃣ Testing health endpoint...')
    const health = await axios.get(`${API_URL}/health`)
    console.log('✅ Health check passed:', health.data.message)
    
    // Test login with admin credentials
    console.log('\n2️⃣ Testing login with admin@example.com...')
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (loginResponse.data.success) {
      console.log('✅ Login successful!')
      console.log('👤 User:', loginResponse.data.data.user.name)
      console.log('🔑 Role:', loginResponse.data.data.user.role)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message)
    
    if (error.response?.status === 401) {
      console.log('\n💡 This means:')
      console.log('   - User might not exist in database')
      console.log('   - Password might be incorrect')
      console.log('   - Try running: node create-production-admin.js')
    }
  }
}

testLogin()