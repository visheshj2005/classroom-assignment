#!/usr/bin/env node

/**
 * Test script to verify cross-origin session handling
 * Tests the login flow and subsequent authenticated requests
 */

import fetch from 'node-fetch';

const NGROK_URL = 'https://paronymous-jacki-gelatinously.ngrok-free.dev';
const API_BASE = `${NGROK_URL}/api`;

// Test credentials
const testCredentials = {
  email: 'admin@example.com',
  password: 'Visheshjain18@'
};

async function testCrossOriginSession() {
  console.log('🧪 Testing Cross-Origin Session Handling');
  console.log('Backend URL:', API_BASE);
  console.log('Frontend Origin: https://classroom-assignment-pqcj.vercel.app');
  console.log('');

  try {
    // Step 1: Test login
    console.log('1️⃣ Testing login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://classroom-assignment-pqcj.vercel.app'
      },
      body: JSON.stringify(testCredentials),
      credentials: 'include' // This is equivalent to withCredentials: true
    });

    console.log('Login Status:', loginResponse.status);
    console.log('Login Headers:', Object.fromEntries(loginResponse.headers.entries()));
    
    const loginData = await loginResponse.json();
    console.log('Login Response:', loginData);
    
    // Extract cookies from response
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    console.log('Set-Cookie Header:', setCookieHeader);
    
    if (loginResponse.status !== 200) {
      throw new Error('Login failed');
    }

    // Step 2: Test authenticated request using the session cookie
    console.log('\n2️⃣ Testing authenticated request...');
    const authResponse = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: {
        'Origin': 'https://classroom-assignment-pqcj.vercel.app',
        'Cookie': setCookieHeader || '' // Include the session cookie
      },
      credentials: 'include'
    });

    console.log('Auth Check Status:', authResponse.status);
    console.log('Auth Check Headers:', Object.fromEntries(authResponse.headers.entries()));
    
    const authData = await authResponse.json();
    console.log('Auth Response:', authData);

    if (authResponse.status === 200) {
      console.log('\n✅ SUCCESS: Cross-origin session is working!');
      console.log('User authenticated:', authData.user?.name);
    } else {
      console.log('\n❌ FAILED: Session not maintained across requests');
      console.log('This indicates a cookie/session configuration issue');
    }

  } catch (error) {
    console.error('\n💥 Error during test:', error.message);
  }
}

// Run the test
testCrossOriginSession();