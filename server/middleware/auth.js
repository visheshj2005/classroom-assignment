import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// Verify JWT token
export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select('-passwordHash')
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. User not found.' 
      })
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account is deactivated.' 
      })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      })
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired.' 
      })
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication.' 
    })
  }
}

// Role-based access control
export const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required.' 
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Insufficient permissions.' 
      })
    }

    next()
  }
}

// Specific role checks
export const isAdmin = roleMiddleware('admin')
export const isTeacher = roleMiddleware('teacher', 'admin')
export const isStudent = roleMiddleware('student', 'teacher', 'admin')

// Class membership check
export const checkClassMembership = async (req, res, next) => {
  try {
    const { classId } = req.params
    const userId = req.user._id

    // Admin can access all classes
    if (req.user.role === 'admin') {
      return next()
    }

    const Class = (await import('../models/Class.js')).default
    const classDoc = await Class.findById(classId)

    if (!classDoc) {
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found.' 
      })
    }

    // Check if user is teacher of the class
    if (classDoc.teacherId.toString() === userId.toString()) {
      return next()
    }

    // Check if user is a member of the class
    const isMember = classDoc.students.some(
      student => student.toString() === userId.toString()
    )

    if (!isMember) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You are not a member of this class.' 
      })
    }

    next()
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error checking class membership.' 
    })
  }
}

// Assignment ownership check
export const checkAssignmentAccess = async (req, res, next) => {
  try {
    const { assignmentId } = req.params
    const userId = req.user._id

    // Admin can access all assignments
    if (req.user.role === 'admin') {
      return next()
    }

    const Assignment = (await import('../models/Assignment.js')).default
    const assignment = await Assignment.findById(assignmentId).populate('classId')

    if (!assignment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Assignment not found.' 
      })
    }

    // Check if user is teacher of the class
    if (assignment.classId.teacherId.toString() === userId.toString()) {
      return next()
    }

    // Check if user is a member of the class
    const isMember = assignment.classId.students.some(
      student => student.toString() === userId.toString()
    )

    if (!isMember) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You cannot access this assignment.' 
      })
    }

    next()
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error checking assignment access.' 
    })
  }
}