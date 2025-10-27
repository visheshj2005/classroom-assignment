import { useAuth } from '../contexts/AuthContext'
import StudentDashboard from './dashboards/StudentDashboard'
import TeacherDashboard from './dashboards/TeacherDashboard'
import AdminDashboard from './dashboards/AdminDashboard'

const Dashboard = () => {
    const { user } = useAuth()

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    switch (user.role) {
        case 'student':
            return <StudentDashboard />
        case 'teacher':
            return <TeacherDashboard />
        case 'admin':
            return <AdminDashboard />
        default:
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900">Invalid Role</h1>
                        <p className="text-gray-600">Please contact administrator</p>
                    </div>
                </div>
            )
    }
}

export default Dashboard