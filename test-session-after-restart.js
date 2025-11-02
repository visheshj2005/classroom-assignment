#!/usr/bin/env node

/**
 * Test script to verify session works after server restart
 */

import axios from 'axios';

const NGROK_URL = 'https://paronymous-jacki-gelatinously.ngrok-free.dev';
const VERCEL_URL = 'https://classroom-assignment-pqcj.vercel.app';

// Create axios instance that exactly mimics frontend behavior
const api = axios.create({
  baseURL: `${NGROK_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Origin': VERCEL_URL,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
});

async function testSessionAfterRestart() {
  console.log('🔄 Testing Session After Server Restart');
  console.log('Backend:', NGROK_URL);
  console.log('Frontend Origin:', VERCEL_URL);
  console.log('');

  try {
    // Step 1: Clear any existing session
    console.log('1️⃣ Clearing any existing session...');
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore logout errors
    }

    // Step 2: Test login with correct credentials
    console.log('2️⃣ Testing login...');
    const loginResponse = await api.post('/auth/login', {
      email: 'admin@example.com',
      password: 'Visheshjain18@'
    });

    console.log('✅ Login Status:', loginResponse.status);
    console.log('✅ Login Message:', loginResponse.data.message);
    
    // Check if Set-Cookie header is present
    const setCookie = loginResponse.headers['set-cookie'];
    if (setCookie) {
      console.log('🍪 Session cookie set:', setCookie[0].substring(0, 50) + '...');
      
      // Check cookie attributes
      const cookieStr = setCookie[0];
      console.log('🔒 Cookie secure:', cookieStr.includes('Secure'));
      console.log('🌐 Cookie sameSite:', cookieStr.includes('SameSite=None') ? 'None' : 'Other');
      console.log('🔐 Cookie httpOnly:', cookieStr.includes('HttpOnly'));
    } else {
      console.log('❌ No session cookie in response!');
    }

    // Step 3: Test authenticated request immediately
    console.log('\n3️⃣ Testing immediate authenticated request...');
    const meResponse = await api.get('/auth/me');
    
    console.log('✅ Auth check successful!');
    console.log('👤 User:', meResponse.data.user.name);
    console.log('🎭 Role:', meResponse.data.user.role);

    // Step 4: Test another authenticated endpoint
    console.log('\n4️⃣ Testing dashboard data request...');
    const statsResponse = await api.get('/users/stats');
    
    console.log('✅ Dashboard data retrieved!');
    console.log('📊 Stats:', Object.keys(statsResponse.data));

    console.log('\n🎉 SUCCESS: All session tests passed!');
    console.log('Your frontend should now work correctly.');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🔧 Session issue detected. Troubleshooting steps:');
      console.log('1. Restart your server: npm run dev:server');
      console.log('2. Clear browser cookies completely');
      console.log('3. Check ngrok URL is still active');
      console.log('4. Verify SESSION_SECRET is set in server/.env');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Connection issue:');
      console.log('1. Make sure your server is running');
      console.log('2. Check if ngrok tunnel is active');
      console.log('3. Verify the ngrok URL is correct');
    }
  }
}

testSessionAfterRestart();