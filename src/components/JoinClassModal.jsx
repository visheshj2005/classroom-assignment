import { useState } from 'react'
import { X, Users } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const JoinClassModal = ({ isOpen, onClose, onSuccess }) => {
  const [classCode, setClassCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { api } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!classCode.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const response = await api.post('/classes/join', {
        joinCode: classCode.toUpperCase()
      })

      if (response.data.success) {
        onSuccess(response.data.data.class)
        setClassCode('')
        onClose()
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to join class')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-indigo-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Join Class</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="classCode" className="block text-sm font-medium text-gray-700 mb-2">
              Class Code
            </label>
            <input
              type="text"
              id="classCode"
              autoComplete="off"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter class code (e.g., ABC123)"
              maxLength={10}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Ask your teacher for the class code
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !classCode.trim()}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Joining...' : 'Join Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default JoinClassModal