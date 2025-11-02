import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FileText, Clock, CheckCircle, AlertCircle, Calendar, BookOpen } from 'lucide-react'
import Sidebar from '../components/Sidebar'

const StudentAssignments = () => {
  const { api } = useAuth()
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, submitted, graded, overdue

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    try {
      setLoading(true)
      
      // First get all classes
      const classesResponse = await api.get('/classes/my-classes')
      const classes = classesResponse.data.data.classes || []
      
      // Then get assignments from all classes
      const assignmentPromises = classes.map(async (cls) => {
        try {
          const response = await api.get(`/assignments/classes/${cls._id}`)
          const assignments = response.data.data.assignments || []
          
          // Add class info to each assignment and get submission status
          return assignments.map(assignment => ({
            ...assignment,
            classInfo: {
              _id: cls._id,
              title: cls.title,
              teacherId: cls.teacherId
            }
          }))
        } catch (error) {
          console.error('Error fetching assignments for class:', cls._id)
          return []
        }
      })
      
      const assignmentResponses = await Promise.all(assignmentPromises)
      const allAssignments = assignmentResponses.flat()
      
      // Sort by due date
      const sortedAssignments = allAssignments.sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt))
      
      setAssignments(sortedAssignments)
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAssignmentStatus = (assignment) => {
    if (assignment.mySubmission) {
      if (assignment.mySubmission.status === 'graded') {
        return {
          status: 'Graded',
          color: 'green',
          icon: CheckCircle,
          grade: assignment.mySubmission.grade?.letterGrade || 'N/A'
        }
      }
      return {
        status: 'Submitted',
        color: 'blue',
        icon: CheckCircle
      }
    }

    const now = new Date()
    const dueDate = new Date(assignment.dueAt)
    
    if (dueDate < now) {
      return {
        status: 'Overdue',
        color: 'red',
        icon: AlertCircle
      }
    }

    return {
      status: 'Pending',
      color: 'yellow',
      icon: Clock
    }
  };
  const filteredAssignments = assignments.filter(assignment => {
    const statusInfo = getAssignmentStatus(assignment)
    
    switch (filter) {
      case 'pending':
        return statusInfo.status === 'Pending'
      case 'submitted':
        return statusInfo.status === 'Submitted'
      case 'graded':
        return statusInfo.status === 'Graded'
      case 'overdue':
        return statusInfo.status === 'Overdue'
      default:
        return true
    }
  })

  const getFilterCounts = () => {
    const counts = {
      all: assignments.length,
      pending: 0,
      submitted: 0,
      graded: 0,
      overdue: 0
    }

    assignments.forEach(assignment => {
      const statusInfo = getAssignmentStatus(assignment)
      switch (statusInfo.status) {
        case 'Pending':
          counts.pending++
          break
        case 'Submitted':
          counts.submitted++
          break
        case 'Graded':
          counts.graded++
          break
        case 'Overdue':
          counts.overdue++
          break
      }
    })

    return counts
  }

  const formatDueDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 86400000).toDateString()
    
    if (isToday) return 'Due today'
    if (isTomorrow) return 'Due tomorrow'
    
    return `Due ${date.toLocaleDateString()}`
  }

  const filterCounts = getFilterCounts()

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
          <h1 className="text-3xl font-bold text-gray-900">My Assignments</h1>
          <p className="text-gray-600 mt-2">View and manage your assignments from all classes</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All', count: filterCounts.all },
                { key: 'pending', label: 'Pending', count: filterCounts.pending },
                { key: 'submitted', label: 'Submitted', count: filterCounts.submitted },
                { key: 'graded', label: 'Graded', count: filterCounts.graded },
                { key: 'overdue', label: 'Overdue', count: filterCounts.overdue }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      filter === tab.key
                        ? 'bg-indigo-100 text-indigo-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Assignments List */}
        {filteredAssignments.length > 0 ? (
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => {
              const statusInfo = getAssignmentStatus(assignment)
              const StatusIcon = statusInfo.icon
              
              return (
                <div
                  key={assignment._id}
                  onClick={() => navigate(`/assignments/${assignment._id}`)}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 mr-3">
                            {assignment.title}
                          </h3>
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusInfo.color === 'green' ? 'bg-green-100 text-green-800' :
                            statusInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                            statusInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.status}
                            {statusInfo.grade && ` (${statusInfo.grade})`}
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {assignment.classInfo?.title || 'Unknown Class'}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDueDate(assignment.dueAt)}
                        </div>

                        {assignment.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {assignment.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="ml-4 text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {assignment.totalPoints} points
                        </p>
                        {assignment.mySubmission?.submittedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Submitted {new Date(assignment.mySubmission.submittedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No Assignments Yet' : `No ${filter} Assignments`}
            </h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "You don't have any assignments yet. Join a class to see assignments."
                : `You don't have any ${filter} assignments at the moment.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentAssignments