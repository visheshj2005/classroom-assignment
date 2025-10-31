import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { BookOpen, Users, FileText, Plus, Calendar, User } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import JoinClassModal from '../components/JoinClassModal'

const StudentClasses = () => {
  const { api } = useAuth()
  const navigate = useNavigate()
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showJoinModal, setShowJoinModal] = useState(false)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const response = await api.get('/classes/my-classes')
      const classesData = response.data.data.classes || []
      
      // Fetch assignment counts for each class
      const classesWithCounts = await Promise.all(
        classesData.map(async (cls) => {
          try {
            const assignmentsResponse = await api.get(`/assignments/classes/${cls._id}`)
            const assignments = assignmentsResponse.data.data.assignments || []
            return {
              ...cls,
              assignmentCount: assignments.length,
              pendingCount: assignments.filter(a => !a.mySubmission && new Date(a.dueAt) > new Date()).length,
              overdueCount: assignments.filter(a => !a.mySubmission && new Date(a.dueAt) < new Date()).length
            }
          } catch (error) {
            console.error('Error fetching assignments for class:', cls._id)
            return {
              ...cls,
              assignmentCount: 0,
              pendingCount: 0,
              overdueCount: 0
            }
          }
        })
      )
      
      setClasses(classesWithCounts)
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinClass = (newClass) => {
    fetchClasses() // Refresh the list
  }

  const handleClassClick = (classId) => {
    navigate(`/classes/${classId}`)
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 lg:ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
              <p className="text-gray-600 mt-2">View and manage your enrolled classes</p>
            </div>
            <button
              onClick={() => setShowJoinModal(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Join Class
            </button>
          </div>
        </div>

        {/* Classes Grid */}
        {classes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => (
              <div
                key={classItem._id}
                onClick={() => handleClassClick(classItem._id)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {classItem.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <User className="h-4 w-4 mr-1" />
                        {classItem.teacherId?.name || 'Unknown Teacher'}
                      </div>
                      {classItem.subject && (
                        <p className="text-sm text-gray-500 mb-2">{classItem.subject}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {classItem.joinCode}
                      </span>
                    </div>
                  </div>

                  {classItem.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {classItem.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <FileText className="h-4 w-4 text-gray-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">{classItem.assignmentCount}</p>
                      <p className="text-xs text-gray-500">Assignments</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Calendar className="h-4 w-4 text-yellow-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">{classItem.pendingCount}</p>
                      <p className="text-xs text-gray-500">Pending</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="h-4 w-4 text-gray-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">{classItem.students?.length || 0}</p>
                      <p className="text-xs text-gray-500">Students</p>
                    </div>
                  </div>

                  {classItem.overdueCount > 0 && (
                    <div className="mt-3 p-2 bg-red-50 rounded-md">
                      <p className="text-xs text-red-700 font-medium">
                        {classItem.overdueCount} overdue assignment{classItem.overdueCount > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't joined any classes yet. Join your first class to get started.
            </p>
            <button
              onClick={() => setShowJoinModal(true)}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Join Your First Class
            </button>
          </div>
        )}
      </div>

      {/* Join Class Modal */}
      <JoinClassModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSuccess={handleJoinClass}
      />
    </div>
  )
}

export default StudentClasses