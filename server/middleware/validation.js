import { body, param, query, validationResult } from 'express-validator'

// Auth validation rules
export const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['student', 'teacher', 'admin'])
    .withMessage('Role must be student, teacher, or admin')
]

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
]

export const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('profile.bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('profile.phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('profile.department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department cannot exceed 100 characters')
]

export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
]

// User management validation rules
export const updateUserRoleValidation = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('role')
    .isIn(['student', 'teacher', 'admin'])
    .withMessage('Role must be student, teacher, or admin')
]

export const userIdValidation = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID')
]

// Query validation rules
export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn(['name', 'email', 'role', 'createdAt', 'lastLogin'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
]

// Class validation rules
export const createClassValidation = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Class title must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('subject')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Subject cannot exceed 50 characters')
]

export const classIdValidation = [
  param('classId')
    .isMongoId()
    .withMessage('Invalid class ID')
]

// Assignment validation rules
export const createAssignmentValidation = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Assignment title must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('instructions')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Instructions cannot exceed 5000 characters'),
  body('dueAt')
    .optional()
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (value && new Date(value) <= new Date()) {
        throw new Error('Due date must be in the future')
      }
      return true
    }),
  body('maxScore')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max score must be at least 1'),
  body('submissionType')
    .optional()
    .isIn(['file', 'link', 'both'])
    .withMessage('Submission type must be file, link, or both')
]

export const assignmentIdValidation = [
  param('assignmentId')
    .isMongoId()
    .withMessage('Invalid assignment ID')
]

// Submission validation rules
export const createSubmissionValidation = [
  body('submissionType')
    .isIn(['file', 'link'])
    .withMessage('Submission type must be file or link'),
  body('content.url')
    .if(body('submissionType').equals('link'))
    .isURL()
    .withMessage('Please provide a valid URL'),
  body('content.text')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Text content cannot exceed 1000 characters')
]

export const gradeSubmissionValidation = [
  body('score')
    .isNumeric()
    .withMessage('Score must be a number'),
  body('maxScore')
    .isInt({ min: 1 })
    .withMessage('Max score must be at least 1'),
  body('feedback')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Feedback cannot exceed 2000 characters')
]

export const submissionIdValidation = [
  param('submissionId')
    .isMongoId()
    .withMessage('Invalid submission ID')
]

// Join class validation
export const joinClassValidation = [
  body('joinCode')
    .isLength({ min: 6, max: 6 })
    .withMessage('Join code must be exactly 6 characters')
    .isAlphanumeric()
    .withMessage('Join code must contain only letters and numbers')
    .toUpperCase()
]

// Validation error handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    })
  }
  
  next()
}