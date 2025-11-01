#!/usr/bin/env node

// Render.com startup script
// This script ensures the server starts from the correct directory

import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('🚀 Starting Classroom Assignment Backend for Render...')
console.log('📁 Current directory:', process.cwd())
console.log('📁 Script directory:', __dirname)

// Change to server directory
const serverDir = join(__dirname, 'server')
console.log('📁 Server directory:', serverDir)

// Start the server
const serverProcess = spawn('node', ['server.js'], {
  cwd: serverDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: process.env.PORT || 10000
  }
})

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error)
  process.exit(1)
})

serverProcess.on('exit', (code) => {
  console.log(`🔄 Server process exited with code ${code}`)
  process.exit(code)
})

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Received SIGTERM, shutting down gracefully...')
  serverProcess.kill('SIGTERM')
})

process.on('SIGINT', () => {
  console.log('📴 Received SIGINT, shutting down gracefully...')
  serverProcess.kill('SIGINT')
})