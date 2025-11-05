import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Home,
  BookOpen,
  FileText,
  Users,
  LogOut,
  Menu,
  X,
  Crown,
  CreditCard,
  User
} from 'lucide-react'

const Sidebar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const menuItems = {
    student: [
      { icon: Home, label: 'Dashboard', path: '/dashboard' },
      { icon: BookOpen, label: 'My Classes', path: '/classes' },
      { icon: FileText, label: 'Assignments', path: '/assignments' },
      { icon: User, label: 'Profile', path: '/profile' }
    ],
    teacher: [
      { icon: Home, label: 'Dashboard', path: '/dashboard' },
      { icon: BookOpen, label: 'My Classes', path: '/classes' },
      { icon: CreditCard, label: 'Subscription', path: '/subscription' },
      { icon: User, label: 'Profile', path: '/profile' }
    ],
    admin: [
      { icon: Home, label: 'Dashboard', path: '/dashboard' },
      { icon: Users, label: 'User Management', path: '/admin/users' },
      { icon: User, label: 'Profile', path: '/profile' }
    ]
  }

  const currentMenuItems = menuItems[user?.role] || menuItems.student

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard'
    }
    return location.pathname.startsWith(path)
  }

  const getSubscriptionBadge = () => {
    if (user?.role !== 'teacher') return null
    
    const tier = user?.subscription?.tier || 'free'
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      lite: 'bg-blue-100 text-blue-800',
      premium: 'bg-purple-100 text-purple-800'
    }

    return (
      <div className={`px-2 py-1 rounded-full text-xs font-medium ${colors[tier]} flex items-center gap-1`}>
        {tier === 'premium' && <Crown className="h-3 w-3" />}
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </div>
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Always visible on desktop, toggleable on mobile */}
      <div className={`fixed left-4 top-4 bottom-4 bg-white shadow-lg z-50 transition-transform duration-300 w-64 rounded-2xl ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Gradely</h1>
              <p className="text-xs text-gray-500">Assignment Portal</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                {getSubscriptionBadge()}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {currentMenuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              
              return (
                <li key={item.path}>
                  <button
                    onClick={() => {
                      navigate(item.path)
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      active
                        ? 'bg-indigo-100 text-indigo-700 border-r-2 border-indigo-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? 'text-indigo-700' : 'text-gray-500'}`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer - Fixed at bottom with proper spacing */}
        <div className="p-4 border-t border-gray-200 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="fixed top-4 left-4 z-30 p-2 bg-white rounded-lg shadow-md lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
    </>
  )
}

export default Sidebar