import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { BookOpen, Users, FileText, Clock, CheckCircle, AlertTriangle, Plus, Crown } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import CreateAssignmentModal from '../../components/CreateAssignmentModal'

const TeacherDashboard = () => {
  const { user, api } = useAuth()
  const navigate = useNavigate()
  const [classes, setClasses] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalAssignments: 0,
    toGrade: 0
  })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedClassId, setSelectedClassId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [subscriptionInfo, setSubscriptionInfo] = useState(null)

  useEffect(() => {
    fetchDashboardData()
    fetchSubscriptionInfo()
  }, [])

  const fetchSubscriptionInfo = async () => {
    try {
      const response = await api.get('/payments/subscription')
      setSubscriptionInfo(response.data.data)
    } catch (error) {
      console.error('Error fetching subscription info:', error)
    }
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch teacher's classes
      const classesResponse = await api.get('/classes/my-classes')
      const classesData = classesResponse.data.data.classes || []
      setClasses(classesData)

      // Calculate total students
      const totalStudents = classesData.reduce((sum, cls) => 
        sum + (cls.students?.length || 0), 0
      )

      // Fetch assignments and submissions for stats
      let totalAssignments = 0
      let toGrade = 0
      const activityItems = []

      for (const cls of classesData) {
        try {
          const assignmentsResponse = await api.get(`/assignments/classes/${cls._id}?limit=50`)
          const assignments = assignmentsResponse.data.data.assignments || []
          totalAssignments += assignments.length
          
          // Add assignment count to class object
          cls.assignmentCount = assignments.length

          // Get recent submissions for activity
          for (const assignment of assignments.slice(0, 3)) {
            try {
              const submissionsResponse = await api.get(`/assignments/${assignment._id}/submissions?limit=5&status=submitted`)
              const submissions = submissionsResponse.data.data.submissions || []
              toGrade += submissions.length

              // Add to recent activity
              submissions.forEach(submission => {
                activityItems.push({
                  type: 'submission',
                  message: `${submission.studentId?.name || 'Student'} submitted ${assignment.title}`,
                  time: submission.submittedAt,
                  assignment: assignment.title,
                  student: submission.studentId?.name
                })
              })
            } catch (error) {
              console.error('Error fetching submissions:', error)
            }
          }
        } catch (error) {
          console.error('Error fetching assignments:', error)
          cls.assignmentCount = 0
        }
      }

      // Sort activity by time and take recent items
      const sortedActivity = activityItems
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 10)

      setRecentActivity(sortedActivity)
      setStats({
        totalClasses: classesData.length,
        totalStudents,
        totalAssignments,
        toGrade
      })

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAssignment = (classId) => {
    setSelectedClassId(classId)
    setShowCreateModal(true)
  }

  const handleAssignmentCreated = (newAssignment) => {
    setStats(prev => ({ ...prev, totalAssignments: prev.totalAssignments + 1 }))
    fetchDashboardData() // Refresh data
  }



  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    return `${Math.floor(diffInMinutes / 1440)} days ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const getSubscriptionBadge = () => {
    if (!subscriptionInfo) return null
    
    const tier = subscriptionInfo.currentTier || 'free'
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      lite: 'bg-blue-100 text-blue-800',
      premium: 'bg-purple-100 text-purple-800'
    }

    return (
      <div className={`px-3 py-1 rounded-full text-sm font-medium ${colors[tier]} flex items-center gap-1`}>
        {tier === 'premium' && <Crown className="h-4 w-4" />}
        {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 lg:ml-72 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.name}!
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your classes and assignments from here.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {getSubscriptionBadge()}
              {subscriptionInfo && subscriptionInfo.currentTier !== 'premium' && (
                <button
                  onClick={() => navigate('/subscription')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Upgrade Plan
                </button>
              )}
            </div>
          </div>
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
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Assignments</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalAssignments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">To Grade</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.toGrade}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.student}</span> submitted {activity.assignment}
                        </p>
                        <p className="text-xs text-gray-500">{formatTimeAgo(activity.time)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activity</p>
                  <p className="text-sm text-gray-400">Activity will appear when students submit assignments</p>
                </div>
              )}
            </div>
          </div>

          {/* My Classes */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">My Classes</h2>
              <button className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                View All
              </button>
            </div>
            <div className="p-6">
              {classes.length > 0 ? (
                <div className="space-y-4">
                  {classes.map((classItem) => {
                    const studentCount = classItem.students?.length || 0
                    
                    return (
                      <div 
                        key={classItem._id}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{classItem.title}</h3>
                            <p className="text-sm text-gray-600">
                              {classItem.joinCode} • {studentCount} students
                            </p>
                            {classItem.description && (
                              <p className="text-xs text-gray-500 mt-1">{classItem.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {classItem.assignmentCount || 0} assignments
                            </p>
                            <div className="grid grid-cols-2 gap-1 mt-2">
                              <button
                                onClick={() => navigate(`/classes/${classItem._id}`)}
                                className="px-2 py-1 text-xs text-indigo-600 hover:text-indigo-500 font-medium border border-indigo-200 rounded hover:bg-indigo-50"
                              >
                                View Class
                              </button>
                              <button
                                onClick={() => handleCreateAssignment(classItem._id)}
                                className="px-2 py-1 text-xs text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded"
                              >
                                New Assignment
                              </button>
                              <button
                                onClick={() => navigate(`/classes/${classItem._id}`)}
                                className="px-2 py-1 text-xs text-gray-600 hover:text-gray-700 font-medium border border-gray-200 rounded hover:bg-gray-50"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => navigate(`/classes/${classItem._id}/settings`)}
                                className="px-2 py-1 text-xs text-gray-600 hover:text-gray-700 font-medium border border-gray-200 rounded hover:bg-gray-50"
                              >
                                Settings
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No classes created yet</p>
                  <p className="text-sm text-gray-400">Create your first class to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Assignment Modal */}
      <CreateAssignmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        classId={selectedClassId}
        onSuccess={handleAssignmentCreated}
      />
    </div>
  )
}

export default TeacherDashboard