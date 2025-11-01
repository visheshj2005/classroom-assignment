// Final deployment verification
// Run this after pushing to verify everything works

const verifyDeployment = async () => {
  console.log('🔍 FINAL DEPLOYMENT VERIFICATION')
  console.log('=' .repeat(50))
  
  const config = {
    frontend: 'https://classroom-assignment-pqcj.vercel.app',
    backend: 'https://classroom-assignment-50uu.onrender.com',
    apiUrl: 'https://classroom-assignment-50uu.onrender.com/api'
  }
  
  console.log('🌐 Configuration:')
  Object.entries(config).forEach(([key, value]) => {
    console.log(`${key}: ${value}`)
  })
  
  const tests = [
    {
      name: 'Frontend Accessibility',
      test: async () => {
        const response = await fetch(config.frontend)
        return { success: response.ok, status: response.status }
      }
    },
    {
      name: 'Backend Health Check',
      test: async () => {
        const response = await fetch(`${config.apiUrl}/health`)
        const data = await response.json()
        return { 
          success: response.ok, 
          status: response.status,
          database: data.database,
          environment: data.environment
        }
      }
    },
    {
      name: 'API Test Endpoint',
      test: async () => {
        const response = await fetch(`${config.apiUrl}/test`)
        return { success: response.ok, status: response.status }
      }
    },
    {
      name: 'CORS Configuration',
      test: async () => {
        const response = await fetch(`${config.apiUrl}/health`, {
          headers: { 'Origin': config.frontend }
        })
        return { success: response.ok, status: response.status }
      }
    }
  ]
  
  console.log('\n🧪 Running Tests...')
  
  for (const test of tests) {
    try {
      console.log(`\n${test.name}:`)
      const result = await test.test()
      
      if (result.success) {
        console.log('✅ PASS')
        if (result.database) console.log(`   Database: ${result.database}`)
        if (result.environment) console.log(`   Environment: ${result.environment}`)
      } else {
        console.log(`❌ FAIL (Status: ${result.status})`)
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`)
    }
  }
  
  console.log('\n🎯 LOGIN TEST')
  console.log('Update credentials in quick-deployment-fix.js and run:')
  console.log('npm run test:quick')
  
  console.log('\n📋 DEPLOYMENT CHECKLIST:')
  console.log('□ All tests above pass')
  console.log('□ Environment variables set on Render')
  console.log('□ Frontend deployed to Vercel')
  console.log('□ Backend deployed to Render')
  console.log('□ Login works with test credentials')
  
  console.log('\n🚀 If all tests pass, your deployment is ready!')
}

verifyDeployment()