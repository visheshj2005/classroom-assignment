import { validationResult } from 'express-validator'
import Assignment from '../models/Assignment.js'
import Class from '../models/Class.js'
import Submission from '../models/Submission.js'
import AnalyticsService from '../services/analyticsService.js'
import NotificationService from '../services/notificationService.js'

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
      maxScore
    } = req.body

    const assignment = new Assignment({
      classId,
      title,
      description,
      instructions,
      dueAt: dueAt ? new Date(dueAt) : null,
      maxScore: maxScore || 100,
      submissionType: 'link',
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

    // If user is a student, get their submissions for these assignments
    let assignmentsWithSubmissions = assignments
    if (req.user.role === 'student') {
      const assignmentIds = assignments.map(a => a._id)
      const submissions = await Submission.find({
        assignmentId: { $in: assignmentIds },
        studentId: req.user._id
      })

      // Create a map of submissions by assignment ID
      const submissionMap = {}
      submissions.forEach(sub => {
        submissionMap[sub.assignmentId.toString()] = sub
      })

      // Add mySubmission to each assignment
      assignmentsWithSubmissions = assignments.map(assignment => {
        const assignmentData = assignment.toObject()
        const submission = submissionMap[assignment._id.toString()]
        if (submission) {
          assignmentData.mySubmission = submission
        }
        return assignmentData
      })
    }

    res.json({
      success: true,
      data: {
        assignments: assignmentsWithSubmissions,
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
    let mySubmission = null
    if (req.user.role === 'student') {
      mySubmission = await Submission.findOne({
        assignmentId: assignment._id,
        studentId: req.user._id
      })
    }

    // Add mySubmission to assignment object for easier access in frontend
    const assignmentData = assignment.toObject()
    if (mySubmission) {
      assignmentData.mySubmission = mySubmission
    }

    res.json({
      success: true,
      data: {
        assignment: assignmentData
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