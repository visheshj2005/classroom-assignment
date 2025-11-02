#!/usr/bin/env node

/**
 * Test script to diagnose ngrok connectivity issues
 */

import axios from 'axios';

const NGROK_URL = 'https://paronymous-jacki-gelatinously.ngrok-free.dev';
const VERCEL_URL = 'https://classroom-assignment-pqcj.vercel.app';

async function testNgrokConnectivity() {
  console.log('🌐 Testing ngrok Connectivity');
  console.log('ngrok URL:', NGROK_URL);
  console.log('');

  // Test 1: Basic connectivity
  console.log('1️⃣ Testing basic ngrok connectivity...');
  try {
    const response = await axios.get(NGROK_URL, {
      timeout: 5000,
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    console.log('✅ Basic connectivity: OK');
    console.log('Status:', response.status);
  } catch (error) {
    console.log('❌ Basic connectivity failed:', error.message);
    if (error.code === 'ECONNABORTED') {
      console.log('⚠️  Timeout - ngrok tunnel might be slow');
    }
  }

  // Test 2: API endpoint connectivity
  console.log('\n2️⃣ Testing API endpoint connectivity...');
  try {
    const apiClient = axios.create({
      baseURL: `${NGROK_URL}/api`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Origin': VERCEL_URL
      },
      withCredentials: true
    });

    // Test a simple endpoint that doesn't require auth
    const response = await apiClient.get('/health');
    console.log('✅ API endpoint: OK');
  } catch (error) {
    console.log('❌ API endpoint failed:', error.response?.status || error.message);
    
    if (error.response?.status === 404) {
      console.log('ℹ️  /health endpoint not found, trying auth endpoint...');
      
      // Try auth endpoint
      try {
        await apiClient.get('/auth/me');
        console.log('✅ Auth endpoint reachable (401 expected)');
      } catch (authError) {
        if (authError.response?.status === 401) {
          console.log('✅ Auth endpoint reachable (401 as expected)');
        } else {
          console.log('❌ Auth endpoint failed:', authError.message);
        }
      }
    }
  }

  // Test 3: Login flow
  console.log('\n3️⃣ Testing login flow...');
  try {
    const loginClient = axios.create({
      baseURL: `${NGROK_URL}/api`,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Origin': VERCEL_URL
      },
      withCredentials: true
    });

    const loginResponse = await loginClient.post('/auth/login', {
      email: 'admin@example.com',
      password: 'Visheshjain18@'
    });

    console.log('✅ Login: OK');
    console.log('Message:', loginResponse.data.message);

    // Test authenticated request
    console.log('\n4️⃣ Testing authenticated request...');
    const statsResponse = await loginClient.get('/users/stats');
    console.log('✅ Authenticated request: OK');
    console.log('Total users:', statsResponse.data.data?.totalUsers || 'N/A');

  } catch (error) {
    console.log('❌ Login/Auth flow failed:', error.response?.data?.message || error.message);
    
    if (error.code === 'ECONNABORTED') {
      console.log('⚠️  Request timeout - this might be the issue!');
      console.log('💡 Try increasing timeout or check ngrok tunnel stability');
    } else if (error.code === 'ERR_NETWORK') {
      console.log('⚠️  Network error - ngrok tunnel might be blocked or down');
    }
  }

  console.log('\n📋 Troubleshooting steps if tests fail:');
  console.log('1. Check if ngrok tunnel is still active');
  console.log('2. Restart ngrok tunnel: ngrok http 5000');
  console.log('3. Update VITE_API_URL in .env with new ngrok URL');
  console.log('4. Clear browser cache and cookies');
  console.log('5. Check if firewall/antivirus is blocking ngrok');
}

testNgrokConnectivity();