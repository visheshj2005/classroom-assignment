import express from 'express'
import {
  createSubmission,
  getMySubmissions,
  getSubmissionById,
  gradeSubmission,
  deleteSubmission,
  getGradeDistribution
} from '../controllers/submissionController.js'
import { authMiddleware, isTeacher, checkAssignmentAccess } from '../middleware/auth.js'
import {
  createSubmissionValidation,
  gradeSubmissionValidation,
  submissionIdValidation,
  assignmentIdValidation,
  paginationValidation
} from '../middleware/validation.js'

const router = express.Router()

// All routes require authentication
router.use(authMiddleware)

// Create/Update submission (Student)
router.post('/assignments/:assignmentId', [
  assignmentIdValidation,
  checkAssignmentAccess,
  createSubmissionValidation
], createSubmission)

// Get my submissions (Student)
router.get('/me', paginationValidation, getMySubmissions)

// Get submission by ID
router.get('/:submissionId', submissionIdValidation, getSubmissionById)

// Grade submission (Teacher)
router.patch('/:submissionId/grade', [
  submissionIdValidation,
  isTeacher,
  gradeSubmissionValidation
], gradeSubmission)

// Delete submission (Student)
router.delete('/:submissionId', submissionIdValidation, deleteSubmission)

// Get grade distribution for assignment (Teacher)
router.get('/assignments/:assignmentId/distribution', [
  assignmentIdValidation,
  checkAssignmentAccess,
  isTeacher
], getGradeDistribution)

export default router