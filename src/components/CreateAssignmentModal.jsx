import { useState } from 'react'
import { X, FileText, Calendar } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const CreateAssignmentModal = ({ isOpen, onClose, classId, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    dueAt: '',
    maxScore: 100
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { api } = useAuth()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }



  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await api.post(`/assignments/classes/${classId}`, formData)

      if (response.data.success) {
        onSuccess(response.data.data.assignment)
        setFormData({
          title: '',
          description: '',
          instructions: '',
          dueAt: '',
          maxScore: 100
        })
        onClose()
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create assignment')
    } finally {
      setIsLoading(false)
    }
  }

  // Get minimum date (tomorrow)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().slice(0, 16)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-indigo-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Create Assignment</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                autoComplete="off"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter assignment title"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Brief description of the assignment"
              />
            </div>

            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Instructions
              </label>
              <textarea
                id="instructions"
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Detailed instructions for students..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dueAt" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Due Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="dueAt"
                  name="dueAt"
                  autoComplete="off"
                  value={formData.dueAt}
                  onChange={handleChange}
                  min={minDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="maxScore" className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Score
                </label>
                <input
                  type="number"
                  id="maxScore"
                  name="maxScore"
                  autoComplete="off"
                  value={formData.maxScore}
                  onChange={handleChange}
                  min={1}
                  max={1000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Students will submit assignments by providing URLs (e.g., GitHub repositories, Google Drive links, etc.)
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Create Assignment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateAssignmentModal