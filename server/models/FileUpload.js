import mongoose from 'mongoose'

const fileUploadSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: [true, 'Filename is required']
  },
  originalName: {
    type: String,
    required: [true, 'Original filename is required']
  },
  mimetype: {
    type: String,
    required: [true, 'MIME type is required']
  },
  size: {
    type: Number,
    required: [true, 'File size is required'],
    min: [1, 'File size must be greater than 0']
  },
  path: {
    type: String,
    required: [true, 'File path is required']
  },
  url: {
    type: String,
    required: [true, 'File URL is required']
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader ID is required']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'entityType'
  },
  entityType: {
    type: String,
    enum: ['Assignment', 'Submission', 'Comment', 'User'],
    required: [true, 'Entity type is required']
  },
  category: {
    type: String,
    enum: ['assignment_attachment', 'submission_file', 'comment_attachment', 'profile_avatar'],
    required: [true, 'File category is required']
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  lastDownloaded: Date,
  metadata: {
    width: Number, // For images
    height: Number, // For images
    duration: Number, // For videos/audio
    pages: Number, // For PDFs
    checksum: String, // File integrity check
    virusScanStatus: {
      type: String,
      enum: ['pending', 'clean', 'infected', 'error'],
      default: 'pending'
    },
    virusScanDate: Date
  },
  expiresAt: Date, // For temporary files
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Indexes for performance
fileUploadSchema.index({ uploadedBy: 1, createdAt: -1 })
fileUploadSchema.index({ entityId: 1, entityType: 1 })
fileUploadSchema.index({ category: 1 })
fileUploadSchema.index({ mimetype: 1 })
fileUploadSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Virtual for file extension
fileUploadSchema.virtual('extension').get(function() {
  return this.originalName.split('.').pop().toLowerCase()
})

// Virtual for human readable file size
fileUploadSchema.virtual('humanSize').get(function() {
  const bytes = this.size
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
})

// Method to increment download count
fileUploadSchema.methods.incrementDownload = function() {
  this.downloadCount += 1
  this.lastDownloaded = new Date()
  return this.save()
}

export default mongoose.model('FileUpload', fileUploadSchema)