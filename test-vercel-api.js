// Simple script to test Vercel API endpoints
const testEndpoints = async () => {
  const baseUrl = process.argv[2] || 'http://localhost:5000'
  
  console.log(`Testing API endpoints at: ${baseUrl}`)
  
  const endpoints = [
    '/api/health',
    '/api/test',
    '/api/auth/login',
    '/api/auth/register'
  ]
  
  for (const endpoint of endpoints) {
    try {
      const url = `${baseUrl}${endpoint}`
      console.log(`\nTesting: ${url}`)
      
      const response = await fetch(url, {
        method: endpoint.includes('login') || endpoint.includes('register') ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        body: endpoint.includes('login') ? JSON.stringify({
          email: 'test@example.com',
          password: 'testpass'
        }) : endpoint.includes('register') ? JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'testpass',
          role: 'student'
        }) : undefined
      })
      
      console.log(`Status: ${response.status}`)
      
      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json()
        console.log('Response:', JSON.stringify(data, null, 2))
      } else {
        const text = await response.text()
        console.log('Response:', text.substring(0, 200))
      }
      
    } catch (error) {
      console.error(`Error testing ${endpoint}:`, error.message)
    }
  }
}

testEndpoints().catch(console.error)