import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { query, param } from 'express-validator'
import { handleValidationErrors } from '../middleware/validation.js'
import NotificationService from '../services/notificationService.js'
import Notification from '../models/Notification.js'

const router = express.Router()

// Get user notifications
router.get('/', 
  authMiddleware,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('type').optional().isIn([
      'assignment_created', 'assignment_due_soon', 'assignment_overdue',
      'submission_graded', 'submission_returned', 'class_announcement',
      'class_joined', 'grade_updated', 'comment_added', 'system_maintenance'
    ]).withMessage('Invalid notification type'),
    query('unreadOnly').optional().isBoolean().withMessage('unreadOnly must be boolean')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { page = 1, limit = 20, type, unreadOnly } = req.query
      const userId = req.user._id

      let filter = { userId }
      if (type) filter.type = type
      if (unreadOnly === 'true') filter.isRead = false

      const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('data.assignmentId', 'title dueAt')
        .populate('data.classId', 'title')

      const total = await Notification.countDocuments(filter)
      const unreadCount = await Notification.countDocuments({ userId, isRead: false })

      res.json({
        success: true,
        data: {
          notifications,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          },
          unreadCount
        }
      })
    } catch (error) {
      console.error('Error fetching notifications:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications'
      })
    }
  }
)

// Mark notification as read
router.patch('/:notificationId/read',
  authMiddleware,
  [
    param('notificationId').isMongoId().withMessage('Invalid notification ID')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { notificationId } = req.params
      const userId = req.user._id

      await NotificationService.markAsRead(notificationId, userId)

      res.json({
        success: true,
        message: 'Notification marked as read'
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read'
      })
    }
  }
)

// Mark all notifications as read
router.patch('/mark-all-read',
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user._id
      await NotificationService.markAllAsRead(userId)

      res.json({
        success: true,
        message: 'All notifications marked as read'
      })
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to mark all notifications as read'
      })
    }
  }
)

// Delete notification
router.delete('/:notificationId',
  authMiddleware,
  [
    param('notificationId').isMongoId().withMessage('Invalid notification ID')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { notificationId } = req.params
      const userId = req.user._id

      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        userId
      })

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        })
      }

      res.json({
        success: true,
        message: 'Notification deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting notification:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to delete notification'
      })
    }
  }
)

// Get notification settings (for future implementation)
router.get('/settings',
  authMiddleware,
  async (req, res) => {
    try {
      // This would typically come from a user settings model
      const defaultSettings = {
        emailNotifications: true,
        pushNotifications: true,
        assignmentReminders: true,
        gradeNotifications: true,
        classAnnouncements: true,
        reminderTiming: 24 // hours before due date
      }

      res.json({
        success: true,
        data: defaultSettings
      })
    } catch (error) {
      console.error('Error fetching notification settings:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notification settings'
      })
    }
  }
)

export default router