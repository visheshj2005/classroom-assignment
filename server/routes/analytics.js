import express from 'express'
import { authMiddleware, isAdmin, isTeacher } from '../middleware/auth.js'
import { query } from 'express-validator'
import { handleValidationErrors } from '../middleware/validation.js'
import AnalyticsService from '../services/analyticsService.js'

const router = express.Router()

// Get dashboard analytics
router.get('/dashboard',
  authMiddleware,
  [
    query('timeframe').optional().isIn(['24h', '7d', '30d', '90d']).withMessage('Invalid timeframe')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { timeframe = '7d' } = req.query
      const userId = req.user._id
      const role = req.user.role

      const analytics = await AnalyticsService.getDashboardAnalytics(userId, role, timeframe)

      res.json({
        success: true,
        data: analytics
      })
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to fetch analytics data'
      })
    }
  }
)

// Get real-time stats (admin and teachers only)
router.get('/realtime',
  authMiddleware,
  isTeacher,
  async (req, res) => {
    try {
      const stats = await AnalyticsService.getRealtimeStats()

      res.json({
        success: true,
        data: stats
      })
    } catch (error) {
      console.error('Error fetching realtime stats:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to fetch realtime statistics'
      })
    }
  }
)

// Track page view
router.post('/track/page-view',
  authMiddleware,
  async (req, res) => {
    try {
      const { path, duration } = req.body
      const userId = req.user._id
      const userAgent = req.get('User-Agent')
      const ipAddress = req.ip

      await AnalyticsService.trackPageView(userId, {
        path,
        duration,
        userAgent,
        ipAddress,
        method: req.method
      })

      res.json({
        success: true,
        message: 'Page view tracked'
      })
    } catch (error) {
      console.error('Error tracking page view:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to track page view'
      })
    }
  }
)

// Get user activity report (admin only)
router.get('/reports/user-activity',
  authMiddleware,
  isAdmin,
  [
    query('startDate').optional().isISO8601().withMessage('Invalid start date'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date'),
    query('userId').optional().isMongoId().withMessage('Invalid user ID')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { startDate, endDate, userId } = req.query
      
      let dateFilter = {}
      if (startDate) dateFilter.$gte = new Date(startDate)
      if (endDate) dateFilter.$lte = new Date(endDate)

      let matchFilter = {}
      if (Object.keys(dateFilter).length > 0) {
        matchFilter.timestamp = dateFilter
      }
      if (userId) matchFilter.userId = userId

      const Analytics = (await import('../models/Analytics.js')).default
      const report = await Analytics.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: {
              userId: '$userId',
              type: '$type',
              date: '$date'
            },
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id.userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $group: {
            _id: '$_id.userId',
            user: { $first: '$user' },
            activities: {
              $push: {
                type: '$_id.type',
                date: '$_id.date',
                count: '$count'
              }
            },
            totalActivities: { $sum: '$count' }
          }
        },
        {
          $sort: { totalActivities: -1 }
        }
      ])

      res.json({
        success: true,
        data: report
      })
    } catch (error) {
      console.error('Error generating user activity report:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to generate user activity report'
      })
    }
  }
)

// Get system performance metrics (admin only)
router.get('/reports/system-performance',
  authMiddleware,
  isAdmin,
  [
    query('timeframe').optional().isIn(['24h', '7d', '30d']).withMessage('Invalid timeframe')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { timeframe = '24h' } = req.query
      const startDate = AnalyticsService.getStartDate(timeframe)

      const Analytics = (await import('../models/Analytics.js')).default
      
      const [
        apiCalls,
        errors,
        pageViews,
        averageResponseTime
      ] = await Promise.all([
        Analytics.countDocuments({
          type: 'api_call',
          timestamp: { $gte: startDate }
        }),
        Analytics.countDocuments({
          type: 'error_occurred',
          timestamp: { $gte: startDate }
        }),
        Analytics.countDocuments({
          type: 'page_view',
          timestamp: { $gte: startDate }
        }),
        Analytics.aggregate([
          {
            $match: {
              type: 'api_call',
              timestamp: { $gte: startDate },
              'metadata.duration': { $exists: true }
            }
          },
          {
            $group: {
              _id: null,
              averageResponseTime: { $avg: '$metadata.duration' }
            }
          }
        ])
      ])

      res.json({
        success: true,
        data: {
          apiCalls,
          errors,
          pageViews,
          averageResponseTime: averageResponseTime[0]?.averageResponseTime || 0,
          errorRate: apiCalls > 0 ? (errors / apiCalls * 100).toFixed(2) : 0,
          timeframe
        }
      })
    } catch (error) {
      console.error('Error generating system performance report:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to generate system performance report'
      })
    }
  }
)

export default router