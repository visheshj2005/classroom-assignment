import Analytics from '../models/Analytics.js'
import User from '../models/User.js'
import Assignment from '../models/Assignment.js'
import Submission from '../models/Submission.js'
import Class from '../models/Class.js'
// Testing
class AnalyticsService {
  // Track user activity
  static async trackActivity(type, userId, entityId = null, entityType = null, metadata = {}) {
    try {
      const analyticsData = {
        type,
        userId,
        entityId,
        entityType,
        metadata: {
          ...metadata,
          timestamp: new Date()
        }
      }

      const analytics = new Analytics(analyticsData)
      await analytics.save()
      return analytics
    } catch (error) {
      console.error('Error tracking analytics:', error)
      // Don't throw error to avoid breaking main functionality
    }
  }

  // Track user login
  static async trackLogin(userId, metadata = {}) {
    return this.trackActivity('user_login', userId, null, null, metadata)
  }

  // Track user logout
  static async trackLogout(userId, metadata = {}) {
    return this.trackActivity('user_logout', userId, null, null, metadata)
  }

  // Track assignment creation
  static async trackAssignmentCreated(userId, assignmentId, metadata = {}) {
    return this.trackActivity('assignment_created', userId, assignmentId, 'Assignment', metadata)
  }

  // Track assignment submission
  static async trackAssignmentSubmitted(userId, submissionId, metadata = {}) {
    return this.trackActivity('assignment_submitted', userId, submissionId, 'Submission', metadata)
  }

  // Track assignment grading
  static async trackAssignmentGraded(userId, submissionId, metadata = {}) {
    return this.trackActivity('assignment_graded', userId, submissionId, 'Submission', metadata)
  }

  // Track class creation
  static async trackClassCreated(userId, classId, metadata = {}) {
    return this.trackActivity('class_created', userId, classId, 'Class', metadata)
  }

  // Track class joining
  static async trackClassJoined(userId, classId, metadata = {}) {
    return this.trackActivity('class_joined', userId, classId, 'Class', metadata)
  }

  // Track file upload
  static async trackFileUpload(userId, metadata = {}) {
    return this.trackActivity('file_uploaded', userId, null, null, metadata)
  }

  // Track page views
  static async trackPageView(userId, metadata = {}) {
    return this.trackActivity('page_view', userId, null, null, metadata)
  }

  // Track API calls
  static async trackApiCall(userId, metadata = {}) {
    return this.trackActivity('api_call', userId, null, null, metadata)
  }

  // Track errors
  static async trackError(userId, metadata = {}) {
    return this.trackActivity('error_occurred', userId, null, null, metadata)
  }

  // Get dashboard analytics
  static async getDashboardAnalytics(userId, role, timeframe = '7d') {
    try {
      const startDate = this.getStartDate(timeframe)
      
      const baseQuery = { timestamp: { $gte: startDate } }
      
      // Role-specific analytics
      if (role === 'admin') {
        return this.getAdminAnalytics(baseQuery)
      } else if (role === 'teacher') {
        return this.getTeacherAnalytics(userId, baseQuery)
      } else {
        return this.getStudentAnalytics(userId, baseQuery)
      }
    } catch (error) {
      console.error('Error getting dashboard analytics:', error)
      throw error
    }
  }

  // Admin analytics
  static async getAdminAnalytics(baseQuery) {
    const [
      totalUsers,
      totalClasses,
      totalAssignments,
      totalSubmissions,
      userActivity,
      popularPages,
      errorStats
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Class.countDocuments({ isActive: true }),
      Assignment.countDocuments({ status: { $ne: 'archived' } }),
      Submission.countDocuments(),
      this.getUserActivityStats(baseQuery),
      this.getPopularPages(baseQuery),
      this.getErrorStats(baseQuery)
    ])

