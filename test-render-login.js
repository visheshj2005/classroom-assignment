// Simple POST request to test render login route
const testLoginRoute = async () => {
  // Replace with your actual render URL when deployed
  const RENDER_URL = 'https://your-render-app.onrender.com' // Update this with your actual render URL
  const LOCAL_URL = 'http://localhost:5000' // For local testing
  
  // Use LOCAL_URL for local testing, RENDER_URL for deployed testing
  const BASE_URL = LOCAL_URL // Change to RENDER_URL when testing deployed version
  
  const loginData = {
    email: 'test@example.com', // Replace with a valid test email
    password: 'testpassword123' // Replace with a valid test password
  }

  try {
    console.log('🚀 Testing login route...')
    console.log('URL:', `${BASE_URL}/api/auth/login`)
    console.log('Data:', loginData)
    
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    })

    const result = await response.json()
    
    console.log('\n📊 Response Status:', response.status)
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()))
    console.log('📊 Response Body:', JSON.stringify(result, null, 2))
    
    if (response.ok) {
      console.log('✅ Login route is working!')
    } else {
      console.log('❌ Login failed:', result.message || 'Unknown error')
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message)
    console.log('\n🔍 Possible issues:')
    console.log('- Server is not running')
    console.log('- Wrong URL')
    console.log('- Network connectivity issues')
    console.log('- CORS issues')
  }
}

// Test health endpoint first
const testHealthRoute = async () => {
  const BASE_URL = 'http://localhost:5000' // Change to your render URL
  
  try {
    console.log('🏥 Testing health endpoint...')
    const response = await fetch(`${BASE_URL}/api/health`)
    const result = await response.json()
    
    console.log('Health Status:', response.status)
    console.log('Health Response:', JSON.stringify(result, null, 2))
    
    if (response.ok) {
      console.log('✅ Server is healthy!')
      return true
    }
  } catch (error) {
    console.error('❌ Health check failed:', error.message)
    return false
  }
}

// Run tests
const runTests = async () => {
  console.log('='.repeat(50))
  console.log('🧪 TESTING RENDER LOGIN ROUTE')
  console.log('='.repeat(50))
  
  // Test health first
  const isHealthy = await testHealthRoute()
  
  console.log('\n' + '-'.repeat(30))
  
  if (isHealthy) {
    // Test login
    await testLoginRoute()
  } else {
    console.log('⚠️  Skipping login test - server not healthy')
  }
  
  console.log('\n' + '='.repeat(50))
}

// Run the tests
runTests()