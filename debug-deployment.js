// Debug script to test deployment issues
// This will help identify what's different between localhost and deployed version

const testDeploymentLogin = async () => {
  // Replace with your actual deployed URL
  const DEPLOYED_URL = 'https://your-app.vercel.app' // Update this!
  const LOCAL_URL = 'http://localhost:5000'
  
  const testCredentials = {
    email: 'admin@example.com', // Replace with your actual test email
    password: 'your-actual-password' // Replace with your actual password
  }

  console.log('🔍 DEPLOYMENT DEBUG TEST')
  console.log('='.repeat(50))

  // Test both environments
  const environments = [
    { name: 'LOCAL', url: LOCAL_URL },
    { name: 'DEPLOYED', url: DEPLOYED_URL }
  ]

  for (const env of environments) {
    console.log(`\n📍 Testing ${env.name} Environment`)
    console.log('-'.repeat(30))
    
    try {
      // 1. Test health endpoint
      console.log(`🏥 Health check: ${env.url}/api/health`)
      const healthResponse = await fetch(`${env.url}/api/health`)
      const healthData = await healthResponse.json()
      
      console.log(`Status: ${healthResponse.status}`)
      console.log(`Database: ${healthData.database || 'unknown'}`)
      console.log(`Environment: ${healthData.environment || 'unknown'}`)
      
      if (!healthResponse.ok) {
        console.log('❌ Health check failed')
        continue
      }

      // 2. Test login endpoint
      console.log(`\n🔐 Login test: ${env.url}/api/auth/login`)
      const loginResponse = await fetch(`${env.url}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for sessions
        body: JSON.stringify(testCredentials)
      })

      const loginData = await loginResponse.json()
      
      console.log(`Login Status: ${loginResponse.status}`)
      console.log(`Response:`, JSON.stringify(loginData, null, 2))
      
      if (loginResponse.ok) {
        console.log('✅ Login successful')
      } else {
        console.log('❌ Login failed')
        
        // Additional debugging for failed login
        if (loginData.message === 'Invalid email or password') {
          console.log('🔍 Possible causes:')
          console.log('- User not found in database')
          console.log('- Password comparison failed')
          console.log('- Database connection issue')
        }
      }

    } catch (error) {
      console.log(`❌ ${env.name} test failed:`, error.message)
    }
  }

  console.log('\n' + '=' .repeat(50))
}

// Also test database connection directly
const testDatabaseConnection = async () => {
  const DEPLOYED_URL = 'https://your-app.vercel.app' // Update this!
  
  console.log('\n🗄️  DATABASE CONNECTION TEST')
  console.log('=' .repeat(50))
  
  try {
    // Test a simple database query endpoint
    const response = await fetch(`${DEPLOYED_URL}/api/health`)
    const data = await response.json()
    
    console.log('Database Status:', data.database)
    console.log('Full Response:', JSON.stringify(data, null, 2))
    
  } catch (error) {
    console.log('❌ Database test failed:', error.message)
  }
}

// Run tests
const runAllTests = async () => {
  await testDeploymentLogin()
  await testDatabaseConnection()
  
  console.log('\n📋 TROUBLESHOOTING CHECKLIST:')
  console.log('□ Environment variables set on Vercel/Render?')
  console.log('□ MONGODB_URI correct in production?')
  console.log('□ Database allows connections from deployment IP?')
  console.log('□ CORS configured for production domain?')
  console.log('□ Session configuration correct for production?')
}

runAllTests()