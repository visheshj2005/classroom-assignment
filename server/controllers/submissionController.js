import { validationResult } from 'express-validator'
import Submission from '../models/Submission.js'
import Assignment from '../models/Assignment.js'
import AnalyticsService from '../services/analyticsService.js'
import NotificationService from '../services/notificationService.js'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure multer for submission files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../uploads/submissions')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.zip']
  const ext = path.extname(file.originalname).toLowerCase()
  
  if (allowedTypes.includes(ext)) {
    cb(null, true)
  } else {
    cb(new Error(`File type ${ext} not allowed`), false)
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 3
  }
})

// Create or update submission
export const createSubmission = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { assignmentId } = req.params
    const { submissionType, content } = req.body
    const studentId = req.user._id

    // Get assignment details
    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      })
    }

    // Check if assignment is still accepting submissions
    if (assignment.dueAt && new Date() > assignment.dueAt) {
      if (!assignment.settings?.allowLateSubmissions) {
        return res.status(400).json({
          success: false,
          message: 'Assignment deadline has passed'
        })
      }
    }

    // Check if submission already exists
    let submission = await Submission.findOne({ assignmentId, studentId })
    const isLate = assignment.dueAt && new Date() > assignment.dueAt

    if (submission) {
      // Update existing submission
      submission.submissionType = submissionType
      submission.content = content
      submission.submittedAt = new Date()
      submission.isLate = isLate
      submission.status = 'submitted'
      submission.version += 1

      // Store previous version
      submission.previousVersions.push({
        content: submission.content,
        submittedAt: submission.submittedAt,
        version: submission.version - 1
      })
    } else {
      // Create new submission
      submission = new Submission({
        assignmentId,
        studentId,
        submissionType,
        content,
        isLate,
        status: 'submitted'
      })
    }

    await submission.save()
    await submission.populate('assignmentId', 'title maxScore')
    await submission.populate('studentId', 'name email')

    // Track analytics
    await AnalyticsService.trackAssignmentSubmitted(studentId, submission._id, {
      assignmentTitle: assignment.title,
      submissionType,
      isLate
    })

    res.json({
      success: true,
      message: submission.version > 1 ? 'Submission updated successfully' : 'Submission created successfully',
      data: { submission }
    })
  } catch (error) {
    console.error('Create submission error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create submission'
    })
  }
}

// Get student's submissions
export const getMySubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query
    const studentId = req.user._id

    const filter = { studentId }
    if (status) filter.status = status

    const skip = (page - 1) * limit

    const submissions = await Submission.find(filter)
      .populate('assignmentId', 'title dueAt maxScore classId')
      .populate({
        path: 'assignmentId',
        populate: {
          path: 'classId',
          select: 'title'
        }
      })
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Submission.countDocuments(filter)

    res.json({
      success: true,
      data: {
        submissions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get my submissions error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions'
    })
  }
}

// Get submission by ID
export const getSubmissionById = async (req, res) => {
  try {
    const { submissionId } = req.params

    const submission = await Submission.findById(submissionId)
      .populate('assignmentId', 'title description instructions dueAt maxScore')
      .populate('studentId', 'name email')
      .populate('gradedBy', 'name email')

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      })
    }

    // Check access permissions
    const isStudent = req.user._id.toString() === submission.studentId._id.toString()
    const isTeacher = req.user.role === 'teacher' || req.user.role === 'admin'

    if (!isStudent && !isTeacher) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    res.json({
      success: true,
      data: { submission }
    })
  } catch (error) {
    console.error('Get submission error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submission'
    })
  }
}

// Grade submission (Teacher only)
export const gradeSubmission = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { submissionId } = req.params
    const { score, maxScore, feedback, rubric } = req.body

    const submission = await Submission.findById(submissionId)
      .populate('assignmentId', 'title')
      .populate('studentId', 'name email')

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      })
    }

    // Update grade
    submission.grade = {
      score: parseFloat(score),
      maxScore: parseFloat(maxScore),
      rubric: rubric || []
    }
    submission.feedback = feedback
    submission.status = 'graded'
    submission.gradedBy = req.user._id
    submission.gradedAt = new Date()

    await submission.save()

    // Track analytics
    await AnalyticsService.trackAssignmentGraded(req.user._id, submission._id, {
      score: submission.grade.score,
      maxScore: submission.grade.maxScore,
      percentage: submission.grade.percentage
    })

    // Notify student
    await NotificationService.notifySubmissionGraded(
      submission._id,
      submission.studentId._id,
      submission.assignmentId._id
    )

    res.json({
      success: true,
      message: 'Submission graded successfully',
      data: { submission }
    })
  } catch (error) {
    console.error('Grade submission error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to grade submission'
    })
  }
}

// Delete submission (Student only, before deadline)
export const deleteSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params

    const submission = await Submission.findById(submissionId)
      .populate('assignmentId', 'dueAt')

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      })
    }

    // Check if user owns the submission
    if (submission.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own submissions'
      })
    }

    // Check if assignment deadline has passed
    if (submission.assignmentId.dueAt && new Date() > submission.assignmentId.dueAt) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete submission after deadline'
      })
    }

    // Check if already graded
    if (submission.status === 'graded') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete graded submission'
      })
    }

    // Delete submission files if any
    if (submission.content.files && submission.content.files.length > 0) {
      submission.content.files.forEach(file => {
        const filePath = path.join(__dirname, '../uploads/submissions', file.filename)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      })
    }

    await Submission.findByIdAndDelete(submissionId)

    res.json({
      success: true,
      message: 'Submission deleted successfully'
    })
  } catch (error) {
    console.error('Delete submission error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete submission'
    })
  }
}

// Get grade distribution for assignment (Teacher only)
export const getGradeDistribution = async (req, res) => {
  try {
    const { assignmentId } = req.params

    const distribution = await Submission.aggregate([
      { $match: { assignmentId: assignmentId, 'grade.score': { $exists: true } } },
      {
        $group: {
          _id: '$grade.letterGrade',
          count: { $sum: 1 },
          averageScore: { $avg: '$grade.score' }
        }
      },
      { $sort: { _id: 1 } }
    ])

    const stats = await Submission.aggregate([
      { $match: { assignmentId: assignmentId, 'grade.score': { $exists: true } } },
      {
        $group: {
          _id: null,
          totalSubmissions: { $sum: 1 },
          averageScore: { $avg: '$grade.score' },
          highestScore: { $max: '$grade.score' },
          lowestScore: { $min: '$grade.score' }
        }
      }
    ])

    res.json({
      success: true,
      data: {
        distribution,
        stats: stats[0] || {
          totalSubmissions: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0
        }
      }
    })
  } catch (error) {
    console.error('Get grade distribution error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grade distribution'
    })
  }
}