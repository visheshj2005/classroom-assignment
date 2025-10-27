import { validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'

// Get all users (Admin only) with pagination and search
export const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      q: searchQuery,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    // Build filter object
    const filter = {}
    if (role && ['student', 'teacher', 'admin'].includes(role)) {
      filter.role = role
    }
    if (searchQuery) {
      filter.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } }
      ]
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1

    // Execute queries
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-passwordHash')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter)
    ])

    const totalPages = Math.ceil(total / parseInt(limit))

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching users'
    })
  }
}

// Create user (Admin only)
export const createUser = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { name, email, password, role } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    // Create user
    const user = new User({
      name,
      email,
      passwordHash,
      role: role || 'student',
      isActive: true
    })

    await user.save()

    // Return user without password
    const userResponse = user.toObject()
    delete userResponse.passwordHash

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: userResponse
      }
    })
  } catch (error) {
    console.error('Create user error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error creating user'
    })
  }
}

// Get user by ID (Admin only)
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId).select('-passwordHash')
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      data: {
        user
      }
    })
  } catch (error) {
    console.error('Get user by ID error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching user'
    })
  }
}

// Update user role (Admin only)
export const updateUserRole = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { userId } = req.params
    const { role } = req.body

    // Prevent admin from changing their own role
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role'
      })
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-passwordHash')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        user
      }
    })
  } catch (error) {
    console.error('Update user role error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error updating user role'
    })
  }
}

// Deactivate/Activate user (Admin only)
export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params

    // Prevent admin from deactivating themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      })
    }

    const user = await User.findById(userId).select('-passwordHash')
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    user.isActive = !user.isActive
    await user.save()

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user
      }
    })
  } catch (error) {
    console.error('Toggle user status error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error updating user status'
    })
  }
}

// Delete user (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params

    // Prevent admin from deleting themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      })
    }

    const user = await User.findByIdAndDelete(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // TODO: Handle cleanup of related data (classes, assignments, submissions)

    res.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error deleting user'
    })
  }
}

// Get user statistics (Admin only)
export const getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ])

    const totalUsers = await User.countDocuments()
    const activeUsers = await User.countDocuments({ isActive: true })
    const inactiveUsers = totalUsers - activeUsers

    const roleStats = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count
      return acc
    }, {})

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        roleDistribution: {
          students: roleStats.student || 0,
          teachers: roleStats.teacher || 0,
          admins: roleStats.admin || 0
        }
      }
    })
  } catch (error) {
    console.error('Get user stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching user statistics'
    })
  }
}