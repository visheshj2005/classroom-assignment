import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from '../components/Sidebar'
import CreateAssignmentModal from '../components/CreateAssignmentModal'
import { 
  BookOpen, 
  Users, 
  FileText, 
  Plus, 
  Calendar,
  Clock,
  ExternalLink,
  Eye,
  Edit,
  Settings,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

const ClassDetail = () => {
  const { classId } = useParams()
  const { user, api } = useAuth()
  const navigate = useNavigate()
  const [classData, setClassData] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeTab, setActiveTab] = useState('assignments')

  useEffect(() => {
    fetchClassData()
    fetchAssignments()
  }, [classId])

  const fetchClassData = async () => {
    try {
      const response = await api.get(`/classes/${classId}`)
      setClassData(response.data.data.class)
    } catch (error) {
      console.error('Error fetching class:', error)
      if (error.response?.status === 404) {
        navigate('/classes')
      }
    }
  }

  const fetchAssignments = async () => {
    try {
      const response = await api.get(`/assignments/classes/${classId}?limit=50`)
      setAssignments(response.data.data.assignments || [])
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignmentCreated = (newAssignment) => {
    setAssignments(prev => [newAssignment, ...prev])
    setShowCreateModal(false)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isOverdue = (dueDate) => {
    return new Date() > new Date(dueDate)
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

  if (!classData) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64 p-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">Class not found</h3>
          </div>
        </div>
      </div>
    )
  }

  const isTeacher = classData.teacherId._id === user._id || user.role === 'admin'

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 lg:ml-64 p-8">
      
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/classes')}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{classData.title}</h1>
                  <div className="flex items-center space-x-4 mt-1">
                    {classData.subject && (
                      <span className="text-sm text-indigo-600 font-medium">{classData.subject}</span>
                    )}
                    <span className="text-sm text-gray-600">Join Code: {classData.joinCode}</span>
                  </div>
                </div>
              </div>
              {isTeacher && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Assignment
                  </button>
                  <button
                    onClick={() => navigate(`/classes/${classId}/settings`)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-2xl font-semibold text-gray-900">{classData.students?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Assignments</p>
                <p className="text-2xl font-semibold text-gray-900">{assignments.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Created</p>
                <p className="text-2xl font-semibold text-gray-900">{formatDate(classData.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('assignments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'assignments'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Assignments ({assignments.length})
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'students'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Students ({classData.students?.length || 0})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'assignments' && (
              <div>
                {assignments.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
                    <p className="text-gray-600 mb-6">
                      Create your first assignment to get started.
                    </p>
                    {isTeacher && (
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Assignment
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignments.map((assignment) => (
                      <div key={assignment._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-lg font-medium text-gray-900">{assignment.title}</h3>
                              {assignment.dueAt && isOverdue(assignment.dueAt) && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Overdue
                                </span>
                              )}
                              {assignment.status === 'draft' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Draft
                                </span>
                              )}
                            </div>
                            {assignment.description && (
                              <p className="text-gray-600 text-sm mt-1">{assignment.description}</p>
                            )}
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              {assignment.dueAt && (
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  Due: {formatDateTime(assignment.dueAt)}
                                </div>
                              )}
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-1" />
                                Max Score: {assignment.maxScore}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => navigate(`/assignments/${assignment._id}`)}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </button>
                            {isTeacher && (
                              <button
                                onClick={() => navigate(`/assignments/${assignment._id}/manage`)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Manage
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'students' && (
              <div>
                {classData.students?.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No students enrolled</h3>
                    <p className="text-gray-600">
                      Share the join code <strong>{classData.joinCode}</strong> with students to get started.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classData.students.map((student) => (
                      <div key={student._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-600 font-medium text-sm">
                                {student.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{student.name}</h4>
                            <p className="text-sm text-gray-500">{student.email}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Assignment Modal */}
      <CreateAssignmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        classId={classId}
        onSuccess={handleAssignmentCreated}
      />
      </div>
    </div>
  )
}

export default ClassDetail