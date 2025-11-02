#!/usr/bin/env node

/**
 * Quick verification script for session configuration
 */

import axios from 'axios';

const NGROK_URL = 'https://paronymous-jacki-gelatinously.ngrok-free.dev';
const VERCEL_URL = 'https://classroom-assignment-pqcj.vercel.app';

// Create axios instance that mimics frontend behavior
const api = axios.create({
  baseURL: `${NGROK_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Origin': VERCEL_URL
  }
});

async function verifySessionFix() {
  console.log('🔍 Verifying Session Configuration Fix');
  console.log('Backend:', NGROK_URL);
  console.log('Frontend Origin:', VERCEL_URL);
  console.log('');

  try {
    // Test login
    console.log('1️⃣ Attempting login...');
    const loginResponse = await api.post('/auth/login', {
      email: 'admin@example.com',
      password: 'Visheshjain18@'
    });

    console.log('✅ Login successful:', loginResponse.data.message);
    console.log('Session cookie should be set with secure=true, sameSite=none');
    
    // Test authenticated request
    console.log('\n2️⃣ Testing authenticated request...');
    const meResponse = await api.get('/auth/me');
    
    console.log('✅ Authentication check successful!');
    console.log('User:', meResponse.data.user.name);
    console.log('Role:', meResponse.data.user.role);
    
    console.log('\n🎉 SUCCESS: Cross-origin session is working correctly!');
    console.log('Your frontend should now maintain login state.');

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Make sure server is running with the new configuration');
      console.log('2. Check that SESSION_SECRET is set in server/.env');
      console.log('3. Verify ngrok URL is correct');
      console.log('4. Clear browser cookies and try again');
    }
  }
}

verifySessionFix();