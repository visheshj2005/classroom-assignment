import mongoose from 'mongoose'

const analyticsSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'user_login',
      'user_logout',
      'assignment_created',
      'assignment_submitted',
      'assignment_graded',
      'class_created',
      'class_joined',
      'file_uploaded',
      'page_view',
      'api_call',
      'error_occurred'
    ],
    required: [true, 'Analytics type is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'entityType'
  },
  entityType: {
    type: String,
    enum: ['User', 'Class', 'Assignment', 'Submission']
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    sessionId: String,
    duration: Number, // in milliseconds
    path: String,
    method: String,
    statusCode: Number,
    errorMessage: String,
    fileSize: Number,
    grade: Number,
    submissionType: String,
    deviceType: {
      type: String,
      enum: ['desktop', 'tablet', 'mobile', 'unknown']
    },
    browser: String,
    os: String,
    country: String,
    city: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  date: {
    type: String, // YYYY-MM-DD format for easy aggregation
    default: () => new Date().toISOString().split('T')[0]
  },
  hour: {
    type: Number, // 0-23 for hourly analytics
    default: () => new Date().getHours()
  }
}, {
  timestamps: false // We're using custom timestamp
})

// Indexes for performance
analyticsSchema.index({ type: 1, date: -1 })
analyticsSchema.index({ userId: 1, timestamp: -1 })
analyticsSchema.index({ entityId: 1, entityType: 1 })
analyticsSchema.index({ timestamp: -1 })
analyticsSchema.index({ date: -1, hour: 1 })

// TTL index to automatically delete old analytics data after 1 year
analyticsSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 })

export default mongoose.model('Analytics', analyticsSchema)