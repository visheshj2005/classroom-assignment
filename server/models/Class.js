import mongoose from 'mongoose'

const classSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Class title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  joinCode: {
    type: String,
    required: [true, 'Join code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z0-9]{6}$/, 'Join code must be exactly 6 alphanumeric characters']
  },
  subject: {
    type: String,
    trim: true,
    maxlength: [50, 'Subject cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher is required']
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  settings: {
    allowLateSubmissions: {
      type: Boolean,
      default: true
    },
    autoGrading: {
      type: Boolean,
      default: false
    },
    maxFileSize: {
      type: Number,
      default: 10 * 1024 * 1024 // 10MB
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Indexes for performance (joinCode already has unique index)
classSchema.index({ teacherId: 1 })
classSchema.index({ students: 1 })
classSchema.index({ createdAt: -1 })

// Generate unique join code
classSchema.statics.generateJoinCode = async function() {
  let joinCode
  let exists = true
  
  while (exists) {
    joinCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    exists = await this.findOne({ joinCode })
  }
  
  return joinCode
}

export default mongoose.model('Class', classSchema)