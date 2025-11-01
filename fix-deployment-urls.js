// Fix deployment URL testing
// Test the correct URLs for your separated deployment

const testCorrectDeploymentURLs = async () => {
  console.log('🔧 TESTING CORRECT DEPLOYMENT URLS')
  console.log('=' .repeat(50))
  
  // Your actual URLs based on the deployment guide
  const FRONTEND_URL = 'https://classroom-assignment-pqcj.vercel.app' // Vercel (frontend only)
  const BACKEND_URL = 'https://your-app.onrender.com' // Render (backend) - UPDATE THIS!
  const LOCAL_BACKEND = 'http://localhost:5000'
  
  const testCredentials = {
    email: 'admin@example.com', // Replace with your actual email
    password: 'your-actual-password' // Replace with your actual password
  }
  
  console.log('📍 URL Configuration:')
  console.log(`Frontend (Vercel): ${FRONTEND_URL}`)
  console.log(`Backend (Render): ${BACKEND_URL}`)
  console.log(`Local Backend: ${LOCAL_BACKEND}`)
  
  // Test backends only (not frontend)
  const backends = [
    { name: 'LOCAL', url: LOCAL_BACKEND },
    { name: 'RENDER', url: BACKEND_URL }
  ]
  
  for (const backend of backends) {
    console.log(`\n🔍 Testing ${backend.name} Backend`)
    console.log('-'.repeat(30))
    
    try {
      // Test health endpoint
      console.log(`Health: ${backend.url}/api/health`)
      const healthResponse = await fetch(`${backend.url}/api/health`)
      
      if (!healthResponse.ok) {
        console.log(`❌ Health check failed: ${healthResponse.status}`)
        continue
      }
      
      const healthData = await healthResponse.json()
      console.log(`✅ Health OK - DB: ${healthData.database}`)
      
      // Test login
      console.log(`Login: ${backend.url}/api/auth/login`)
      const loginResponse = await fetch(`${backend.url}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(testCredentials)
      })
      
      const loginData = await loginResponse.json()
      console.log(`Status: ${loginResponse.status}`)
      console.log(`Message: ${loginData.message}`)
      
      if (loginResponse.ok) {
        console.log('✅ Login successful!')
      } else {
        console.log('❌ Login failed')
      }
      
    } catch (error) {
      console.log(`❌ ${backend.name} failed:`, error.message)
      
      if (backend.name === 'RENDER') {
        console.log('💡 Possible issues:')
        console.log('- Backend not deployed to Render yet')
        console.log('- Wrong Render URL')
        console.log('- Render service is sleeping (free tier)')
      }
    }
  }
  
  console.log('\n📋 SOLUTION CHECKLIST:')
  console.log('1. ✅ Deploy backend to Render (see DEPLOYMENT-SEPARATION-GUIDE.md)')
  console.log('2. ✅ Get your Render backend URL')
  console.log('3. ✅ Update frontend to use Render backend URL')
  console.log('4. ✅ Test login with Render backend URL (not Vercel)')
  
  console.log('\n🎯 QUICK FIX:')
  console.log('Your frontend should make API calls to:')
  console.log(`${BACKEND_URL}/api/auth/login (NOT Vercel URL)`)
}

testCorrectDeploymentURLs()