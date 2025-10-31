import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from '../components/Sidebar'
import { 
  ArrowLeft,
  Settings,
  Users,
  Trash2,
  Save,
  Copy
} from 'lucide-react'

const ClassSettings = () => {
  const { classId } = useParams()
  const { api } = useAuth()
  const navigate = useNavigate()
  const [classData, setClassData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: ''
  })

  useEffect(() => {
    fetchClassData()
  }, [classId])

  const fetchClassData = async () => {
    try {
      const response = await api.get(`/classes/${classId}`)
      const cls = response.data.data.class
      setClassData(cls)
      setFormData({
        title: cls.title,
        description: cls.description || '',
        subject: cls.subject || ''
      })
    } catch (error) {
      console.error('Error fetching class:', error)
      navigate('/classes')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await api.patch(`/classes/${classId}`, formData)
      if (response.data.success) {
        setClassData(response.data.data.class)
        alert('Class updated successfully!')
      }
    } catch (error) {
      console.error('Error updating class:', error)
      alert(error.response?.data?.message || 'Failed to update class')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClass = async () => {
    if (!confirm('Are you sure you want to delete this class? This action cannot be undone and will delete all assignments and submissions.')) {
      return
    }

    try {
      await api.delete(`/classes/${classId}`)
      alert('Class deleted successfully')
      navigate('/classes')
    } catch (error) {
      console.error('Error deleting class:', error)
      alert(error.response?.data?.message || 'Failed to delete class')
    }
  }

  const handleCopyJoinCode = async () => {
    try {
      await navigator.clipboard.writeText(classData.joinCode)
      alert('Join code copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy join code:', error)
      alert('Failed to copy join code')
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 lg:ml-64 p-8">
      
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/classes/${classId}`)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Class Settings</h1>
                <p className="text-sm text-gray-600">{classData.title}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Basic Information
              </h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Mathematics, Science, History"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Brief description of the class"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Join Code */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Join Code
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">Current Join Code</p>
                  <p className="text-2xl font-mono font-bold text-gray-900">{classData.joinCode}</p>
                  <p className="text-sm text-gray-500">Share this code with students to join the class</p>
                </div>
                <button
                  onClick={handleCopyJoinCode}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-lg shadow border-red-200 border">
            <div className="px-6 py-4 border-b border-red-200">
              <h2 className="text-lg font-semibold text-red-900 flex items-center">
                <Trash2 className="h-5 w-5 mr-2" />
                Danger Zone
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Delete Class</h3>
                  <p className="text-sm text-gray-500">
                    Permanently delete this class and all its assignments and submissions. This action cannot be undone.
                  </p>
                </div>
                <button
                  onClick={handleDeleteClass}
                  className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Class
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

export default ClassSettings