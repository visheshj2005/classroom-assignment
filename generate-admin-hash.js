import bcrypt from 'bcryptjs'

const password = process.argv[2] || 'admin123'

async function generateHash() {
  try {
    const salt = await bcrypt.genSalt(12)
    const hash = await bcrypt.hash(password, salt)
    
    console.log('Password:', password)
    console.log('Hash:', hash)
    console.log('\nAdmin user document for MongoDB:')
    console.log(JSON.stringify({
      name: "Admin User",
      email: "admin@example.com",
      passwordHash: hash,
      role: "admin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }, null, 2))
  } catch (error) {
    console.error('Error generating hash:', error)
  }
}

generateHash()