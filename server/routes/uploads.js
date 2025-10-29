import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { authMiddleware } from '../middleware/auth.js'
import { param } from 'express-validator'
import { handleValidationErrors } from '../middleware/validation.js'
import FileUpload from '../models/FileUpload.js'
// Analytics service removed for simplicity

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Simple memory storage for now (works on Vercel)
const storage = multer.memoryStorage()

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

  cb(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max for now
    files: 5 // Max 5 files per request
  }
})

// Upload files (simplified for now - stores in memory/database)
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
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = path.extname(file.originalname)
        const filename = `${file.fieldname}-${uniqueSuffix}${ext}`

        const fileUpload = new FileUpload({
          filename: filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: `memory://${filename}`, // Indicate it's in memory
          url: `/api/uploads/files/${filename}`,
          uploadedBy: userId,
          entityId: entityId || null,
          entityType: entityType || null,
          category: category || 'general',
          fileData: file.buffer.toString('base64') // Store file data as base64
        })

        await fileUpload.save()
        uploadedFiles.push({
          _id: fileUpload._id,
          filename: fileUpload.filename,
          originalName: fileUpload.originalName,
          mimetype: fileUpload.mimetype,
          size: fileUpload.size,
          url: fileUpload.url,
          category: fileUpload.category,
          createdAt: fileUpload.createdAt
        })

        // Track file upload (simplified for now)
        console.log(`File uploaded: ${file.originalname} (${file.size} bytes)`)
      }

      res.json({
        success: true,
        message: 'Files uploaded successfully',
        data: uploadedFiles
      })
    } catch (error) {
      console.error('Error uploading files:', error)
      
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

      // Increment download count
      await fileUpload.incrementDownload()

      if (fileUpload.fileData) {
        // File is stored in database as base64
        const fileBuffer = Buffer.from(fileUpload.fileData, 'base64')
        
        // Set appropriate headers
        res.setHeader('Content-Type', fileUpload.mimetype)
        res.setHeader('Content-Disposition', `inline; filename="${fileUpload.originalName}"`)
        res.setHeader('Content-Length', fileBuffer.length)
        
        // Send the file
        res.send(fileBuffer)
      } else {
        return res.status(404).json({
          success: false,
          message: 'File data not found'
        })
      }
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

      // Increment download count
      await fileUpload.incrementDownload()

      if (fileUpload.fileData) {
        // File is stored in database as base64
        const fileBuffer = Buffer.from(fileUpload.fileData, 'base64')
        
        // Force download
        res.setHeader('Content-Type', 'application/octet-stream')
        res.setHeader('Content-Disposition', `attachment; filename="${fileUpload.originalName}"`)
        res.setHeader('Content-Length', fileBuffer.length)
        
        // Send the file
        res.send(fileBuffer)
      } else {
        return res.status(404).json({
          success: false,
          message: 'File data not found'
        })
      }
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

      // Mark as deleted in database (soft delete)
      fileUpload.isDeleted = true
      fileUpload.deletedAt = new Date()
      fileUpload.fileData = null // Clear the file data to save space
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