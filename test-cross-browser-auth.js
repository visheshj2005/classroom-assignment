#!/usr/bin/env node

/**
 * Test script to simulate cross-browser authentication issues
 * This simulates what happens when a user logs in from different browsers/devices
 */

import axios from 'axios';

const NGROK_URL = 'https://paronymous-jacki-gelatinously.ngrok-free.dev';
const VERCEL_URL = 'https://classroom-assignment-pqcj.vercel.app';

// Simulate different browser sessions
const createBrowserSession = (sessionName) => {
  return axios.create({
    baseURL: `${NGROK_URL}/api`,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'Origin': VERCEL_URL,
      'User-Agent': `TestBrowser-${sessionName}`
    }
  });
};

async function testCrossBrowserAuth() {
  console.log('🌐 Testing Cross-Browser Authentication');
  console.log('Simulating login from different browsers/devices');
  console.log('');

  const testCredentials = {
    email: 'admin@example.com',
    password: 'Visheshjain18@'
  };

  try {
    // Simulate Browser 1 (Chrome)
    console.log('🔵 Browser 1 (Chrome) - Login and fetch data');
    const browser1 = createBrowserSession('Chrome');
    
    const login1 = await browser1.post('/auth/login', testCredentials);
    console.log('✅ Browser 1 login:', login1.data.message);
    
    const auth1 = await browser1.get('/auth/me');
    console.log('✅ Browser 1 auth check:', auth1.data.user.name);
    
    const stats1 = await browser1.get('/users/stats');
    console.log('✅ Browser 1 dashboard data:', stats1.data.success ? 'Success' : 'Failed');
    console.log('📊 Browser 1 total users:', stats1.data.data?.totalUsers || 'N/A');

    console.log('');

    // Simulate Browser 2 (Firefox) - Different session
    console.log('🟠 Browser 2 (Firefox) - Login and fetch data');
    const browser2 = createBrowserSession('Firefox');
    
    const login2 = await browser2.post('/auth/login', testCredentials);
    console.log('✅ Browser 2 login:', login2.data.message);
    
    const auth2 = await browser2.get('/auth/me');
    console.log('✅ Browser 2 auth check:', auth2.data.user.name);
    
    const stats2 = await browser2.get('/users/stats');
    console.log('✅ Browser 2 dashboard data:', stats2.data.success ? 'Success' : 'Failed');
    console.log('📊 Browser 2 total users:', stats2.data.data?.totalUsers || 'N/A');

    console.log('');

    // Simulate Mobile Browser - Different session
    console.log('📱 Mobile Browser - Login and fetch data');
    const mobile = createBrowserSession('Mobile');
    
    const loginMobile = await mobile.post('/auth/login', testCredentials);
    console.log('✅ Mobile login:', loginMobile.data.message);
    
    const authMobile = await mobile.get('/auth/me');
    console.log('✅ Mobile auth check:', authMobile.data.user.name);
    
    const statsMobile = await mobile.get('/users/stats');
    console.log('✅ Mobile dashboard data:', statsMobile.data.success ? 'Success' : 'Failed');
    console.log('📊 Mobile total users:', statsMobile.data.data?.totalUsers || 'N/A');

    console.log('');
    console.log('🎉 SUCCESS: All browsers can login and fetch data independently!');
    console.log('Each browser/device maintains its own session correctly.');

  } catch (error) {
    console.error('❌ Cross-browser test failed:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 401) {
      console.log('');
      console.log('🔧 Authentication issue detected:');
      console.log('1. Session cookies might not be working properly');
      console.log('2. Check server logs for session creation/validation');
      console.log('3. Verify CORS and cookie settings');
    }
    
    console.log('');
    console.log('📋 Debug info:');
    console.log('- Status:', error.response?.status);
    console.log('- URL:', error.config?.url);
    console.log('- Method:', error.config?.method);
  }
}

testCrossBrowserAuth();