    return {
      overview: {
        totalUsers,
        totalClasses,
        totalAssignments,
        totalSubmissions
      },
      userActivity,
      popularPages,
      errorStats
    }
  }

  // Teacher analytics
  static async getTeacherAnalytics(userId, baseQuery) {
    const teacherClasses = await Class.find({ teacherId: userId }).select('_id')
    const classIds = teacherClasses.map(c => c._id)

    const [
      totalClasses,
      totalAssignments,
      totalSubmissions,
      submissionStats,
      gradingStats
    ] = await Promise.all([
      Class.countDocuments({ teacherId: userId, isActive: true }),
      Assignment.countDocuments({ createdBy: userId, status: { $ne: 'archived' } }),
      Submission.countDocuments({ assignmentId: { $in: await Assignment.find({ createdBy: userId }).select('_id') } }),
      this.getSubmissionStats(userId, baseQuery),
      this.getGradingStats(userId, baseQuery)
    ])

    return {
      overview: {
        totalClasses,
        totalAssignments,
        totalSubmissions
      },
      submissionStats,
      gradingStats
    }
  }

  // Student analytics
  static async getStudentAnalytics(userId, baseQuery) {
    const studentClasses = await Class.find({ students: userId }).select('_id')
    const classIds = studentClasses.map(c => c._id)

    const [
      totalClasses,
      totalAssignments,
      totalSubmissions,
      gradeStats,
      submissionHistory
    ] = await Promise.all([
      Class.countDocuments({ students: userId, isActive: true }),
      Assignment.countDocuments({ classId: { $in: classIds }, status: 'active' }),
      Submission.countDocuments({ studentId: userId }),
      this.getStudentGradeStats(userId),
      this.getStudentSubmissionHistory(userId, baseQuery)
    ])

    return {
      overview: {
        totalClasses,
        totalAssignments,
        totalSubmissions
      },
      gradeStats,
      submissionHistory
    }
  }

  // Helper methods
  static getStartDate(timeframe) {
    const now = new Date()
    switch (timeframe) {
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000)
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }
  }

  static async getUserActivityStats(baseQuery) {
    return Analytics.aggregate([
      { $match: { ...baseQuery, type: { $in: ['user_login', 'user_logout'] } } },
      {
        $group: {
          _id: '$date',
          logins: { $sum: { $cond: [{ $eq: ['$type', 'user_login'] }, 1, 0] } },
          logouts: { $sum: { $cond: [{ $eq: ['$type', 'user_logout'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ])
  }

  static async getPopularPages(baseQuery) {
    return Analytics.aggregate([
      { $match: { ...baseQuery, type: 'page_view' } },
      {
        $group: {
          _id: '$metadata.path',
          views: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      { $addFields: { uniqueUserCount: { $size: '$uniqueUsers' } } },
      { $project: { uniqueUsers: 0 } },
      { $sort: { views: -1 } },
      { $limit: 10 }
    ])
  }

  static async getErrorStats(baseQuery) {
    return Analytics.aggregate([
      { $match: { ...baseQuery, type: 'error_occurred' } },
      {
        $group: {
          _id: '$metadata.statusCode',
          count: { $sum: 1 },
          lastOccurred: { $max: '$timestamp' }
        }
      },
      { $sort: { count: -1 } }
    ])
  }

  static async getSubmissionStats(userId, baseQuery) {
    const assignments = await Assignment.find({ createdBy: userId }).select('_id')
    const assignmentIds = assignments.map(a => a._id)

    return Analytics.aggregate([
      { 
        $match: { 
          ...baseQuery, 
          type: 'assignment_submitted',
          entityId: { $in: assignmentIds }
        } 
      },
      {
        $group: {
          _id: '$date',
          submissions: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])
  }

  static async getGradingStats(userId, baseQuery) {
    const assignments = await Assignment.find({ createdBy: userId }).select('_id')
    const assignmentIds = assignments.map(a => a._id)

    return Analytics.aggregate([
      { 
        $match: { 
          ...baseQuery, 
          type: 'assignment_graded',
          userId: userId
        } 
      },
      {
        $group: {
          _id: '$date',
          graded: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])
  }

  static async getStudentGradeStats(userId) {
    return Submission.aggregate([
      { $match: { studentId: userId, 'grade.score': { $exists: true } } },
      {
        $group: {
          _id: null,
          averageGrade: { $avg: '$grade.percentage' },
          totalGraded: { $sum: 1 },
          gradeDistribution: {
            $push: '$grade.letterGrade'
          }
        }
      }
    ])
  }

  static async getStudentSubmissionHistory(userId, baseQuery) {
    return Analytics.aggregate([
      { 
        $match: { 
          ...baseQuery, 
          type: 'assignment_submitted',
          userId: userId
        } 
      },
      {
        $group: {
          _id: '$date',
          submissions: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])
  }

  // Real-time analytics
  static async getRealtimeStats() {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    const [
      activeUsers,
      recentSubmissions,
      recentLogins,
      systemErrors
    ] = await Promise.all([
      Analytics.distinct('userId', { 
        type: 'page_view', 
        timestamp: { $gte: oneHourAgo } 
      }),
      Analytics.countDocuments({ 
        type: 'assignment_submitted', 
        timestamp: { $gte: oneHourAgo } 
      }),
      Analytics.countDocuments({ 
        type: 'user_login', 
        timestamp: { $gte: oneHourAgo } 
      }),
      Analytics.countDocuments({ 
        type: 'error_occurred', 
        timestamp: { $gte: oneHourAgo } 
      })
    ])

    return {
      activeUsers: activeUsers.length,
      recentSubmissions,
      recentLogins,
      systemErrors,
      timestamp: now
    }
  }
}

export default AnalyticsService