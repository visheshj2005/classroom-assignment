import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from '../components/Sidebar'
import GradeSubmissionModal from '../components/GradeSubmissionModal'
import {
  FileText,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  ArrowLeft
} from 'lucide-react'

const AssignmentManagement = () => {
  const { assignmentId } = useParams()
  const navigate = useNavigate()
  const { api } = useAuth()
  const [assignment, setAssignment] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    graded: 0,
    pending: 0
  })
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [showGradeModal, setShowGradeModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAssignmentData()
  }, [assignmentId])

  const fetchAssignmentData = async () => {
    try {
      setLoading(true)
      
      // Fetch assignment details
      const assignmentResponse = await api.get(`/assignments/${assignmentId}`)
      setAssignment(assignmentResponse.data.data.assignment)

      // Fetch submissions
      const submissionsResponse = await api.get(`/assignments/${assignmentId}/submissions?limit=100`)
      const submissionsData = submissionsResponse.data.data.submissions || []
      setSubmissions(submissionsData)

      // Calculate stats
      const submitted = submissionsData.length
      const graded = submissionsData.filter(s => s.status === 'graded').length
      const pending = submitted - graded

      // Get class details to get total student count
      let totalStudents = 0
      try {
        const classResponse = await api.get(`/classes/${assignmentResponse.data.data.assignment.classId}`)
        totalStudents = classResponse.data.data.class.students?.length || 0
      } catch (error) {
        console.error('Error fetching class details:', error)
      }

      setStats({
        total: totalStudents,
        submitted,
        graded,
        pending
      })

    } catch (error) {
      console.error('Error fetching assignment data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGradeSubmission = (submission) => {
    setSelectedSubmission(submission)
    setShowGradeModal(true)
  }

  const handleGradeSuccess = (updatedSubmission) => {
    setSubmissions(prev => 
      prev.map(s => s._id === updatedSubmission._id ? updatedSubmission : s)
    )
    setStats(prev => ({
      ...prev,
      graded: prev.graded + (updatedSubmission.status === 'graded' ? 1 : 0),
      pending: prev.pending - (updatedSubmission.status === 'graded' ? 1 : 0)
    }))
  }

  const getSubmissionStatus = (submission) => {
    if (submission.status === 'graded') {
      return {
        text: 'Graded',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle
      }
    }
    return {
      text: 'Pending',
      color: 'bg-yellow-100 text-yellow-800',
      icon: Clock
    }
  }

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
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Assignment not found</p>
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
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {assignment.title}
                </h1>
                <p className="text-sm text-gray-600">
                  {assignment.classId?.title || 'Class'} • Due: {assignment.dueAt ? new Date(assignment.dueAt).toLocaleDateString() : 'No due date'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Submitted</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.submitted}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Graded</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.graded}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Submissions ({submissions.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((submission) => {
                  const statusInfo = getSubmissionStatus(submission)
                  const StatusIcon = statusInfo.icon

                  return (
                    <tr key={submission._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {submission.studentId?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {submission.studentId?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(submission.submittedAt).toLocaleTimeString()}
                        </div>
                        {submission.isLate && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                            Late
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {submission.grade ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {submission.grade.letterGrade} ({submission.grade.percentage}%)
                            </div>
                            <div className="text-sm text-gray-500">
                              {submission.grade.score}/{submission.grade.maxScore}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Not graded</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <a
                            href={submission.content?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View submission"
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => handleGradeSubmission(submission)}
                            className="text-green-600 hover:text-green-900"
                            title="Grade submission"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {submissions.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No submissions yet</p>
                <p className="text-sm text-gray-400">Submissions will appear here when students submit their work</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grade Submission Modal */}
      <GradeSubmissionModal
        isOpen={showGradeModal}
        onClose={() => setShowGradeModal(false)}
        submission={selectedSubmission}
        onSuccess={handleGradeSuccess}
      />
      </div>
    </div>
  )
}

export default AssignmentManagement