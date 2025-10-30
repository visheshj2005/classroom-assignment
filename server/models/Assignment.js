import mongoose from 'mongoose'

const assignmentSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class ID is required']
  },
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: [5000, 'Instructions cannot exceed 5000 characters']
  },
  dueAt: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > new Date()
      },
      message: 'Due date must be in the future'
    }
  },
  maxScore: {
    type: Number,
    default: 100,
    min: [1, 'Max score must be at least 1']
  },
  submissionType: {
    type: String,
    enum: ['link'],
    default: 'link'
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'closed', 'archived'],
    default: 'active'
  },
  visibility: {
    type: String,
    enum: ['visible', 'hidden'],
    default: 'visible'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Indexes for performance
assignmentSchema.index({ classId: 1, dueAt: 1 })
assignmentSchema.index({ createdBy: 1 })
assignmentSchema.index({ status: 1 })
assignmentSchema.index({ dueAt: 1 })

// Virtual for checking if assignment is overdue
assignmentSchema.virtual('isOverdue').get(function() {
  return new Date() > this.dueAt
})

// Virtual for days until due
assignmentSchema.virtual('daysUntilDue').get(function() {
  const now = new Date()
  const due = new Date(this.dueAt)
  const diffTime = due - now
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

export default mongoose.model('Assignment', assignmentSchema)