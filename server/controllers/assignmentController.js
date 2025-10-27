import { validationResult } from 'express-validator'
import Assignment from '../models/Assignment.js'
import Class from '../models/Class.js'
import Submission from '../models/Submission.js'
import AnalyticsService from '../services/analyticsService.js'
import NotificationService from '../services/notificationService.js'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../uploads/assignments')
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
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5
  }
})

// Create assignment
export const createAssignment = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { classId } = req.params
    const {
      title,
      description,
      instructions,
      dueAt,
      maxScore,
      submissionType,
      allowedFileTypes
    } = req.body

    // Process file attachments
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/api/uploads/assignments/${file.filename}`
    })) : []

    const assignment = new Assignment({
      classId,
      title,
      description,
      instructions,
      dueAt: dueAt ? new Date(dueAt) : null,
      maxScore: maxScore || 100,
      submissionType: submissionType || 'both',
      allowedFileTypes: allowedFileTypes || ['pdf', 'doc', 'docx', 'txt'],
      attachments,
      createdBy: req.user._id
    })

    await assignment.save()
    await assignment.populate('classId', 'title students')

    // Track analytics
    await AnalyticsService.trackAssignmentCreated(req.user._id, assignment._id, {
      title: assignment.title,
      classId: classId
    })

    // Notify students
    await NotificationService.notifyAssignmentCreated(assignment._id, classId)

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: { assignment }
    })
  } catch (error) {
    console.error('Create assignment error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create assignment'
    })
  }
}

// Get assignments for a class
export const getClassAssignments = async (req, res) => {
  try {
    const { classId } = req.params
    const { page = 1, limit = 10, status } = req.query

    const filter = { classId }
    if (status) filter.status = status

    const skip = (page - 1) * limit
    
    const assignments = await Assignment.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Assignment.countDocuments(filter)

    res.json({
      success: true,
      data: {
        assignments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get class assignments error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments'
    })
  }
}

// Get assignment by ID
export const getAssignmentById = async (req, res) => {
  try {
    const { assignmentId } = req.params

    const assignment = await Assignment.findById(assignmentId)
      .populate('classId', 'title teacherId students')
      .populate('createdBy', 'name email')

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      })
    }

    // Get user's submission if student
    let userSubmission = null
    if (req.user.role === 'student') {
      userSubmission = await Submission.findOne({
        assignmentId: assignment._id,
        studentId: req.user._id
      })
    }

    res.json({
      success: true,
      data: {
        assignment,
        userSubmission
      }
    })
  } catch (error) {
    console.error('Get assignment error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignment'
    })
  }
}

// Update assignment
export const updateAssignment = async (req, res) => {
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
    const updateData = req.body

    // Convert dueAt to Date if provided
    if (updateData.dueAt) {
      updateData.dueAt = new Date(updateData.dueAt)
    }

    const assignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      { ...updateData, updatedBy: req.user._id },
      { new: true, runValidators: true }
    ).populate('classId', 'title')
      .populate('createdBy', 'name email')

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      })
    }

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      data: { assignment }
    })
  } catch (error) {
    console.error('Update assignment error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update assignment'
    })
  }
}

// Delete assignment
export const deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params

    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      })
    }

    // Delete associated submissions
    await Submission.deleteMany({ assignmentId })

    // Delete assignment files
    if (assignment.attachments && assignment.attachments.length > 0) {
      assignment.attachments.forEach(attachment => {
        const filePath = path.join(__dirname, '../uploads/assignments', attachment.filename)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      })
    }

    await Assignment.findByIdAndDelete(assignmentId)

    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    })
  } catch (error) {
    console.error('Delete assignment error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete assignment'
    })
  }
}

// Get assignment submissions
export const getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params
    const { page = 1, limit = 10, status } = req.query

    const filter = { assignmentId }
    if (status) filter.status = status

    const skip = (page - 1) * limit

    const submissions = await Submission.find(filter)
      .populate('studentId', 'name email')
      .populate('gradedBy', 'name email')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Submission.countDocuments(filter)

    // Get assignment details
    const assignment = await Assignment.findById(assignmentId).select('title maxScore')

    res.json({
      success: true,
      data: {
        submissions,
        assignment,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get assignment submissions error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions'
    })
  }
}