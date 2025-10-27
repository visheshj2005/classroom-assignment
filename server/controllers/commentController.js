import { validationResult } from 'express-validator'
import Comment from '../models/Comment.js'
import Submission from '../models/Submission.js'

// Add comment to submission
export const addComment = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { submissionId } = req.params
    const { text, parentId } = req.body

    // Verify submission exists and user has access
    const submission = await Submission.findById(submissionId)
      .populate('assignmentId')
      .populate('studentId')

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      })
    }

    // Check if user can comment (student who submitted or teacher of the class)
    const isStudent = req.user.role === 'student' && submission.studentId._id.toString() === req.user._id.toString()
    const isTeacher = req.user.role === 'teacher' // Will be verified by middleware
    const isAdmin = req.user.role === 'admin'

    if (!isStudent && !isTeacher && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    const comment = new Comment({
      submissionId,
      authorId: req.user._id,
      text,
      parentId: parentId || null
    })

    await comment.save()
    await comment.populate('authorId', 'name email role')

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comment }
    })
  } catch (error) {
    console.error('Add comment error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error adding comment'
    })
  }
}

// Get comments for submission
export const getSubmissionComments = async (req, res) => {
  try {
    const { submissionId } = req.params
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'asc'
    } = req.query

    // Verify submission exists and user has access
    const submission = await Submission.findById(submissionId)
      .populate('assignmentId')
      .populate('studentId')

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      })
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1

    // Get top-level comments first
    const [comments, total] = await Promise.all([
      Comment.find({ submissionId, parentId: null })
        .populate('authorId', 'name email role')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Comment.countDocuments({ submissionId, parentId: null })
    ])

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentId: comment._id })
          .populate('authorId', 'name email role')
          .sort({ createdAt: 1 })

        return {
          ...comment.toObject(),
          replies
        }
      })
    )

    const totalPages = Math.ceil(total / parseInt(limit))

    res.json({
      success: true,
      data: {
        comments: commentsWithReplies,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalComments: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    })
  } catch (error) {
    console.error('Get submission comments error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching comments'
    })
  }
}

// Update comment
export const updateComment = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { commentId } = req.params
    const { text } = req.body

    const comment = await Comment.findById(commentId)

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      })
    }

    // Only author can edit their comment
    if (comment.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own comments'
      })
    }

    // Store edit history
    if (comment.text !== text) {
      comment.editHistory.push({
        text: comment.text,
        editedAt: new Date()
      })
      comment.isEdited = true
    }

    comment.text = text
    await comment.save()
    await comment.populate('authorId', 'name email role')

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: { comment }
    })
  } catch (error) {
    console.error('Update comment error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error updating comment'
    })
  }
}

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params

    const comment = await Comment.findById(commentId)

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      })
    }

    // Only author or admin can delete comment
    const canDelete = comment.authorId.toString() === req.user._id.toString() || req.user.role === 'admin'

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    // Delete replies first
    await Comment.deleteMany({ parentId: commentId })
    
    // Delete the comment
    await Comment.findByIdAndDelete(commentId)

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    })
  } catch (error) {
    console.error('Delete comment error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error deleting comment'
    })
  }
}