// Debug Render login issue
// Test the exact same request that's failing

const debugRenderLogin = async () => {
  console.log('🔍 DEBUGGING RENDER LOGIN ISSUE')
  console.log('=' .repeat(50))
  
  const BACKEND_URL = 'https://classroom-assignment-50uu.onrender.com'
  
  // Test different credentials to see what works
  const testCredentials = [
    {
      name: 'Test User 1',
      email: 'admin@test.com',
      password: 'password123'
    },
    {
      name: 'Test User 2', 
      email: 'admin@example.com',
      password: 'password123'
    },
    {
      name: 'Your Actual Credentials',
      email: 'admin@example.com', // Update this
      password: 'your-actual-password' // Update this
    }
  ]
  
  // First, test health to make sure backend is up
  console.log('🏥 Testing backend health...')
  try {
    const healthResponse = await fetch(`${BACKEND_URL}/api/health`)
    const healthData = await healthResponse.json()
    
    if (healthResponse.ok) {
      console.log('✅ Backend is healthy')
      console.log('Database:', healthData.database)
      console.log('Environment:', healthData.environment)
    } else {
      console.log('❌ Backend health check failed:', healthResponse.status)
      return
    }
  } catch (error) {
    console.log('❌ Cannot reach backend:', error.message)
    return
  }
  
  // Test each credential set
  for (const cred of testCredentials) {
    console.log(`\n🔐 Testing: ${cred.name}`)
    console.log(`Email: ${cred.email}`)
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://classroom-assignment-pqcj.vercel.app'
        },
        credentials: 'include',
        body: JSON.stringify({
          email: cred.email,
          password: cred.password
        })
      })
      
      const data = await response.json()
      
      console.log(`Status: ${response.status}`)
      console.log(`Message: ${data.message}`)
      
      if (response.ok) {
        console.log('✅ SUCCESS!')
        console.log('User:', data.data?.user?.name)
        console.log('Role:', data.data?.user?.role)
        break
      } else if (response.status === 401) {
        console.log('❌ Invalid credentials')
        
        // Check if it's validation error vs auth error
        if (data.errors) {
          console.log('Validation errors:', data.errors)
        }
      } else {
        console.log('❌ Other error')
        console.log('Full response:', JSON.stringify(data, null, 2))
      }
      
    } catch (error) {
      console.log('❌ Request failed:', error.message)
    }
  }
  
  console.log('\n🔧 TROUBLESHOOTING STEPS:')
  console.log('1. Verify user exists in MongoDB Atlas')
  console.log('2. Check if password is correctly hashed')
  console.log('3. Test with known working credentials from localhost')
  console.log('4. Check Render logs for backend errors')
  
  console.log('\n📋 NEXT ACTIONS:')
  console.log('1. Update credentials in this script with real ones')
  console.log('2. Check MongoDB Atlas for actual user data')
  console.log('3. Verify environment variables on Render')
}

// Also test if we can check users exist
const testUserExists = async () => {
  console.log('\n👥 TESTING USER EXISTENCE')
  console.log('-'.repeat(30))
  
  const BACKEND_URL = 'https://classroom-assignment-50uu.onrender.com'
  
  // Try to get some info about users (if there's an endpoint)
  try {
    const response = await fetch(`${BACKEND_URL}/api/test`)
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Test endpoint works')
      console.log('Response:', JSON.stringify(data, null, 2))
    }
  } catch (error) {
    console.log('Test endpoint failed:', error.message)
  }
}

const runDebug = async () => {
  await debugRenderLogin()
  await testUserExists()
  
  console.log('\n💡 LIKELY ISSUES:')
  console.log('1. User doesn\'t exist in production database')
  console.log('2. Password hash mismatch between local and production')
  console.log('3. Environment variables not set correctly on Render')
  console.log('4. Database connection issue on Render')
}

runDebug()