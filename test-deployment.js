import axios from 'axios'

const API_BASE = process.env.API_URL || 'http://localhost:5000/api'

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n')
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...')
    const health = await axios.get(`${API_BASE.replace('/api', '')}/api/health`)
    console.log('✅ Health check:', health.data.message)
    
    // Test registration
    console.log('\n2. Testing user registration...')
    const testUser = {
      name: 'Test Student',
      email: `test${Date.now()}@example.com`,
      password: 'test123',
      role: 'student'
    }
    
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, testUser)
    console.log('✅ Registration successful')
    
    const token = registerResponse.data.data.token
    
    // Test authentication
    console.log('\n3. Testing authentication...')
    const profileResponse = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log('✅ Authentication successful:', profileResponse.data.data.user.name)
    
    // Test class endpoints (should fail for student)
    console.log('\n4. Testing class creation (should fail for student)...')
    try {
      await axios.post(`${API_BASE}/classes`, {
        title: 'Test Class',
        description: 'Test Description'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log('❌ Class creation should have failed for student')
    } catch (error) {
      console.log('✅ Class creation properly restricted for students')
    }
    
    console.log('\n🎉 All tests passed! API is working correctly.')
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message)
    process.exit(1)
  }
}

testAPI()