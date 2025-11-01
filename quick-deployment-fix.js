// Quick deployment fix - Test and verify everything is working

const quickTest = async () => {
  console.log('⚡ QUICK DEPLOYMENT FIX TEST')
  console.log('=' .repeat(40))
  
  const BACKEND_URL = 'https://classroom-assignment-50uu.onrender.com'
  
  // Test with your actual credentials
  const testLogin = {
    email: 'admin@test.com', // Update this with your actual email
    password: 'password123'  // Update this with your actual password
  }
  
  console.log('🎯 Testing login with Render backend...')
  console.log('URL:', `${BACKEND_URL}/api/auth/login`)
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://classroom-assignment-pqcj.vercel.app'
      },
      credentials: 'include',
      body: JSON.stringify(testLogin)
    })
    
    const data = await response.json()
    
    console.log('\n📊 RESULT:')
    console.log('Status:', response.status)
    console.log('Message:', data.message)
    
    if (response.ok) {
      console.log('🎉 SUCCESS! Login is working!')
      console.log('User:', data.data?.user?.name)
      console.log('Role:', data.data?.user?.role)
    } else if (response.status === 401) {
      console.log('🔑 Authentication failed - check your credentials')
      console.log('Make sure you use the correct email and password')
    } else {
      console.log('❌ Other error occurred')
      console.log('Full response:', JSON.stringify(data, null, 2))
    }
    
  } catch (error) {
    console.log('❌ Request failed:', error.message)
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Possible solutions:')
      console.log('1. Render service might be sleeping (free tier)')
      console.log('2. Check if backend is deployed correctly')
      console.log('3. Verify the Render URL is correct')
    }
  }
  
  console.log('\n🔧 Next steps if this fails:')
  console.log('1. Check Render dashboard for deployment status')
  console.log('2. Verify environment variables are set on Render')
  console.log('3. Check Render logs for errors')
  console.log('4. Make sure MongoDB Atlas allows connections from Render IPs')
}

quickTest()