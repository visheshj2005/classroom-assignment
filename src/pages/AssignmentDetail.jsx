import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from '../components/Sidebar'
import {
  FileText,
  Calendar,
  Clock,
  User,
  Link as LinkIcon,
  Upload,
  MessageCircle,
  Send,
  Edit,
  Trash2,
  ArrowLeft,
  Download
} from 'lucide-react'

const AssignmentDetail = () => {
  const { assignmentId } = useParams()
  const navigate = useNavigate()
  const { user, api } = useAuth()
  const [assignment, setAssignment] = useState(null)
  const [submission, setSubmission] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [submissionLoading, setSubmissionLoading] = useState(false)
  const [showSubmissionForm, setShowSubmissionForm] = useState(false)
  const [submissionData, setSubmissionData] = useState({
    url: '',
    text: ''
  })
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState(null)

  useEffect(() => {
    fetchAssignmentDetails()
  }, [assignmentId])

  const fetchAssignmentDetails = async () => {
    try {
      setLoading(true)

      // Fetch assignment details
      const assignmentResponse = await api.get(`/assignments/${assignmentId}`)
      const assignmentData = assignmentResponse.data.data.assignment
      setAssignment(assignmentData)

      // If student, fetch their submission
      if (user.role === 'student' && assignmentData.mySubmission) {
        setSubmission(assignmentData.mySubmission)

        // Fetch comments for the submission
        if (assignmentData.mySubmission._id) {
          const commentsResponse = await api.get(`/comments/submissions/${assignmentData.mySubmission._id}`)
          setComments(commentsResponse.data.data.comments || [])
        }
      }
    } catch (error) {
      console.error('Error fetching assignment details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmissionSubmit = async (e) => {
    e.preventDefault()
    setSubmissionLoading(true)

    try {
      const response = await api.post(`/submissions/assignments/${assignmentId}`, {
        content: {
          url: submissionData.url,
          text: submissionData.text
        }
      })

      if (response.data.success) {
        setSubmission(response.data.data.submission)
        setShowSubmissionForm(false)
        setSubmissionData({ url: '', text: '' })
        fetchAssignmentDetails() // Refresh to get updated data
      }
    } catch (error) {
      console.error('Error submitting assignment:', error)
      alert(error.response?.data?.message || 'Failed to submit assignment')
    } finally {
      setSubmissionLoading(false)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !submission) return

    try {
      const response = await api.post(`/comments/submissions/${submission._id}`, {
        text: newComment,
        parentId: replyTo
      })

      if (response.data.success) {
        setNewComment('')
        setReplyTo(null)
        // Refresh comments
        const commentsResponse = await api.get(`/comments/submissions/${submission._id}`)
        setComments(commentsResponse.data.data.comments || [])
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const handleDownloadReport = async () => {
    try {
      const response = await api.get(`/reports/assignments/${assignmentId}/pdf`, {
        responseType: 'blob'
      })

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${assignment.title.replace(/[^a-zA-Z0-9]/g, '_')}_report.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading report:', error)
      alert('Failed to download report. Please try again.')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const isOverdue = assignment && new Date() > new Date(assignment.dueAt)
  const canSubmit = user?.role === 'student' && assignment && (!isOverdue || assignment.classId?.settings?.allowLateSubmissions)

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Assignment Not Found</h1>
              <button
                onClick={() => navigate(-1)}
                className="mt-4 text-indigo-600 hover:text-indigo-500"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 lg:ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
                <p className="text-sm text-gray-600">
                  {assignment.classId?.title} • Due {formatDate(assignment.dueAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user?.role === 'teacher' && (
                <button
                  onClick={handleDownloadReport}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </button>
              )}
              {isOverdue && (
                <span className="px-3 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full">
                  Overdue
                </span>
              )}
            </div>
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Assignment Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignment Details</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Description</h3>
                  <p className="mt-1 text-gray-900">{assignment.description}</p>
                </div>

                {assignment.instructions && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Instructions</h3>
                    <div className="mt-1 text-gray-900 whitespace-pre-wrap">
                      {assignment.instructions}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Due Date</h3>
                    <p className="mt-1 text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(assignment.dueAt)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Max Score</h3>
                    <p className="mt-1 text-gray-900">{assignment.maxScore} points</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Submission Section */}
            {user?.role === 'student' && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">My Submission</h2>
                  {submission && submission.status !== 'graded' && canSubmit && (
                    <button
                      onClick={() => setShowSubmissionForm(true)}
                      className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                      <Edit className="h-4 w-4 inline mr-1" />
                      Edit Submission
                    </button>
                  )}
                </div>

                {submission ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          Submitted {formatDate(submission.submittedAt)}
                        </p>
                        {submission.isLate && (
                          <span className="text-sm text-red-600">Late Submission</span>
                        )}
                      </div>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${submission.status === 'graded' ? 'bg-green-100 text-green-800' :
                          submission.status === 'late' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                        }`}>
                        {submission.status === 'graded' ? `Graded: ${submission.grade?.letterGrade || 'N/A'}` :
                          submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                      </span>
                    </div>

                    {submission.content?.url && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Submitted Link</h3>
                        <a
                          href={submission.content.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-indigo-600 hover:text-indigo-500"
                        >
                          <LinkIcon className="h-4 w-4 mr-2" />
                          {submission.content.url}
                        </a>
                      </div>
                    )}

                    {submission.content?.text && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Additional Notes</h3>
                        <p className="text-gray-900">{submission.content.text}</p>
                      </div>
                    )}

                    {submission.grade && (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Grade & Feedback</h3>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-semibold text-gray-900">
                            {submission.grade.score}/{submission.grade.maxScore} ({submission.grade.percentage}%)
                          </span>
                          <span className="text-lg font-semibold text-green-600">
                            {submission.grade.letterGrade}
                          </span>
                        </div>
                        {submission.feedback && (
                          <p className="text-gray-700">{submission.feedback}</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : canSubmit ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No submission yet</p>
                    <button
                      onClick={() => setShowSubmissionForm(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Submit Assignment
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <p className="text-red-600">Submission deadline has passed</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assignment Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Info</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Created by:</span>
                  <span className="ml-1 font-medium">{assignment.createdBy?.name}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Created:</span>
                  <span className="ml-1">{formatDate(assignment.createdAt)}</span>
                </div>
                <div className="flex items-center text-sm">
                  <FileText className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Type:</span>
                  <span className="ml-1">URL Submission</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Modal */}
      {showSubmissionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {submission ? 'Update Submission' : 'Submit Assignment'}
              </h3>

              <form onSubmit={handleSubmissionSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Submission URL *
                  </label>
                  <input
                    type="url"
                    value={submissionData.url}
                    onChange={(e) => setSubmissionData(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://github.com/username/repo or https://drive.google.com/..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Provide a link to your assignment (GitHub, Google Drive, etc.)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={submissionData.text}
                    onChange={(e) => setSubmissionData(prev => ({ ...prev, text: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    placeholder="Any additional information about your submission..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSubmissionForm(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submissionLoading}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {submissionLoading ? 'Submitting...' : (submission ? 'Update' : 'Submit')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AssignmentDetail