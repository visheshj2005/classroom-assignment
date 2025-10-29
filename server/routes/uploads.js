import express from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { authMiddleware } from '../middleware/auth.js'
import { param } from 'express-validator'
import { handleValidationErrors } from '../middleware/validation.js'
import FileUpload from '../models/FileUpload.js'
import AnalyticsService from '../services/analyticsService.js'
import { createUpload, getFileUrl, deleteFile, isS3Configured } from '../services/s3Service.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Create upload instance (S3 or local based on configuration)
const upload = createUpload()

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
        // For S3, use the key; for local, use the path
        const filePath = isS3Configured() ? file.key : file.path
        const fileUrl = isS3Configured() ? 
          await getFileUrl(file.key) : 
          `/api/uploads/files/${file.filename}`

        const fileUpload = new FileUpload({
          filename: file.filename || path.basename(file.key),
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: filePath,
          url: fileUrl,
          uploadedBy: userId,
          entityId: entityId || null,
          entityType: entityType || null,
          category: category || 'general',
          isS3: isS3Configured(),
          s3Key: isS3Configured() ? file.key : null
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
      
      // Clean up uploaded files on error (local storage only)
      if (req.files && !isS3Configured()) {
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

      // Increment download count
      await fileUpload.incrementDownload()

      if (fileUpload.isS3 && fileUpload.s3Key) {
        // For S3 files, redirect to signed URL
        const signedUrl = await getFileUrl(fileUpload.s3Key)
        res.redirect(signedUrl)
      } else {
        // For local files, stream directly
        const filePath = fileUpload.path
        if (!fs.existsSync(filePath)) {
          return res.status(404).json({
            success: false,
            message: 'File not found on disk'
          })
        }

        // Set appropriate headers
        res.setHeader('Content-Type', fileUpload.mimetype)
        res.setHeader('Content-Disposition', `inline; filename="${fileUpload.originalName}"`)
        
        // Stream the file
        const fileStream = fs.createReadStream(filePath)
        fileStream.pipe(res)
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

      if (fileUpload.isS3 && fileUpload.s3Key) {
        // For S3 files, generate signed URL with download disposition
        const signedUrl = await getFileUrl(fileUpload.s3Key)
        res.redirect(signedUrl)
      } else {
        // For local files, stream with download headers
        const filePath = fileUpload.path
        if (!fs.existsSync(filePath)) {
          return res.status(404).json({
            success: false,
            message: 'File not found on disk'
          })
        }

        // Force download
        res.setHeader('Content-Type', 'application/octet-stream')
        res.setHeader('Content-Disposition', `attachment; filename="${fileUpload.originalName}"`)
        
        const fileStream = fs.createReadStream(filePath)
        fileStream.pipe(res)
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

      // Delete file from storage
      if (fileUpload.isS3 && fileUpload.s3Key) {
        await deleteFile(fileUpload.s3Key)
      } else if (fileUpload.path && fs.existsSync(fileUpload.path)) {
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