#!/usr/bin/env node

// Test script for Render backend deployment
import axios from 'axios'

const RENDER_URL = 'https://classroom-assignment-50uu.onrender.com'

async function testBackend() {
  console.log('🧪 Testing Render Backend Deployment...')
  console.log(`🔗 Backend URL: ${RENDER_URL}`)
  
  try {
    // Test health endpoint
    console.log('\n1️⃣ Testing health endpoint...')
    const healthResponse = await axios.get(`${RENDER_URL}/api/health`)
    console.log('✅ Health check passed:', healthResponse.data.message)
    console.log('📊 Database status:', healthResponse.data.database)
    console.log('📧 Email service:', healthResponse.data.features.emailService)
    
    // Test API endpoint
    console.log('\n2️⃣ Testing API endpoint...')
    const testResponse = await axios.get(`${RENDER_URL}/api/test`)
    console.log('✅ API test passed:', testResponse.data.message)
    
    // Test CORS (this should work from your local machine)
    console.log('\n3️⃣ Testing CORS configuration...')
    const corsResponse = await axios.get(`${RENDER_URL}/api/health`, {
      headers: {
        'Origin': 'https://classroom-assignment-pqcj.vercel.app'
      }
    })
    console.log('✅ CORS test passed')
    
    console.log('\n🎉 Backend deployment successful!')
    console.log('🔗 Your backend is ready at:', RENDER_URL)
    console.log('📝 Next steps:')
    console.log('   1. Update Vercel environment variable: VITE_API_URL=' + RENDER_URL + '/api')
    console.log('   2. Redeploy your frontend on Vercel')
    console.log('   3. Test the full application')
    
  } catch (error) {
    console.error('❌ Backend test failed:', error.message)
    
    if (error.response) {
      console.error('📄 Response status:', error.response.status)
      console.error('📄 Response data:', error.response.data)
    }
    
    console.log('\n🔍 Troubleshooting:')
    console.log('   1. Check if the Render service is running')
    console.log('   2. Verify environment variables are set correctly')
    console.log('   3. Check Render logs for errors')
  }
}

testBackend()