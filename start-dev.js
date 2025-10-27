#!/usr/bin/env node

// Development startup script
const { spawn } = require('child_process')
const path = require('path')

console.log('🚀 Starting Classroom Portal Development Environment...')

// Start the backend server
console.log('📡 Starting backend server...')
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true
})

// Wait a bit for backend to start
setTimeout(() => {
  console.log('🎨 Starting frontend development server...')
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  })

  frontend.on('close', (code) => {
    console.log(`Frontend process exited with code ${code}`)
    backend.kill()
  })
}, 3000)

backend.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`)
})

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development servers...')
  backend.kill()
  process.exit(0)
})

console.log('\n📋 Development Environment Started!')
console.log('🔗 Frontend: http://localhost:5173')
console.log('🔗 Backend: http://localhost:5000')
console.log('\n💡 Demo Accounts:')
console.log('👨‍🏫 Teacher: teacher@example.com / password123')
console.log('👨‍🎓 Student: student@example.com / password123')
console.log('👨‍💼 Admin: admin@example.com / password123')
console.log('\nPress Ctrl+C to stop both servers')