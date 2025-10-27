import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/Navigation'
import CreateClassModal from '../components/CreateClassModal'
import { 
  BookOpen, 
  Plus, 
  Users, 
  FileText, 
  Calendar,
  Copy,
  Settings,
  Trash2,
  Eye,
  MoreVertical
} from 'lucide-react'

const ClassManagement = () => {
  const { user, api } = useAuth()
  const navigate = useNavigate()
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedClass, setSelectedClass] = useState(null)
  const [showDropdown, setShowDropdown] = useState(null)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const response = await api.get('/classes/my-classes')
      setClasses(response.data.data.classes || [])
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClassCreated = (newClass) => {
    setClasses(prev => [newClass, ...prev])
  }

  const handleCopyJoinCode = async (joinCode) => {
    try {
      await navigator.clipboard.writeText(joinCode)
      alert('Join code copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy join code:', error)
      alert('Failed to copy join code')
    }
  }

  const handleDeleteClass = async (classId) => {
    if (!confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      return
    }

    try {
      await api.delete(`/classes/${classId}`)
      setClasses(prev => prev.filter(cls => cls._id !== classId))
      setShowDropdown(null)
    } catch (error) {
      console.error('Error deleting class:', error)
      alert(error.response?.data?.message || 'Failed to delete class')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage your classes and share join codes with students
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Class
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {classes.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No classes yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first class to start managing assignments and students.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Class
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => (
              <div key={classItem._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {classItem.title}
                      </h3>
                      {classItem.subject && (
                        <p className="text-sm text-indigo-600 font-medium">
                          {classItem.subject}
                        </p>
                      )}
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setShowDropdown(showDropdown === classItem._id ? null : classItem._id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      {showDropdown === classItem._id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                          <div className="py-1">
                            <button
                              onClick={() => navigate(`/classes/${classItem._id}`)}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </button>
                            <button
                              onClick={() => navigate(`/classes/${classItem._id}/settings`)}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Settings
                            </button>
                            <button
                              onClick={() => handleDeleteClass(classItem._id)}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Class
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {classItem.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {classItem.description}
                    </p>
                  )}

                  <div className="space-y-3">
                    {/* Join Code */}
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                            Join Code
                          </p>
                          <p className="text-lg font-mono font-bold text-gray-900">
                            {classItem.joinCode}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCopyJoinCode(classItem.joinCode)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md"
                          title="Copy join code"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{classItem.students?.length || 0} students</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>0 assignments</span>
                      </div>
                    </div>

                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      Created {formatDate(classItem.createdAt)}
                    </div>
                  </div>

                  <div className="mt-6 flex space-x-2">
                    <button
                      onClick={() => navigate(`/classes/${classItem._id}`)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      View Class
                    </button>
                    <button
                      onClick={() => navigate(`/classes/${classItem._id}/assignments/new`)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      New Assignment
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Class Modal */}
      <CreateClassModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onClassCreated={handleClassCreated}
      />
    </div>
  )
}

export default ClassManagement