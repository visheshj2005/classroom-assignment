import express from 'express'
import {
  createClass,
  getTeacherClasses,
  getStudentClasses,
  getClass,
  joinClass,
  updateClass,
  deleteClass,
  removeStudent,
  getClassStats
} from '../controllers/classController.js'
import { authMiddleware } from '../middleware/auth.js'
import { 
  createClassValidation,
  joinClassValidation,
  classIdValidation
} from '../middleware/validation.js'
import { param } from 'express-validator'

const router = express.Router()

// All routes require authentication
router.use(authMiddleware)



// Create a new class (teachers only)
router.post('/', [
  (req, res, next) => {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can create classes'
      })
    }
    next()
  },
  createClassValidation
], createClass)

// Get classes for current user
router.get('/my-classes', (req, res, next) => {
  if (req.user.role === 'teacher' || req.user.role === 'admin') {
    return getTeacherClasses(req, res, next)
  } else {
    return getStudentClasses(req, res, next)
  }
})

// Join a class using join code (students only)
router.post('/join', [
  (req, res, next) => {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can join classes'
      })
    }
    next()
  },
  joinClassValidation
], joinClass)

// Get specific class
router.get('/:classId', classIdValidation, getClass)

// Update class (teachers only)
router.patch('/:classId', [
  classIdValidation,
  (req, res, next) => {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can update classes'
      })
    }
    next()
  },
  createClassValidation
], updateClass)

// Delete class (teachers only)
router.delete('/:classId', [
  classIdValidation,
  (req, res, next) => {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can delete classes'
      })
    }
    next()
  }
], deleteClass)

// Remove student from class (teachers only)
router.delete('/:classId/students/:studentId', [
  classIdValidation,
  param('studentId').isMongoId().withMessage('Invalid student ID'),
  (req, res, next) => {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can remove students'
      })
    }
    next()
  }
], removeStudent)

// Get class statistics
router.get('/:classId/stats', classIdValidation, getClassStats)

export default router