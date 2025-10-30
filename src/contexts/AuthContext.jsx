import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import axios from 'axios'

const AuthContext = createContext()

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null
      }
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload
      }
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    default:
      return state
  }
}

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null
}

// API base URL - use relative path in production, localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api')

console.log('API Base URL:', API_BASE_URL, 'Environment:', import.meta.env.MODE)

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Set up axios interceptor for token and auto-refresh
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // Verify token on app load
      verifyToken()
    }

    // Set up response interceptor to handle token expiration
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && state.isAuthenticated) {
          // Token expired, logout user
          console.log('Token expired, logging out user')
          logout()
        }
        return Promise.reject(error)
      }
    )

    return () => {
      api.interceptors.response.eject(responseInterceptor)
    }
  }, [state.isAuthenticated])

  // Update axios header when token changes
  useEffect(() => {
    if (state.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
      localStorage.setItem('token', state.token)
    } else {
      delete api.defaults.headers.common['Authorization']
      localStorage.removeItem('token')
    }
  }, [state.token])

  // Verify token validity
  const verifyToken = async () => {
    try {
      const response = await api.get('/auth/me')
      if (response.data.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.data.data.user,
            token: localStorage.getItem('token')
          }
        })
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      logout()
    }
  }

  // Login function
  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' })
    
    try {
      console.log('Attempting login with:', { email, baseURL: API_BASE_URL })
      const response = await api.post('/auth/login', { email, password })
      
      if (response.data.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: response.data.data
        })
        return { success: true }
      }
    } catch (error) {
      console.error('Login error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL
        }
      })
      
      let errorMessage = 'Login failed'
      
      if (error.response?.status === 401) {
        errorMessage = error.response?.data?.message || 'Invalid email or password'
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.'
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        errorMessage = 'Network error. Please check your connection and try again.'
      } else {
        errorMessage = error.response?.data?.message || 'Login failed'
      }
      
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      })
      return { success: false, error: errorMessage }
    }
  }

  // Register function
  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' })
    
    try {
      const response = await api.post('/auth/register', userData)
      
      if (response.data.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: response.data.data
        })
        return { success: true }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed'
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      })
      return { success: false, error: errorMessage }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      dispatch({ type: 'LOGOUT' })
    }
  }

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const response = await api.patch('/auth/me', profileData)
      
      if (response.data.success) {
        dispatch({
          type: 'UPDATE_USER',
          payload: response.data.data.user
        })
        return { success: true }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed'
      return { success: false, error: errorMessage }
    }
  }

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await api.patch('/auth/change-password', {
        currentPassword,
        newPassword
      })
      
      if (response.data.success) {
        // Force logout after password change for security
        await logout()
        return { success: true, shouldLogout: true }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password change failed'
      return { success: false, error: errorMessage }
    }
  }

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
    api
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}