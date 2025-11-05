import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'

// Pages
import LandingPage from './components/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import AssignmentDetail from './pages/AssignmentDetail'
import AssignmentManagement from './pages/AssignmentManagement'
import ClassManagement from './pages/ClassManagement'
import ClassDetail from './pages/ClassDetail'
import ClassSettings from './pages/ClassSettings'
import UserManagement from './pages/admin/UserManagement'
import Subscription from './pages/Subscription'
import StudentClasses from './pages/StudentClasses'
import StudentAssignments from './pages/StudentAssignments'
import Unauthorized from './pages/Unauthorized'

// New public pages
import ForTeachers from './pages/ForTeachers'
import ForStudents from './pages/ForStudents'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import Contact from './pages/Contact'
import HelpCenter from './pages/HelpCenter'

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
      <Route
        path="/reset-password"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ResetPassword />}
      />

      {/* New public pages */}
      <Route path="/for-teachers" element={<ForTeachers />} />
      <Route path="/for-students" element={<ForStudents />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/help-center" element={<HelpCenter />} />

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
        path="/subscription"
        element={
          <PrivateRoute roles={['teacher']}>
            <Subscription />
          </PrivateRoute>
        }
      />

      {/* Class routes - accessible by both teachers and students */}
      <Route
        path="/classes"
        element={
          <PrivateRoute>
            <ClassManagement />
          </PrivateRoute>
        }
      />
      <Route
        path="/classes/:classId"
        element={
          <PrivateRoute>
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

      {/* Assignment routes */}
      <Route
        path="/assignments"
        element={
          <PrivateRoute>
            <StudentAssignments />
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
