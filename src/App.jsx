import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'

// Pages
import LandingPage from './components/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import AssignmentDetail from './pages/AssignmentDetail'
import AssignmentManagement from './pages/AssignmentManagement'
import ClassManagement from './pages/ClassManagement'
import ClassDetail from './pages/ClassDetail'
import ClassSettings from './pages/ClassSettings'
import UserManagement from './pages/admin/UserManagement'
import Unauthorized from './pages/Unauthorized'

// Layout wrapper to handle authenticated vs unauthenticated routing
const AppRoutes = () => {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} 
      />
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} 
      />
      <Route 
        path="/forgot-password" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPassword />} 
      />
      
      {/* Protected routes */}
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } 
      />
      
      {/* Profile route */}
      <Route 
        path="/profile" 
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } 
      />
      
      {/* Assignment detail route */}
      <Route 
        path="/assignments/:assignmentId" 
        element={
          <PrivateRoute>
            <AssignmentDetail />
          </PrivateRoute>
        } 
      />
      
      {/* Assignment management route (for teachers) */}
      <Route 
        path="/assignments/:assignmentId/manage" 
        element={
          <PrivateRoute roles={['teacher', 'admin']}>
            <AssignmentManagement />
          </PrivateRoute>
        } 
      />
      
      {/* Admin routes */}
      <Route 
        path="/admin/users" 
        element={
          <PrivateRoute roles={['admin']}>
            <UserManagement />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/admin/*" 
        element={
          <PrivateRoute roles={['admin']}>
            <div className="p-8 text-center">
              <h1 className="text-2xl font-bold">Admin Panel</h1>
              <p className="text-gray-600">More admin features coming soon...</p>
            </div>
          </PrivateRoute>
        } 
      />
      
      {/* Teacher routes */}
      <Route 
        path="/classes" 
        element={
          <PrivateRoute roles={['teacher', 'admin']}>
            <ClassManagement />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/classes/:classId" 
        element={
          <PrivateRoute roles={['teacher', 'admin']}>
            <ClassDetail />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/classes/:classId/settings" 
        element={
          <PrivateRoute roles={['teacher', 'admin']}>
            <ClassSettings />
          </PrivateRoute>
        } 
      />
      
      {/* Student routes */}
      <Route 
        path="/assignments/*" 
        element={
          <PrivateRoute>
            <div className="p-8 text-center">
              <h1 className="text-2xl font-bold">My Assignments</h1>
              <p className="text-gray-600">Assignment features coming soon...</p>
            </div>
          </PrivateRoute>
        } 
      />
      
      {/* Error pages */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
