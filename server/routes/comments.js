import express from 'express'
import Comment from '../models/Comment.js'
import { authMiddleware } from '../middleware/auth.js'
import { body, validationResult } from 'express-validator'

const router = express.Router()

// Get comments for an assignment
router.get('/assignment/:assignmentId', authMiddleware, async (req, res) => {
  try {
    const comments = await Comment.find({ 
      assignment: req.params.assignmentId 
    })
    .populate('author', 'name email')
    .sort({ createdAt: -1 })

    res.json({
      success: true,
      data: comments
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// Create a new comment
router.post('/', [
  authMiddleware,
  body('content').trim().isLength({ min: 1 }).withMessage('Comment content is required'),
  body('assignment').isMongoId().withMessage('Valid assignment ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { content, assignment } = req.body

    const comment = new Comment({
      content,
      assignment,
      author: req.user._id
    })

    await comment.save()
    await comment.populate('author', 'name email')

    res.status(201).json({
      success: true,
      data: comment
    })
  } catch (error) {
    console.error('Error creating comment:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// Update a comment
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body

    const comment = await Comment.findById(req.params.id)
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      })
    }

    // Check if user is the author
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment'
      })
    }

    comment.content = content
    await comment.save()
    await comment.populate('author', 'name email')

    res.json({
      success: true,
      data: comment
    })
  } catch (error) {
    console.error('Error updating comment:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// Delete a comment
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      })
    }

    // Check if user is the author or has admin/teacher role
    if (comment.author.toString() !== req.user._id.toString() && 
        !['admin', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      })
    }

    await Comment.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting comment:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

export default router