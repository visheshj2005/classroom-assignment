import { S3Client, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import multer from 'multer'
import multerS3 from 'multer-s3'
import path from 'path'

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})

const bucketName = process.env.AWS_S3_BUCKET

// Check if S3 is configured
const isS3Configured = () => {
  return !!(process.env.AWS_ACCESS_KEY_ID && 
           process.env.AWS_SECRET_ACCESS_KEY && 
           process.env.AWS_S3_BUCKET)
}

// S3 upload configuration
const s3Storage = multerS3({
  s3: s3Client,
  bucket: bucketName,
  metadata: (req, file, cb) => {
    cb(null, {
      fieldName: file.fieldname,
      uploadedBy: req.user?._id?.toString() || 'anonymous',
      uploadedAt: new Date().toISOString()
    })
  },
  key: (req, file, cb) => {
    const { category = 'general' } = req.body
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    const key = `${category}/${file.fieldname}-${uniqueSuffix}${ext}`
    cb(null, key)
  }
})

// Local storage fallback (for development)
const localStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const { category = 'general' } = req.body
    const fs = await import('fs')
    const path = await import('path')
    const { fileURLToPath } = await import('url')
    
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const categoryDir = path.join(__dirname, '../uploads', category)
    
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

// Create multer upload instance
export const createUpload = () => {
  const storage = isS3Configured() ? s3Storage : localStorage
  
  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB max
      files: 5 // Max 5 files per request
    }
  })
}

// Generate signed URL for file access (S3 only)
export const getFileUrl = async (key, expiresIn = 3600) => {
  if (!isS3Configured()) {
    // For local storage, return the local path
    return `/api/uploads/files/${path.basename(key)}`
  }

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    })
    
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn })
    return signedUrl
  } catch (error) {
    console.error('Error generating signed URL:', error)
    throw error
  }
}

// Delete file from S3
export const deleteFile = async (key) => {
  if (!isS3Configured()) {
    // For local storage, delete from filesystem
    const fs = await import('fs')
    const filePath = key // Assuming key is the full path for local storage
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    return
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
    })
    
    await s3Client.send(command)
  } catch (error) {
    console.error('Error deleting file from S3:', error)
    throw error
  }
}

// Get file metadata
export const getFileMetadata = async (key) => {
  if (!isS3Configured()) {
    return null // Local storage doesn't support metadata retrieval
  }

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    })
    
    const response = await s3Client.send(command)
    return {
      size: response.ContentLength,
      lastModified: response.LastModified,
      contentType: response.ContentType,
      metadata: response.Metadata
    }
  } catch (error) {
    console.error('Error getting file metadata:', error)
    throw error
  }
}

export { s3Client, bucketName, isS3Configured }