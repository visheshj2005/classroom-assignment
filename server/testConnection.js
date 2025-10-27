import mongoose from 'mongoose'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const testConnection = async () => {
  try {
    console.log('🔍 Testing database connection...')
    console.log(`📍 Connecting to: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/classroom-assignment'}`)
    
    const options = {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 5
    }
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/classroom-assignment', options)
    
    console.log('✅ Database connection successful')
    console.log(`📊 Database: ${mongoose.connection.name}`)
    console.log(`🏠 Host: ${mongoose.connection.host}:${mongoose.connection.port}`)
    
    // Test a simple query
    try {
      const collections = await mongoose.connection.db.listCollections().toArray()
      console.log(`📁 Found ${collections.length} collections in database`)
      
      if (collections.length > 0) {
        console.log('📋 Collections:')
        collections.forEach(col => console.log(`   - ${col.name}`))
      }
    } catch (queryError) {
      console.log('⚠️ Could not list collections (this is normal for new databases)')
    }
    
    await mongoose.disconnect()
    console.log('🔌 Database connection closed')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('')
      console.log('💡 Troubleshooting tips:')
      console.log('   1. Make sure MongoDB is installed and running')
      console.log('   2. Check if MongoDB service is started')
      console.log('   3. Verify the connection string in server/.env')
      console.log('   4. For local MongoDB, try: mongodb://localhost:27017/classroom-assignment')
      console.log('   5. For MongoDB Atlas, use the connection string from your cluster')
    }
    
    process.exit(1)
  }
}

testConnection()