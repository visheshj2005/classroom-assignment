// Comprehensive deployment test script
// Tests both Vercel frontend and Render backend

const testFullDeployment = async () => {
  console.log('🧪 FULL DEPLOYMENT TEST')
  console.log('=' .repeat(50))
  
  const FRONTEND_URL = 'https://classroom-assignment-pqcj.vercel.app'
  const BACKEND_URL = 'https://classroom-assignment-50uu.onrender.com'
  
  const testCredentials = {
    email: 'admin@example.com', // Replace with your actual test email
    password: 'your-actual-password' // Replace with your actual password
  }
  
  console.log('🌐 Testing URLs:')
  console.log('Frontend:', FRONTEND_URL)
  console.log('Backend:', BACKEND_URL)
  
  // Test 1: Frontend accessibility
  console.log('\n📱 Testing Frontend (Vercel)...')
  try {
    const frontendResponse = await fetch(FRONTEND_URL)
    if (frontendResponse.ok) {
      console.log('✅ Frontend is accessible')
    } else {
      console.log('❌ Frontend returned status:', frontendResponse.status)
    }
  } catch (error) {
    console.log('❌ Frontend test failed:', error.message)
  }
  
  // Test 2: Backend health check
  console.log('\n🏥 Testing Backend Health (Render)...')
  try {
    const healthResponse = await fetch(`${BACKEND_URL}/api/health`)
    if (healthResponse.ok) {
      const healthData = await healthResponse.json()
      console.log('✅ Backend health check passed')
      console.log('Database status:', healthData.database)
      console.log('Environment:', healthData.environment)
    } else {
      console.log('❌ Backend health check failed:', healthResponse.status)
    }
  } catch (error) {
    console.log('❌ Backend health test failed:', error.message)
  }
  
  // Test 3: CORS test
  console.log('\n🌐 Testing CORS Configuration...')
  try {
    const corsResponse = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Origin': FRONTEND_URL,
        'Content-Type': 'application/json'
      }
    })
    
    if (corsResponse.ok) {
      console.log('✅ CORS configuration working')
    } else {
      console.log('❌ CORS test failed:', corsResponse.status)
    }
  } catch (error) {
    console.log('❌ CORS test failed:', error.message)
  }
  
  // Test 4: Login API test
  console.log('\n🔐 Testing Login API...')
  try {
    const loginResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL
      },
      credentials: 'include',
      body: JSON.stringify(testCredentials)
    })
    
    const loginData = await loginResponse.json()
    
    console.log('Login Status:', loginResponse.status)
    console.log('Response:', loginData.message)
    
    if (loginResponse.ok) {
      console.log('✅ Login API working correctly!')
    } else if (loginResponse.status === 401) {
      console.log('⚠️  Login failed - check credentials')
      console.log('This might be expected if test credentials are wrong')
    } else {
      console.log('❌ Login API error')
    }
  } catch (error) {
    console.log('❌ Login API test failed:', error.message)
  }
  
  // Test 5: Database connection test
  console.log('\n🗄️  Testing Database Connection...')
  try {
    const dbTestResponse = await fetch(`${BACKEND_URL}/api/test`)
    if (dbTestResponse.ok) {
      console.log('✅ Database connection test passed')
    } else {
      console.log('❌ Database test failed:', dbTestResponse.status)
    }
  } catch (error) {
    console.log('❌ Database test failed:', error.message)
  }
  
  console.log('\n📋 DEPLOYMENT STATUS SUMMARY:')
  console.log('Frontend URL:', FRONTEND_URL)
  console.log('Backend URL:', BACKEND_URL)
  console.log('Expected API calls from frontend to:', `${BACKEND_URL}/api/*`)
  
  console.log('\n🔧 If tests fail, check:')
  console.log('1. Environment variables set correctly on Render')
  console.log('2. CORS origins include your Vercel URL')
  console.log('3. Database connection string is correct')
  console.log('4. Session configuration allows cross-origin')
  console.log('5. Render service is not sleeping (free tier limitation)')
}

testFullDeployment()