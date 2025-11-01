#!/usr/bin/env node

// Debug login issue by testing the API directly
import axios from 'axios'

const API_URL = 'https://classroom-assignment-50uu.onrender.com/api'

async function debugLogin() {
  console.log('🔍 Debugging Login Issue...')
  
  try {
    // Test 1: Health check
    console.log('\n1️⃣ Testing backend health...')
    const health = await axios.get(`${API_URL}/health`)
    console.log('✅ Backend is healthy:', health.data.message)
    console.log('📊 Database status:', health.data.database)
    
    // Test 2: Try login with the exact credentials
    console.log('\n2️⃣ Testing login with viditj47@gmail.com...')
    
    const loginData = {
      email: 'viditj47@gmail.com',
      password: 'Visheshjain18@'
    }
    
    console.log('📤 Sending login request:', { email: loginData.email })
    
    const loginResponse = await axios.post(`${API_URL}/auth/login`, loginData, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://classroom-assignment-pqcj.vercel.app'
      },
      withCredentials: true
    })
    
    if (loginResponse.data.success) {
      console.log('✅ Login successful!')
      console.log('👤 User:', loginResponse.data.data.user.name)
      console.log('🔑 Role:', loginResponse.data.data.user.role)
      console.log('📧 Email:', loginResponse.data.data.user.email)
    }
    
  } catch (error) {
    console.error('❌ Login failed!')
    
    if (error.response) {
      console.log('📄 Status:', error.response.status)
      console.log('📄 Response:', error.response.data)
      
      if (error.response.status === 401) {
        console.log('\n💡 401 Unauthorized means:')
        console.log('   ❌ User not found in database, OR')
        console.log('   ❌ Password is incorrect, OR') 
        console.log('   ❌ Account is deactivated')
        console.log('\n🔧 Solutions:')
        console.log('   1. Run: node fix-user-password.js')
        console.log('   2. Check if user exists in MongoDB Atlas')
        console.log('   3. Verify password is exactly: Visheshjain18@')
      }
    } else {
      console.log('📄 Network error:', error.message)
    }
  }
}

debugLogin()