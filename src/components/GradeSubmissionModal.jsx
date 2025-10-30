import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { X, Save, ExternalLink } from 'lucide-react'

const GradeSubmissionModal = ({ isOpen, onClose, submission, onSuccess }) => {
  const { api } = useAuth()
  const [loading, setLoading] = useState(false)
  const [gradeData, setGradeData] = useState({
    score: submission?.grade?.score || '',
    maxScore: submission?.assignmentId?.maxScore || 100,
    feedback: submission?.feedback || ''
  })

  if (!isOpen || !submission) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.patch(`/submissions/${submission._id}/grade`, {
        score: parseFloat(gradeData.score),
        maxScore: parseFloat(gradeData.maxScore),
        feedback: gradeData.feedback
      })

      if (response.data.success) {
        onSuccess(response.data.data.submission)
        onClose()
      }
    } catch (error) {
      console.error('Error grading submission:', error)
      alert(error.response?.data?.message || 'Failed to grade submission')
    } finally {
      setLoading(false)
    }
  }

  const percentage = gradeData.score && gradeData.maxScore ? 
    Math.round((gradeData.score / gradeData.maxScore) * 100) : 0

  const getLetterGrade = (percentage) => {
    if (percentage >= 97) return 'A+'
    if (percentage >= 93) return 'A'
    if (percentage >= 90) return 'A-'
    if (percentage >= 87) return 'B+'
    if (percentage >= 83) return 'B'
    if (percentage >= 80) return 'B-'
    if (percentage >= 77) return 'C+'
    if (percentage >= 73) return 'C'
    if (percentage >= 70) return 'C-'
    if (percentage >= 67) return 'D+'
    if (percentage >= 60) return 'D'
    return 'F'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Grade Submission
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Student and Assignment Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Student</p>
                <p className="text-gray-900">{submission.studentId?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Assignment</p>
                <p className="text-gray-900">{submission.assignmentId?.title}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Submitted</p>
                <p className="text-gray-900">
                  {new Date(submission.submittedAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  submission.isLate ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {submission.isLate ? 'Late' : 'On Time'}
                </span>
              </div>
            </div>
          </div>

          {/* Submission Content */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Submission</h4>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <ExternalLink className="h-4 w-4 text-gray-400" />
                <a
                  href={submission.content?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-500 text-sm"
                >
                  {submission.content?.url}
                </a>
              </div>
              {submission.content?.text && (
                <div className="mt-2">
                  <p className="text-sm text-gray-700">{submission.content.text}</p>
                </div>
              )}
            </div>
          </div>

          {/* Grading Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Score
                </label>
                <input
                  type="number"
                  min="0"
                  max={gradeData.maxScore}
                  step="0.1"
                  value={gradeData.score}
                  onChange={(e) => setGradeData(prev => ({ ...prev, score: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Score
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={gradeData.maxScore}
                  onChange={(e) => setGradeData(prev => ({ ...prev, maxScore: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                  <span className="text-lg font-semibold text-gray-900">
                    {getLetterGrade(percentage)} ({percentage}%)
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feedback (Optional)
              </label>
              <textarea
                value={gradeData.feedback}
                onChange={(e) => setGradeData(prev => ({ ...prev, feedback: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Provide feedback to the student..."
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4 inline mr-2" />
                {loading ? 'Saving...' : 'Save Grade'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default GradeSubmissionModal