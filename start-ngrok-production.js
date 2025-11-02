#!/usr/bin/env node

/**
 * Start backend server for ngrok hybrid deployment with correct environment
 */

import { spawn } from 'child_process'
import path from 'path'

console.log('🚀 Starting Backend Server for Ngrok Hybrid Deployment...')
console.log('')
console.log('📝 Configuration:')
console.log('   Environment: production')
console.log('   Backend: http://localhost:5000')
console.log('   Ngrok: https://paronymous-jacki-gelatinously.ngrok-free.dev')
console.log('   Frontend: https://classroom-assignment-pqcj.vercel.app')
console.log('')

// Set environment variables
process.env.NODE_ENV = 'production'

// Start the server
const serverProcess = spawn('npm', ['start'], {
  cwd: path.join(process.cwd(), 'server'),
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production'
  }
})

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error)
  process.exit(1)
})

serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`)
  process.exit(code)
})

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...')
  serverProcess.kill('SIGINT')
})

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...')
  serverProcess.kill('SIGTERM')
})