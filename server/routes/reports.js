import express from 'express'
import { auth } from '../middleware/auth.js'
import { generateAssignmentReport } from '../services/pdfService.js'

const router = express.Router()

// Generate PDF report for an assignment
router.get('/assignments/:assignmentId/pdf', auth, async (req, res) => {
  try {
    const { assignmentId } = req.params

    // Only teachers and admins can generate reports
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only teachers can generate assignment reports.'
      })
    }

    const report = await generateAssignmentReport(assignmentId, req.user._id)

    // Set headers for PDF download
    res.setHeader('Content-Type', report.contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${report.filename}"`)
    res.setHeader('Content-Length', report.buffer.length)

    // Send the PDF buffer
    res.send(report.buffer)
  } catch (error) {
    console.error('Error generating PDF report:', error)
    
    if (error.message === 'Assignment not found') {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      })
    }
    
    if (error.message === 'Unauthorized access to assignment') {
      return res.status(403).json({
        success: false,
        message: 'You can only generate reports for your own assignments'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF report'
    })
  }
})

export default router