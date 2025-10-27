import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { authMiddleware } from '../middleware/auth.js'
import { param } from 'express-validator'
import { handleValidationErrors } from '../middleware/validation.js'
import FileUpload from '../models/FileUpload.js'
import AnalyticsService from '../services/analyticsService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { category = 'general' } = req.body
    const categoryDir = path.join(uploadsDir, category)
    
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true })
    }
    
    cb(null, categoryDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
  }
})

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'assignment_attachment': ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.png', '.zip'],
    'submission_file': ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.png', '.zip'],
    'comment_attachment': ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.png'],
    'profile_avatar': ['.jpg', '.jpeg', '.png', '.gif']
  }

  const category = req.body.category || 'general'
  const ext = path.extname(file.originalname).toLowerCase()
  
  if (allowedTypes[category] && !allowedTypes[category].includes(ext)) {
    return cb(new Error(`File type ${ext} not allowed for ${category}`), false)
  }

  // Check file size limits
  const sizeLimits = {
    'profile_avatar': 2 * 1024 * 1024, // 2MB
    'assignment_attachment': 50 * 1024 * 1024, // 50MB
    'submission_file': 50 * 1024 * 1024, // 50MB
    'comment_attachment': 10 * 1024 * 1024 // 10MB
  }

  const maxSize = sizeLimits[category] || 10 * 1024 * 1024
  if (file.size > maxSize) {
    return cb(new Error(`File size exceeds limit of ${maxSize / 1024 / 1024}MB`), false)
  }

  cb(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
    files: 5 // Max 5 files per request
  }
})

// Upload files
router.post('/',
  authMiddleware,
  upload.array('files', 5),
  async (req, res) => {
    try {
      const { category, entityId, entityType } = req.body
      const userId = req.user._id
      const files = req.files

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        })
      }

      const uploadedFiles = []

      for (const file of files) {
        const fileUpload = new FileUpload({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          url: `/api/uploads/files/${file.filename}`,
          uploadedBy: userId,
          entityId: entityId || null,
          entityType: entityType || null,
          category: category || 'general'
        })

        await fileUpload.save()
        uploadedFiles.push(fileUpload)

        // Track file upload
        await AnalyticsService.trackFileUpload(userId, {
          filename: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          category
        })
      }

      res.json({
        success: true,
        message: 'Files uploaded successfully',
        data: uploadedFiles
      })
    } catch (error) {
      console.error('Error uploading files:', error)
      
      // Clean up uploaded files on error
      if (req.files) {
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path)
          }
        })
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload files'
      })
    }
  }
)

// Get file by filename
router.get('/files/:filename',
  [
    param('filename').notEmpty().withMessage('Filename is required')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { filename } = req.params
      
      const fileUpload = await FileUpload.findOne({ filename })
      if (!fileUpload) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        })
      }

      const filePath = fileUpload.path
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'File not found on disk'
        })
      }

      // Increment download count
      await fileUpload.incrementDownload()

      // Set appropriate headers
      res.setHeader('Content-Type', fileUpload.mimetype)
      res.setHeader('Content-Disposition', `inline; filename="${fileUpload.originalName}"`)
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath)
      fileStream.pipe(res)
    } catch (error) {
      console.error('Error serving file:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to serve file'
      })
    }
  }
)

// Download file (forces download)
router.get('/download/:filename',
  authMiddleware,
  [
    param('filename').notEmpty().withMessage('Filename is required')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { filename } = req.params
      
      const fileUpload = await FileUpload.findOne({ filename })
      if (!fileUpload) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        })
      }

      const filePath = fileUpload.path
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'File not found on disk'
        })
      }

      // Increment download count
      await fileUpload.incrementDownload()

      // Force download
      res.setHeader('Content-Type', 'application/octet-stream')
      res.setHeader('Content-Disposition', `attachment; filename="${fileUpload.originalName}"`)
      
      const fileStream = fs.createReadStream(filePath)
      fileStream.pipe(res)
    } catch (error) {
      console.error('Error downloading file:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to download file'
      })
    }
  }
)

// Get file metadata
router.get('/metadata/:fileId',
  authMiddleware,
  [
    param('fileId').isMongoId().withMessage('Invalid file ID')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { fileId } = req.params
      
      const fileUpload = await FileUpload.findById(fileId)
        .populate('uploadedBy', 'name email')
      
      if (!fileUpload) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        })
      }

      res.json({
        success: true,
        data: fileUpload
      })
    } catch (error) {
      console.error('Error fetching file metadata:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to fetch file metadata'
      })
    }
  }
)

// Delete file
router.delete('/:fileId',
  authMiddleware,
  [
    param('fileId').isMongoId().withMessage('Invalid file ID')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { fileId } = req.params
      const userId = req.user._id
      
      const fileUpload = await FileUpload.findById(fileId)
      if (!fileUpload) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        })
      }

      // Check if user can delete this file
      if (fileUpload.uploadedBy.toString() !== userId.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own files'
        })
      }

      // Delete file from disk
      if (fs.existsSync(fileUpload.path)) {
        fs.unlinkSync(fileUpload.path)
      }

      // Mark as deleted in database (soft delete)
      fileUpload.isDeleted = true
      fileUpload.deletedAt = new Date()
      await fileUpload.save()

      res.json({
        success: true,
        message: 'File deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting file:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to delete file'
      })
    }
  }
)

// Get user's uploaded files
router.get('/my-files',
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user._id
      const { page = 1, limit = 20, category } = req.query

      let filter = { uploadedBy: userId, isDeleted: false }
      if (category) filter.category = category

      const files = await FileUpload.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))

      const total = await FileUpload.countDocuments(filter)

      res.json({
        success: true,
        data: {
          files,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      })
    } catch (error) {
      console.error('Error fetching user files:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to fetch files'
      })
    }
  }
)

export default router