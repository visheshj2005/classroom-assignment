// Test if user exists in database on deployed version
// This will help determine if it's a database connection or password issue

const testUserExists = async () => {
  const DEPLOYED_URL = 'https://your-app.vercel.app' // Update with your actual URL
  
  console.log('🔍 TESTING IF USER EXISTS IN DEPLOYED DATABASE')
  console.log('=' .repeat(50))
  
  // We'll create a simple endpoint test
  // First, let's test with a non-existent email to see the difference
  
  const tests = [
    {
      name: 'Non-existent user test',
      email: 'nonexistent@test.com',
      password: 'wrongpassword'
    },
    {
      name: 'Your actual user test',
      email: 'admin@example.com', // Replace with your actual email
      password: 'wrongpassword' // Intentionally wrong to see if user exists
    },
    {
      name: 'Your actual credentials',
      email: 'admin@example.com', // Replace with your actual email  
      password: 'your-actual-password' // Replace with actual password
    }
  ]
  
  for (const test of tests) {
    console.log(`\n📧 ${test.name}`)
    console.log(`Email: ${test.email}`)
    
    try {
      const response = await fetch(`${DEPLOYED_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: test.email,
          password: test.password
        })
      })
      
      const data = await response.json()
      
      console.log(`Status: ${response.status}`)
      console.log(`Message: ${data.message}`)
      
      // Analyze the response
      if (data.message === 'Invalid email or password') {
        if (test.password === 'wrongpassword') {
          console.log('✅ User exists (got invalid password message)')
        } else {
          console.log('❌ Either user doesn\'t exist OR password is wrong')
        }
      } else if (data.message === 'Validation failed') {
        console.log('⚠️  Validation error:', data.errors)
      } else if (response.ok) {
        console.log('✅ Login successful!')
      }
      
    } catch (error) {
      console.log('❌ Request failed:', error.message)
    }
  }
}

testUserExists()