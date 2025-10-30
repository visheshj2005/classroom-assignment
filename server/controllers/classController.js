import Class from '../models/Class.js'
import User from '../models/User.js'
import { validationResult } from 'express-validator'
import AnalyticsService from '../services/analyticsService.js'
import NotificationService from '../services/notificationService.js'

// Generate a random 6-character join code
const generateJoinCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// Create a new class
export const createClass = async (req, res) => {
  try {
    console.log('Creating class with user:', req.user)
    console.log('Request body:', req.body)
    
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array())
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { title, description, subject, settings } = req.body
    
    // Generate unique join code
    let joinCode
    let isUnique = false
    let attempts = 0
    while (!isUnique && attempts < 10) {
      joinCode = generateJoinCode()
      console.log('Generated join code:', joinCode)
      const existingClass = await Class.findOne({ joinCode })
      if (!existingClass) {
        isUnique = true
      }
      attempts++
    }

    if (!isUnique) {
      throw new Error('Could not generate unique join code')
    }

    const classData = {
      title,
      description: description || '',
      subject: subject || '',
      teacherId: req.user._id,
      createdBy: req.user._id,
      joinCode,
      settings: settings || {},
      students: [],
      isActive: true
    }
    
    console.log('Creating class with data:', classData)

    const newClass = new Class(classData)
    console.log('Class instance created, attempting to save...')
    await newClass.save()
    console.log('Class saved successfully!')
    
    console.log('Class saved successfully:', newClass._id)
    
    await newClass.populate('teacherId', 'name email')

    // Track class creation analytics (non-blocking)
    try {
      await AnalyticsService.trackClassCreated(req.user._id, newClass._id, {
        title: newClass.title,
        subject: newClass.subject
      })
    } catch (analyticsError) {
      console.error('Analytics tracking failed:', analyticsError)
      // Don't fail the main operation
    }

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: {
        class: newClass
      }
    })
  } catch (error) {
    console.error('Create class error:', error)
    console.error('Error stack:', error.stack)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create class',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

// Get all classes for a teacher
export const getTeacherClasses = async (req, res) => {
  try {
    const classes = await Class.find({ teacherId: req.user._id })
      .populate('teacherId', 'name email')
      .populate('students', 'name email')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      data: {
        classes
      }
    })
  } catch (error) {
    console.error('Get teacher classes error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch classes'
    })
  }
}

// Get all classes for a student
export const getStudentClasses = async (req, res) => {
  try {
    const classes = await Class.find({ students: req.user._id })
      .populate('teacherId', 'name email')
      .populate('students', 'name email')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      data: {
        classes
      }
    })
  } catch (error) {
    console.error('Get student classes error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch classes'
    })
  }
}

// Get a specific class
export const getClass = async (req, res) => {
  try {
    const { classId } = req.params
    
    const classData = await Class.findById(classId)
      .populate('teacherId', 'name email')
      .populate('students', 'name email')

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      })
    }

    // Check if user has access to this class
    const isTeacher = classData.teacherId._id.toString() === req.user._id.toString()
    const isStudent = classData.students.some(student => student._id.toString() === req.user._id.toString())
    const isAdmin = req.user.role === 'admin'

    if (!isTeacher && !isStudent && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    res.json({
      success: true,
      data: {
        class: classData
      }
    })
  } catch (error) {
    console.error('Get class error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class'
    })
  }
}

// Join a class using join code
export const joinClass = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { joinCode } = req.body
    
    const classData = await Class.findOne({ joinCode })
      .populate('teacherId', 'name email')

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Invalid join code'
      })
    }

    // Check if student is already enrolled
    if (classData.students.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this class'
      })
    }

    // Add student to class
    classData.students.push(req.user._id)
    await classData.save()

    await classData.populate('students', 'name email')

    // Track class joining analytics
    await AnalyticsService.trackClassJoined(req.user._id, classData._id, {
      className: classData.title,
      joinCode: joinCode
    })

    // Create notification for teacher
    await NotificationService.createNotification({
      userId: classData.teacherId._id,
      type: 'class_joined',
      title: 'New Student Joined',
      message: `${req.user.name} has joined your class "${classData.title}"`,
      data: {
        classId: classData._id,
        studentId: req.user._id,
        url: `/classes/${classData._id}`
      },
      priority: 'medium'
    })

    res.json({
      success: true,
      message: 'Successfully joined the class',
      data: {
        class: classData
      }
    })
  } catch (error) {
    console.error('Join class error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to join class'
    })
  }
}

// Update a class
export const updateClass = async (req, res) => {
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
    const { title, description, subject, settings } = req.body

    const classData = await Class.findById(classId)

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      })
    }

    // Check if user is the teacher of this class
    if (classData.teacherId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    // Update class
    classData.title = title || classData.title
    classData.description = description || classData.description
    classData.subject = subject || classData.subject
    classData.settings = { ...classData.settings, ...settings }

    await classData.save()
    await classData.populate('teacherId', 'name email')
    await classData.populate('students', 'name email')

    res.json({
      success: true,
      message: 'Class updated successfully',
      data: {
        class: classData
      }
    })
  } catch (error) {
    console.error('Update class error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update class'
    })
  }
}

// Delete a class
export const deleteClass = async (req, res) => {
  try {
    const { classId } = req.params

    const classData = await Class.findById(classId)

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      })
    }

    // Check if user is the teacher of this class
    if (classData.teacherId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    await Class.findByIdAndDelete(classId)

    res.json({
      success: true,
      message: 'Class deleted successfully'
    })
  } catch (error) {
    console.error('Delete class error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete class'
    })
  }
}

// Remove student from class
export const removeStudent = async (req, res) => {
  try {
    const { classId, studentId } = req.params

    const classData = await Class.findById(classId)

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      })
    }

    // Check if user is the teacher of this class
    if (classData.teacherId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    // Remove student from class
    classData.students = classData.students.filter(
      student => student.toString() !== studentId
    )

    await classData.save()
    await classData.populate('students', 'name email')

    res.json({
      success: true,
      message: 'Student removed from class',
      data: {
        class: classData
      }
    })
  } catch (error) {
    console.error('Remove student error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to remove student'
    })
  }
}

// Get class statistics
export const getClassStats = async (req, res) => {
  try {
    const { classId } = req.params

    const classData = await Class.findById(classId)
      .populate('students', 'name email')

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      })
    }

    // Check if user has access to this class
    const isTeacher = classData.teacherId.toString() === req.user._id.toString()
    const isStudent = classData.students.some(student => student._id.toString() === req.user._id.toString())
    const isAdmin = req.user.role === 'admin'

    if (!isTeacher && !isStudent && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    // Get assignments count for this class
    const Assignment = (await import('../models/Assignment.js')).default
    const assignmentsCount = await Assignment.countDocuments({ classId })

    // Get submissions count for this class
    const Submission = (await import('../models/Submission.js')).default
    const submissionsCount = await Submission.countDocuments({ 
      assignmentId: { $in: await Assignment.find({ classId }).select('_id') }
    })

    const stats = {
      studentsCount: classData.students.length,
      assignmentsCount,
      submissionsCount,
      createdAt: classData.createdAt
    }

    res.json({
      success: true,
      data: {
        stats
      }
    })
  } catch (error) {
    console.error('Get class stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class statistics'
    })
  }
}