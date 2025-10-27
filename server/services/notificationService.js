import Notification from '../models/Notification.js'
import User from '../models/User.js'
import Assignment from '../models/Assignment.js'

class NotificationService {
  static async createNotification(data) {
    try {
      const notification = new Notification(data)
      await notification.save()
      return notification
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  static async notifyAssignmentCreated(assignmentId, classId) {
    try {
      const assignment = await Assignment.findById(assignmentId).populate('classId')
      if (!assignment) return

      const students = assignment.classId.students
      
      const notifications = students.map(studentId => ({
        userId: studentId,
        type: 'assignment_created',
        title: 'New Assignment Posted',
        message: `New assignment "${assignment.title}" has been posted in ${assignment.classId.title}`,
        data: {
          assignmentId,
          classId,
          url: `/assignments/${assignmentId}`
        },
        priority: 'medium'
      }))

      await Notification.insertMany(notifications)
    } catch (error) {
      console.error('Error notifying assignment created:', error)
    }
  }

  static async notifyAssignmentDueSoon(assignmentId) {
    try {
      const assignment = await Assignment.findById(assignmentId).populate('classId')
      if (!assignment) return

      const students = assignment.classId.students
      
      const notifications = students.map(studentId => ({
        userId: studentId,
        type: 'assignment_due_soon',
        title: 'Assignment Due Soon',
        message: `Assignment "${assignment.title}" is due soon in ${assignment.classId.title}`,
        data: {
          assignmentId,
          classId: assignment.classId._id,
          url: `/assignments/${assignmentId}`
        },
        priority: 'high'
      }))

      await Notification.insertMany(notifications)
    } catch (error) {
      console.error('Error notifying assignment due soon:', error)
    }
  }

  static async notifySubmissionGraded(submissionId, studentId, assignmentId) {
    try {
      const assignment = await Assignment.findById(assignmentId)
      if (!assignment) return

      await this.createNotification({
        userId: studentId,
        type: 'submission_graded',
        title: 'Assignment Graded',
        message: `Your submission for "${assignment.title}" has been graded`,
        data: {
          submissionId,
          assignmentId,
          url: `/assignments/${assignmentId}/submission`
        },
        priority: 'medium'
      })
    } catch (error) {
      console.error('Error notifying submission graded:', error)
    }
  }

  static async getUserNotifications(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit
      
      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('data.assignmentId', 'title')
        .populate('data.classId', 'title')

      const total = await Notification.countDocuments({ userId })
      const unreadCount = await Notification.countDocuments({ userId, isRead: false })

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        unreadCount
      }
    } catch (error) {
      console.error('Error getting user notifications:', error)
      throw error
    }
  }

  static async markAsRead(notificationId, userId) {
    try {
      await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true, readAt: new Date() }
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }

  static async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true, readAt: new Date() }
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      throw error
    }
  }
}

export default NotificationService