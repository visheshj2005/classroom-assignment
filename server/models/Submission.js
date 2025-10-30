import mongoose from 'mongoose'

const submissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: [true, 'Assignment ID is required']
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  submissionType: {
    type: String,
    enum: ['link'],
    default: 'link',
    required: [true, 'Submission type is required']
  },
  content: {
    // For link submissions
    url: {
      type: String,
      required: [true, 'URL is required'],
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+/.test(v)
        },
        message: 'Please provide a valid URL'
      }
    },
    // Additional text content
    text: {
      type: String,
      maxlength: [1000, 'Text content cannot exceed 1000 characters']
    }
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'returned', 'late'],
    default: 'submitted'
  },
  isLate: {
    type: Boolean,
    default: false
  },
  grade: {
    score: {
      type: Number,
      min: 0
    },
    maxScore: {
      type: Number,
      min: 1
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100
    },
    letterGrade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F']
    },
    rubric: [{
      criterion: String,
      score: Number,
      maxScore: Number,
      feedback: String
    }]
  },
  feedback: {
    type: String,
    maxlength: [2000, 'Feedback cannot exceed 2000 characters']
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  gradedAt: Date,
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    content: mongoose.Schema.Types.Mixed,
    submittedAt: Date,
    version: Number
  }],
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

// Compound indexes for performance
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true })
submissionSchema.index({ studentId: 1, status: 1 })
submissionSchema.index({ assignmentId: 1, status: 1 })
submissionSchema.index({ submittedAt: -1 })

// Calculate percentage when score is set
submissionSchema.pre('save', function(next) {
  if (this.grade && this.grade.score !== undefined && this.grade.maxScore) {
    this.grade.percentage = Math.round((this.grade.score / this.grade.maxScore) * 100)
    
    // Calculate letter grade
    const percentage = this.grade.percentage
    if (percentage >= 97) this.grade.letterGrade = 'A+'
    else if (percentage >= 93) this.grade.letterGrade = 'A'
    else if (percentage >= 90) this.grade.letterGrade = 'A-'
    else if (percentage >= 87) this.grade.letterGrade = 'B+'
    else if (percentage >= 83) this.grade.letterGrade = 'B'
    else if (percentage >= 80) this.grade.letterGrade = 'B-'
    else if (percentage >= 77) this.grade.letterGrade = 'C+'
    else if (percentage >= 73) this.grade.letterGrade = 'C'
    else if (percentage >= 70) this.grade.letterGrade = 'C-'
    else if (percentage >= 67) this.grade.letterGrade = 'D+'
    else if (percentage >= 60) this.grade.letterGrade = 'D'
    else this.grade.letterGrade = 'F'
  }
  next()
})

export default mongoose.model('Submission', submissionSchema)