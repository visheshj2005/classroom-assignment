import express from 'express'
import {
  createAssignment,
  getClassAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  getAssignmentSubmissions
} from '../controllers/assignmentController.js'
import { authMiddleware, isTeacher, checkClassMembership, checkAssignmentAccess } from '../middleware/auth.js'
import {
  createAssignmentValidation,
  assignmentIdValidation,
  classIdValidation,
  paginationValidation
} from '../middleware/validation.js'

const router = express.Router()

// All routes require authentication
router.use(authMiddleware)

// Create assignment in class (Teacher)
router.post('/classes/:classId', [
  classIdValidation,
  checkClassMembership,
  isTeacher,
  createAssignmentValidation
], createAssignment)

// Get assignments for class
router.get('/classes/:classId', [
  classIdValidation,
  checkClassMembership,
  paginationValidation
], getClassAssignments)

// Get assignment by ID
router.get('/:assignmentId', [
  assignmentIdValidation,
  checkAssignmentAccess
], getAssignmentById)

// Update assignment (Teacher)
router.patch('/:assignmentId', [
  assignmentIdValidation,
  checkAssignmentAccess,
  isTeacher
], updateAssignment)

// Delete assignment (Teacher)
router.delete('/:assignmentId', [
  assignmentIdValidation,
  checkAssignmentAccess,
  isTeacher
], deleteAssignment)

// Get assignment submissions (Teacher)
router.get('/:assignmentId/submissions', [
  assignmentIdValidation,
  checkAssignmentAccess,
  isTeacher,
  paginationValidation
], getAssignmentSubmissions)

export default router