// Test exact credentials that should work
// Update this with the actual credentials from your database

const testExactCredentials = async () => {
  console.log('🎯 TESTING EXACT CREDENTIALS')
  console.log('=' .repeat(40))
  
  const BACKEND_URL = 'https://classroom-assignment-50uu.onrender.com'
  
  // UPDATE THESE WITH YOUR ACTUAL CREDENTIALS
  const credentials = {
    email: 'admin@test.com',     // ← UPDATE THIS
    password: 'password123'      // ← UPDATE THIS
  }
  
  console.log('Testing with:')
  console.log('Email:', credentials.email)
  console.log('Password:', credentials.password.replace(/./g, '*'))
  
  try {
    console.log('\n🔐 Attempting login...')
    
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://classroom-assignment-pqcj.vercel.app'
      },
      credentials: 'include',
      body: JSON.stringify(credentials)
    })
    
    const data = await response.json()
    
    console.log('\n📊 RESULT:')
    console.log('Status:', response.status)
    console.log('Success:', data.success)
    console.log('Message:', data.message)
    
    if (response.ok && data.success) {
      console.log('\n🎉 LOGIN SUCCESSFUL!')
      console.log('User Name:', data.data?.user?.name)
      console.log('User Role:', data.data?.user?.role)
      console.log('User Email:', data.data?.user?.email)
      
      console.log('\n✅ Your deployment is working!')
      console.log('The issue was with the credentials, not the deployment.')
      
    } else if (response.status === 401) {
      console.log('\n❌ AUTHENTICATION FAILED')
      
      if (data.message === 'Invalid email or password') {
        console.log('\n🔍 This means either:')
        console.log('1. The email doesn\'t exist in the database')
        console.log('2. The password is incorrect')
        console.log('3. The user account is deactivated')
        
        console.log('\n💡 Next steps:')
        console.log('1. Run: node check-production-users.js')
        console.log('2. Verify the exact email and password')
        console.log('3. Check if user exists in MongoDB Atlas')
      }
      
      if (data.errors) {
        console.log('\nValidation errors:')
        data.errors.forEach(error => {
          console.log(`- ${error.msg} (${error.param})`)
        })
      }
      
    } else {
      console.log('\n❌ OTHER ERROR')
      console.log('Full response:', JSON.stringify(data, null, 2))
    }
    
  } catch (error) {
    console.log('\n❌ REQUEST FAILED')
    console.log('Error:', error.message)
    
    if (error.message.includes('fetch')) {
      console.log('\n🔧 Possible issues:')
      console.log('1. Render service is sleeping (free tier)')
      console.log('2. Network connectivity issue')
      console.log('3. CORS configuration problem')
    }
  }
  
  console.log('\n📋 DEBUGGING CHECKLIST:')
  console.log('□ Backend health check passes')
  console.log('□ User exists in database')
  console.log('□ Correct email format')
  console.log('□ Correct password')
  console.log('□ User account is active')
  console.log('□ Environment variables set on Render')
}

testExactCredentials()