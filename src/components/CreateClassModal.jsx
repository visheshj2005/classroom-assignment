import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { X, BookOpen, Users, FileText, Crown, AlertTriangle } from 'lucide-react'

const CreateClassModal = ({ isOpen, onClose, onClassCreated }) => {
  const { api } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [checkingLimits, setCheckingLimits] = useState(false)
  const [limitInfo, setLimitInfo] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: ''
  })

  useEffect(() => {
    if (isOpen) {
      checkSubscriptionLimits()
    }
  }, [isOpen])

  const checkSubscriptionLimits = async () => {
    try {
      setCheckingLimits(true)
      const response = await api.get('/payments/subscription')
      const subscriptionInfo = response.data.data
      
      // Check if user can create more classes
      const currentTier = subscriptionInfo.currentTier || 'free'
      const tierInfo = subscriptionInfo.tierInfo
      const classCount = subscriptionInfo.classCount || 0
      
      const canCreate = tierInfo.maxClasses === -1 || classCount < tierInfo.maxClasses
      
      setLimitInfo({
        canCreate,
        currentTier,
        tierInfo,
        classCount
      })
    } catch (error) {
      console.error('Error checking subscription limits:', error)
      // Allow creation if we can't check limits
      setLimitInfo({ canCreate: true })
    } finally {
      setCheckingLimits(false)
    }
  }

  const handleUpgrade = () => {
    onClose()
    navigate('/subscription')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('Creating class with data:', formData)
      const response = await api.post('/classes', formData)
      console.log('Class creation response:', response.data)
      if (response.data.success) {
        onClassCreated(response.data.data.class)
        setFormData({ title: '', description: '', subject: '' })
        onClose()
      }
    } catch (error) {
      console.error('Error creating class:', error)
      console.error('Error response:', error.response?.data)
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg || 
                          'Failed to create class'
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <BookOpen className="h-6 w-6 text-indigo-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Create New Class</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {checkingLimits ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600">Checking subscription limits...</span>
            </div>
          ) : limitInfo && !limitInfo.canCreate ? (
            <div className="text-center py-6">
              <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Class Limit Reached</h4>
              <p className="text-gray-600 mb-4">
                Your {limitInfo.currentTier} plan allows {limitInfo.tierInfo.maxClasses} class{limitInfo.tierInfo.maxClasses > 1 ? 'es' : ''}.
                You currently have {limitInfo.classCount} class{limitInfo.classCount > 1 ? 'es' : ''}.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Upgrade your subscription to create more classes.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpgrade}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 flex items-center justify-center"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </button>
              </div>
            </div>
          ) : (

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Class Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Introduction to Computer Science"
                required
                maxLength={100}
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Computer Science, Mathematics"
                maxLength={50}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                placeholder="Brief description of the class..."
                maxLength={500}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <div className="flex items-start">
                <Users className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Join Code</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    A unique 6-character join code will be automatically generated for students to join your class.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.title.trim()}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Class'
                )}
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateClassModal