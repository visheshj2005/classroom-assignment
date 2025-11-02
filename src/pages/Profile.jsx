import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { 
  User, 
  Mail, 
  Shield, 
  BookOpen, 
  GraduationCap,
  Save,
  X,
  Eye,
  EyeOff,
  Calendar
} from 'lucide-react'

const Profile = () => {
  const { user, api, changePassword } = useAuth()
  const navigate = useNavigate()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchUserStats()
  }, [])

  const fetchUserStats = async () => {
    try {
      let stats = {}
      
      if (user?.role === 'student') {
        // Fetch student classes
        const classesResponse = await api.get('/classes/my-classes')
        const classes = classesResponse.data.data.classes || []
        
        // Fetch assignments from all classes
        let totalAssignments = 0
        let totalSubmissions = 0
        
        for (const cls of classes) {
          try {
            const assignmentsResponse = await api.get(`/assignments/classes/${cls._id}`)
            const assignments = assignmentsResponse.data.data.assignments || []
            totalAssignments += assignments.length
            
            // Count submissions (this would need to be implemented properly)
            totalSubmissions += assignments.filter(a => a.mySubmission).length
          } catch (error) {
            console.error('Error fetching assignments for class:', cls._id)
          }
        }
        
        stats = {
          classesCount: classes.length,
          assignmentsCount: totalAssignments,
          submissionsCount: totalSubmissions
        }
      } else if (user?.role === 'teacher') {
        // Fetch teacher classes
        const classesResponse = await api.get('/classes/my-classes')
        const classes = classesResponse.data.data.classes || []
        
        let totalAssignments = 0
        let totalStudents = 0
        
        for (const cls of classes) {
          totalStudents += cls.students?.length || 0
          try {
            const assignmentsResponse = await api.get(`/assignments/classes/${cls._id}`)
            const assignments = assignmentsResponse.data.data.assignments || []
            totalAssignments += assignments.length
          } catch (error) {
            console.error('Error fetching assignments for class:', cls._id)
          }
        }
        
        stats = {
          classesCount: classes.length,
          assignmentsCount: totalAssignments,
          studentsCount: totalStudents
        }
      } else if (user?.role === 'admin') {
        // For admin, we'll use basic stats for now
        stats = {
          classesCount: 0,
          assignmentsCount: 0,
          usersCount: 0
        }
      }
      
      setStats(stats)
    } catch (error) {
      console.error('Error fetching user stats:', error)
      // Fallback to empty stats
      setStats({
        classesCount: 0,
        assignmentsCount: 0,
        submissionsCount: 0,
        studentsCount: 0,
        usersCount: 0
      })
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match')
      return
    }

    setLoading(true)

    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword)
      
      if (result.success) {
        setIsChangingPassword(false)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        
        if (result.shouldLogout) {
          alert('Password changed successfully. You will be redirected to login.')
          navigate('/login')
        } else {
          alert('Password changed successfully')
        }
      } else {
        alert(result.error || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      alert('Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="h-5 w-5" />
      case 'teacher': return <BookOpen className="h-5 w-5" />
      case 'student': return <GraduationCap className="h-5 w-5" />
      default: return <User className="h-5 w-5" />
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'teacher': return 'bg-blue-100 text-blue-800'
      case 'student': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 lg:ml-72 p-8">
        {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="mt-1 text-sm text-gray-600">
              View your account information and change your password
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-12 w-12 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user?.role)}`}>
                    {getRoleIcon(user?.role)}
                    <span className="ml-1 capitalize">{user?.role}</span>
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                  <Mail className="h-4 w-4 mr-2" />
                  {user?.email}
                </div>
                <div className="mt-2 flex items-center justify-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  Joined {new Date(user?.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Stats Card */}
            {stats && (
              <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Stats</h3>
                <div className="space-y-3">
                  {user?.role === 'student' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Classes Enrolled:</span>
                        <span className="font-medium">{stats.classesCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Assignments:</span>
                        <span className="font-medium">{stats.assignmentsCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Submissions:</span>
                        <span className="font-medium">{stats.submissionsCount || 0}</span>
                      </div>
                    </>
                  )}
                  {user?.role === 'teacher' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Classes Teaching:</span>
                        <span className="font-medium">{stats.classesCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Assignments Created:</span>
                        <span className="font-medium">{stats.assignmentsCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Students:</span>
                        <span className="font-medium">{stats.studentsCount || 0}</span>
                      </div>
                    </>
                  )}
                  {user?.role === 'admin' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Users:</span>
                        <span className="font-medium">{stats.usersCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Classes:</span>
                        <span className="font-medium">{stats.classesCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Assignments:</span>
                        <span className="font-medium">{stats.assignmentsCount || 0}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-gray-900">{user?.name || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <p className="mt-1 text-gray-900">{user?.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <p className="mt-1 text-gray-900 capitalize">{user?.role}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                {!isChangingPassword && (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Change Password
                  </button>
                )}
              </div>
              
              <div className="p-6">
                {isChangingPassword ? (
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          autoComplete="off"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          autoComplete="off"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoComplete="off"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setIsChangingPassword(false)
                          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                        }}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                      >
                        <X className="h-4 w-4 inline mr-2" />
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
                      >
                        <Save className="h-4 w-4 inline mr-2" />
                        {loading ? 'Changing...' : 'Change Password'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <p className="text-gray-600">
                      Keep your account secure by using a strong password and changing it regularly.
                    </p>
                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700">
                        <strong>Password Requirements:</strong>
                      </p>
                      <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                        <li>At least 6 characters long</li>
                        <li>Mix of letters, numbers, and symbols recommended</li>
                        <li>Avoid using personal information</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

export default Profile