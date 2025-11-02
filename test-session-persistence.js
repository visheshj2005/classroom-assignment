#!/usr/bin/env node

/**
 * Test script to check session persistence between login and subsequent requests
 */

import axios from 'axios';

const NGROK_URL = 'https://paronymous-jacki-gelatinously.ngrok-free.dev';
const VERCEL_URL = 'https://classroom-assignment-pqcj.vercel.app';

async function testSessionPersistence() {
  console.log('🔐 Testing Session Persistence');
  console.log('Backend:', NGROK_URL);
  console.log('');

  // Create axios instance that exactly matches frontend
  const api = axios.create({
    baseURL: `${NGROK_URL}/api`,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      'Origin': VERCEL_URL
    },
    timeout: 10000
  });

  try {
    // Step 1: Login
    console.log('1️⃣ Attempting login...');
    const loginResponse = await api.post('/auth/login', {
      email: 'admin@example.com',
      password: 'Visheshjain18@'
    });

    console.log('✅ Login successful:', loginResponse.data.message);
    
    // Check Set-Cookie header
    const setCookieHeader = loginResponse.headers['set-cookie'];
    if (setCookieHeader) {
      console.log('🍪 Set-Cookie header received:');
      setCookieHeader.forEach((cookie, index) => {
        console.log(`   ${index + 1}. ${cookie.substring(0, 80)}...`);
      });
      
      // Parse cookie attributes
      const sessionCookie = setCookieHeader.find(c => c.includes('classroom.sid'));
      if (sessionCookie) {
        console.log('🔍 Session cookie attributes:');
        console.log('   - Secure:', sessionCookie.includes('Secure'));
        console.log('   - HttpOnly:', sessionCookie.includes('HttpOnly'));
        console.log('   - SameSite:', sessionCookie.includes('SameSite=None') ? 'None' : 'Other');
        console.log('   - Domain:', sessionCookie.includes('Domain=') ? 'Set' : 'Not set');
      }
    } else {
      console.log('❌ No Set-Cookie header in login response!');
    }

    // Step 2: Immediate auth check (should work)
    console.log('\n2️⃣ Testing immediate auth check...');
    const authResponse = await api.get('/auth/me');
    
    console.log('✅ Auth check successful!');
    console.log('User:', authResponse.data.data.user.name);
    console.log('Role:', authResponse.data.data.user.role);

    // Step 3: Test dashboard data (this is where it usually fails)
    console.log('\n3️⃣ Testing dashboard data request...');
    const statsResponse = await api.get('/users/stats');
    
    console.log('✅ Dashboard data retrieved!');
    console.log('Total users:', statsResponse.data.data.totalUsers);
    console.log('Role distribution:', statsResponse.data.data.roleDistribution);

    // Step 4: Test with a small delay (simulate real usage)
    console.log('\n4️⃣ Testing with 2-second delay...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const delayedResponse = await api.get('/users/stats');
    console.log('✅ Delayed request successful!');
    console.log('Total users:', delayedResponse.data.data.totalUsers);

    console.log('\n🎉 SUCCESS: Session persistence is working correctly!');

  } catch (error) {
    console.error('\n❌ Session persistence test failed:');
    console.error('Error:', error.response?.data?.message || error.message);
    console.error('Status:', error.response?.status);
    
    if (error.response?.status === 401) {
      console.log('\n🔧 Session issue detected:');
      console.log('1. Session cookie not being sent with requests');
      console.log('2. Session cookie attributes might be incorrect');
      console.log('3. CORS credentials not working properly');
      console.log('4. Session store (MongoDB) might have issues');
      
      console.log('\n📋 Check server logs for:');
      console.log('- Session creation details during login');
      console.log('- Session validation details during auth middleware');
      console.log('- Cookie headers in requests');
    }
    
    if (error.code === 'ERR_NETWORK') {
      console.log('\n🌐 Network issue:');
      console.log('- Check if ngrok tunnel is still active');
      console.log('- Verify ngrok URL is correct');
    }
  }
}

testSessionPersistence();