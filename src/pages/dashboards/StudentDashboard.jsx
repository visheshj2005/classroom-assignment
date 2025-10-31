import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { BookOpen, Clock, CheckCircle, AlertCircle, Plus, FileText } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import JoinClassModal from '../../components/JoinClassModal'

const StudentDashboard = () => {
  const { user, api } = useAuth()
  const navigate = useNavigate()
  const [classes, setClasses] = useState([])
  const [recentAssignments, setRecentAssignments] = useState([])
  const [stats, setStats] = useState({
    totalClasses: 0,
    pendingAssignments: 0,
    completedAssignments: 0,
    overdueAssignments: 0
  })
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch classes
      const classesResponse = await api.get('/classes/my-classes')
      const classesData = classesResponse.data.data.classes || []
      setClasses(classesData)

      // Fetch recent assignments from all classes with submission data
      const assignmentPromises = classesData.map(async (cls) => {
        try {
          const response = await api.get(`/assignments/classes/${cls._id}?limit=10`)
          const assignments = response.data.data.assignments || []
          
          // For each assignment, fetch the student's submission if it exists
          const assignmentsWithSubmissions = await Promise.all(
            assignments.map(async (assignment) => {
              try {
                // Get assignment details which includes mySubmission for students
                const detailResponse = await api.get(`/assignments/${assignment._id}`)
                return detailResponse.data.data.assignment
              } catch (error) {
                console.error('Error fetching assignment details:', error)
                return assignment
              }
            })
          )
          
          return assignmentsWithSubmissions
        } catch (error) {
          console.error('Error fetching assignments for class:', cls._id, error)
          return []
        }
      })
      
      const assignmentResponses = await Promise.all(assignmentPromises)
      const allAssignments = assignmentResponses.flat()

      // Sort by due date and take recent ones
      const sortedAssignments = allAssignments
        .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt))
        .slice(0, 10)

      setRecentAssignments(sortedAssignments)

      // Calculate stats
      const now = new Date()
      const pending = allAssignments.filter(a => 
        !a.mySubmission && new Date(a.dueAt) > now
      ).length
      const completed = allAssignments.filter(a => 
        a.mySubmission && a.mySubmission.status === 'graded'
      ).length
      const overdue = allAssignments.filter(a => 
        !a.mySubmission && new Date(a.dueAt) < now
      ).length

      setStats({
        totalClasses: classesData.length,
        pendingAssignments: pending,
        completedAssignments: completed,
        overdueAssignments: overdue
      })

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinClass = (newClass) => {
    setClasses(prev => [...prev, newClass])
    setStats(prev => ({ ...prev, totalClasses: prev.totalClasses + 1 }))
    fetchDashboardData() // Refresh to get assignments
  }

  const getAssignmentStatus = (assignment) => {
    if (assignment.mySubmission) {
      if (assignment.mySubmission.status === 'graded') {
        return {
          status: 'Graded',
          color: 'green',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          grade: assignment.mySubmission.grade?.letterGrade || 'N/A'
        }
      }
      // If submission exists but not graded, show as submitted
      return {
        status: 'Submitted',
        color: 'blue',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800'
      }
    }

    // No submission exists
    const now = new Date()
    const dueDate = new Date(assignment.dueAt)
    
    if (dueDate < now) {
      return {
        status: 'Overdue',
        color: 'red',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800'
      }
    }

    return {
      status: 'Not Submitted',
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 lg:ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name}!
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Here's what's happening in your classes today.
          </p>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">My Classes</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalClasses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingAssignments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.completedAssignments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.overdueAssignments}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Assignments */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Assignments</h2>
            </div>
            <div className="p-6">
              {recentAssignments.length > 0 ? (
                <div className="space-y-4">
                  {recentAssignments.slice(0, 5).map((assignment) => {
                    const statusInfo = getAssignmentStatus(assignment)
                    const dueDate = new Date(assignment.dueAt)
                    const isToday = dueDate.toDateString() === new Date().toDateString()
                    const isTomorrow = dueDate.toDateString() === new Date(Date.now() + 86400000).toDateString()
                    
                    let dueDateText = dueDate.toLocaleDateString()
                    if (isToday) dueDateText = 'Due today'
                    else if (isTomorrow) dueDateText = 'Due tomorrow'

                    return (
                      <div 
                        key={assignment._id}
                        onClick={() => navigate(`/assignments/${assignment._id}`)}
                        className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${statusInfo.bgColor} ${statusInfo.borderColor}`}
                      >
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                          <p className="text-sm text-gray-600">
                            {assignment.classId?.title || 'Unknown Class'} • {dueDateText}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {statusInfo.grade && (
                            <span className="text-sm font-medium text-gray-900">
                              {statusInfo.grade}
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.textColor} bg-${statusInfo.color}-100`}>
                            {statusInfo.status}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No assignments yet</p>
                  <p className="text-sm text-gray-400">Join a class to see assignments</p>
                </div>
              )}
            </div>
          </div>

          {/* My Classes */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">My Classes</h2>
              <button
                onClick={() => setShowJoinModal(true)}
                className="inline-flex items-center px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100"
              >
                <Plus className="h-4 w-4 mr-1" />
                Join Class
              </button>
            </div>
            <div className="p-6">
              {classes.length > 0 ? (
                <div className="space-y-4">
                  {classes.map((classItem) => (
                    <div 
                      key={classItem._id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{classItem.title}</h3>
                          <p className="text-sm text-gray-600">
                            {classItem.teacherId?.name || 'Unknown Teacher'} • {classItem.code}
                          </p>
                          {classItem.description && (
                            <p className="text-xs text-gray-500 mt-1">{classItem.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {classItem.assignmentCount || 0} assignments
                          </p>
                          <p className="text-xs text-gray-500">
                            {classItem.members?.length || 0} students
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No classes joined yet</p>
                  <button
                    onClick={() => setShowJoinModal(true)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Join Your First Class
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
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

export default StudentDashboard