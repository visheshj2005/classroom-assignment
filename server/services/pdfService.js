import puppeteer from 'puppeteer'
import Assignment from '../models/Assignment.js'
import Submission from '../models/Submission.js'

export const generateAssignmentReport = async (assignmentId, teacherId) => {
  try {
    // Fetch assignment with submissions
    const assignment = await Assignment.findById(assignmentId)
      .populate('classId', 'title')
      .populate('createdBy', 'name')

    if (!assignment) {
      throw new Error('Assignment not found')
    }

    // Check if the teacher owns this assignment
    if (assignment.createdBy._id.toString() !== teacherId.toString()) {
      throw new Error('Unauthorized access to assignment')
    }

    // Fetch all submissions for this assignment
    const submissions = await Submission.find({ assignmentId })
      .populate('studentId', 'name email')
      .sort({ submittedAt: -1 })

    // Generate HTML content for PDF
    const htmlContent = generateReportHTML(assignment, submissions)

    // Launch puppeteer and generate PDF
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    })

    await browser.close()

    return {
      buffer: pdfBuffer,
      filename: `${assignment.title.replace(/[^a-zA-Z0-9]/g, '_')}_report.pdf`,
      contentType: 'application/pdf'
    }
  } catch (error) {
    console.error('Error generating PDF report:', error)
    throw error
  }
}

const generateReportHTML = (assignment, submissions) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const submissionRows = submissions.map((submission, index) => {
    const submissionLink = submission.content?.url || 'No link provided'
    const additionalInfo = submission.content?.text || 'No additional information'
    const status = submission.status || 'submitted'
    const grade = submission.grade ? `${submission.grade.score}/${submission.grade.maxScore} (${submission.grade.letterGrade})` : 'Not graded'

    return `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px; text-align: center;">${index + 1}</td>
        <td style="padding: 12px;">${submission.studentId?.name || 'Unknown Student'}</td>
        <td style="padding: 12px; word-break: break-all; max-width: 200px;">${submissionLink}</td>
        <td style="padding: 12px; max-width: 250px;">${additionalInfo}</td>
        <td style="padding: 12px; text-align: center;">${formatDate(submission.submittedAt)}</td>
        <td style="padding: 12px; text-align: center;">
          <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; 
                       background-color: ${status === 'graded' ? '#dcfce7' : '#fef3c7'}; 
                       color: ${status === 'graded' ? '#166534' : '#92400e'};">
            ${status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </td>
        <td style="padding: 12px; text-align: center;">${grade}</td>
      </tr>
    `
  }).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Assignment Report - ${assignment.title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 20px;
          color: #374151;
          line-height: 1.6;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e7eb;
        }
        .header h1 {
          color: #1f2937;
          margin: 0 0 10px 0;
          font-size: 28px;
        }
        .header h2 {
          color: #6b7280;
          margin: 0;
          font-weight: normal;
          font-size: 18px;
        }
        .info-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          background-color: #f9fafb;
          padding: 20px;
          border-radius: 8px;
        }
        .info-item {
          text-align: center;
        }
        .info-label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
        }
        .info-value {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }
        .summary {
          margin-bottom: 30px;
        }
        .summary h3 {
          color: #1f2937;
          margin-bottom: 15px;
          font-size: 20px;
        }
        .stats {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }
        .stat-card {
          background-color: #f3f4f6;
          padding: 15px;
          border-radius: 6px;
          text-align: center;
          flex: 1;
        }
        .stat-number {
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 5px;
        }
        .stat-label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          background-color: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        th {
          background-color: #f9fafb;
          padding: 15px 12px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
          border-bottom: 1px solid #e5e7eb;
        }
        td {
          font-size: 13px;
          color: #4b5563;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #9ca3af;
          font-size: 12px;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }
        @media print {
          body { margin: 0; }
          .info-section { display: block; }
          .stats { display: block; }
          .stat-card { margin-bottom: 10px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Assignment Report</h1>
        <h2>${assignment.title}</h2>
      </div>

      <div class="info-section">
        <div class="info-item">
          <div class="info-label">Class</div>
          <div class="info-value">${assignment.classId?.title || 'Unknown Class'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Created By</div>
          <div class="info-value">${assignment.createdBy?.name || 'Unknown Teacher'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Due Date</div>
          <div class="info-value">${formatDate(assignment.dueAt)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Max Score</div>
          <div class="info-value">${assignment.maxScore} points</div>
        </div>
      </div>

      <div class="summary">
        <h3>Summary</h3>
        <div class="stats">
          <div class="stat-card">
            <div class="stat-number">${submissions.length}</div>
            <div class="stat-label">Total Submissions</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${submissions.filter(s => s.grade).length}</div>
            <div class="stat-label">Graded</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${submissions.filter(s => s.isLate).length}</div>
            <div class="stat-label">Late Submissions</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${submissions.filter(s => !s.grade).length}</div>
            <div class="stat-label">Pending Review</div>
          </div>
        </div>
      </div>

      <h3>Submission Details</h3>
      <table>
        <thead>
          <tr>
            <th style="width: 60px;">S.No.</th>
            <th style="width: 150px;">Submitted By</th>
            <th style="width: 200px;">Submission Link</th>
            <th style="width: 250px;">Additional Information</th>
            <th style="width: 120px;">Submitted At</th>
            <th style="width: 80px;">Status</th>
            <th style="width: 100px;">Grade</th>
          </tr>
        </thead>
        <tbody>
          ${submissionRows || '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #9ca3af;">No submissions found</td></tr>'}
        </tbody>
      </table>

      <div class="footer">
        <p>Report generated on ${formatDate(new Date())}</p>
        <p>Classroom Assignment Portal - Assignment Management System</p>
      </div>
    </body>
    </html>
  `
}