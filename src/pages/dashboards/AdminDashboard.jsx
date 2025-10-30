import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Users, BookOpen, FileText, Shield, TrendingUp, AlertCircle } from 'lucide-react'
import Navigation from '../../components/Navigation'

const AdminDashboard = () => {
  const { user, api } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeClasses: 0,
    totalAssignments: 0,
    totalSubmissions: 0,
    roleDistribution: {
      students: 0,
      teachers: 0,
      admins: 0
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch user statistics
      const userStatsResponse = await api.get('/users/stats')
      if (userStatsResponse.data.success) {
        setStats(prevStats => ({
          ...prevStats,
          totalUsers: userStatsResponse.data.data.totalUsers,
          roleDistribution: userStatsResponse.data.data.roleDistribution
        }))
      }

      // You can add more API calls here for classes, assignments, etc.
      // For now, we'll use placeholder values for the other stats
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Welcome back, {user.name}. Here's your system overview.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? '...' : stats.totalUsers}
                </p>
                <p className="text-xs text-gray-500">All registered users</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? '...' : stats.roleDistribution.students}
                </p>
                <p className="text-xs text-gray-500">Active students</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Teachers</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? '...' : stats.roleDistribution.teachers}
                </p>
                <p className="text-xs text-gray-500">Active teachers</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? '...' : stats.roleDistribution.admins}
                </p>
                <p className="text-xs text-gray-500">System administrators</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Distribution */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">User Distribution</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Students</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">
                    {loading ? '...' : stats.roleDistribution.students}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {loading ? '...' : stats.totalUsers > 0 ? 
                      `${((stats.roleDistribution.students / stats.totalUsers) * 100).toFixed(1)}%` : '0%'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Teachers</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">
                    {loading ? '...' : stats.roleDistribution.teachers}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {loading ? '...' : stats.totalUsers > 0 ? 
                      `${((stats.roleDistribution.teachers / stats.totalUsers) * 100).toFixed(1)}%` : '0%'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Admins</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">
                    {loading ? '...' : stats.roleDistribution.admins}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {loading ? '...' : stats.totalUsers > 0 ? 
                      `${((stats.roleDistribution.admins / stats.totalUsers) * 100).toFixed(1)}%` : '0%'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard