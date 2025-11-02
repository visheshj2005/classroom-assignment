import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

/**
 * Temporary debugging component to help diagnose cross-browser authentication issues
 * Add this to any dashboard to see detailed authentication and API status
 */
const AuthDebugger = () => {
  const { user, api, isAuthenticated } = useAuth()
  const [debugInfo, setDebugInfo] = useState({
    authStatus: 'checking...',
    apiStatus: 'checking...',
    sessionInfo: 'checking...',
    lastError: null
  })

  useEffect(() => {
    checkAuthDebugInfo()
  }, [])

  const checkAuthDebugInfo = async () => {
    try {
      // Test basic connectivity first
      console.log('🔍 Debug: Testing basic connectivity...')
      console.log('🔍 API Base URL:', api.defaults.baseURL)
      console.log('🔍 Headers:', api.defaults.headers)
      
      // Test authentication
      console.log('🔍 Debug: Checking auth status...')
      const authResponse = await api.get('/auth/me')
      
      setDebugInfo(prev => ({
        ...prev,
        authStatus: authResponse.data.success ? 'authenticated' : 'failed',
        sessionInfo: `User: ${authResponse.data.data?.user?.name || 'unknown'}, Role: ${authResponse.data.data?.user?.role || 'unknown'}`
      }))

      // Test API endpoint
      console.log('🔍 Debug: Testing API endpoint...')
      const apiResponse = await api.get('/users/stats')
      
      setDebugInfo(prev => ({
        ...prev,
        apiStatus: apiResponse.data.success ? 'working' : 'failed',
        lastError: null
      }))

    } catch (error) {
      console.error('🔍 Debug: Error during checks:', error)
      
      let errorDetails = 'Unknown error'
      if (error.code === 'ECONNABORTED') {
        errorDetails = 'Request timeout - ngrok tunnel might be slow'
      } else if (error.code === 'ERR_NETWORK') {
        errorDetails = 'Network error - ngrok tunnel might be down or blocked'
      } else if (error.response) {
        errorDetails = `${error.response.status}: ${error.response.data?.message || error.response.statusText}`
      } else if (error.request) {
        errorDetails = 'No response from server - check ngrok tunnel'
      } else {
        errorDetails = error.message
      }
      
      setDebugInfo(prev => ({
        ...prev,
        authStatus: error.response?.status === 401 ? 'unauthorized' : 'error',
        apiStatus: 'failed',
        lastError: errorDetails
      }))
    }
  }

  const testApiCall = async () => {
    try {
      console.log('🧪 Manual API test...')
      const response = await api.get('/users/stats')
      alert(`API Test Success: ${JSON.stringify(response.data, null, 2)}`)
    } catch (error) {
      const errorMsg = error.code === 'ERR_NETWORK' 
        ? 'Network Error - Check ngrok tunnel' 
        : error.response?.data?.message || error.message
      alert(`API Test Failed: ${errorMsg}`)
    }
  }

  const testConnectivity = async () => {
    try {
      console.log('🌐 Testing basic connectivity...')
      const response = await fetch(api.defaults.baseURL.replace('/api', ''), {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      })
      alert(`Connectivity Test: ${response.ok ? 'SUCCESS' : 'FAILED'} (Status: ${response.status})`)
    } catch (error) {
      alert(`Connectivity Test Failed: ${error.message}`)
    }
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-yellow-800 mb-3">🔧 Auth Debugger</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <strong>Frontend Auth State:</strong>
          <ul className="ml-4 mt-1">
            <li>• Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}</li>
            <li>• User: {user?.name || 'None'}</li>
            <li>• Role: {user?.role || 'None'}</li>
          </ul>
        </div>
        
        <div>
          <strong>Backend Status:</strong>
          <ul className="ml-4 mt-1">
            <li>• Auth Check: {debugInfo.authStatus}</li>
            <li>• API Status: {debugInfo.apiStatus}</li>
            <li>• Session: {debugInfo.sessionInfo}</li>
          </ul>
        </div>
      </div>

      {debugInfo.lastError && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          <strong>Last Error:</strong> {debugInfo.lastError}
        </div>
      )}

      <div className="mt-4 space-x-2 flex flex-wrap gap-2">
        <button
          onClick={checkAuthDebugInfo}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Refresh Status
        </button>
        <button
          onClick={testApiCall}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
        >
          Test API Call
        </button>
        <button
          onClick={testConnectivity}
          className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
        >
          Test Connectivity
        </button>
      </div>

      <div className="mt-3 text-xs text-gray-600">
        <strong>Browser Info:</strong> {navigator.userAgent.substring(0, 100)}...
      </div>
    </div>
  )
}

export default AuthDebugger