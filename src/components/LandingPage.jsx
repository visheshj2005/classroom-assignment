import { BookOpen, Users, GraduationCap, Shield, CheckCircle, Clock, BarChart3 } from 'lucide-react'

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <BookOpen className="h-8 w-8 text-indigo-600" />
                            <span className="ml-2 text-xl font-semibold text-gray-900">
                                Classroom Assignment Portal
                            </span>
                        </div>

                        {/* Navigation Links */}
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-8">
                                <a href="#features" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors">
                                    Features
                                </a>
                                <a href="#teachers" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors">
                                    For Teachers
                                </a>
                                <a href="#students" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors">
                                    For Students
                                </a>
                            </div>
                        </div>

                        {/* Auth Buttons */}
                        <div className="flex items-center space-x-4">
                            <a
                                href="/register"
                                className="text-gray-600 hover:text-indigo-600 px-4 py-2 text-sm font-medium transition-colors"
                            >
                                Sign Up
                            </a>
                            <a
                                href="/login"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Login
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-indigo-50 to-blue-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                                Streamline Your{' '}
                                <span className="text-indigo-600">Classroom</span>
                            </h1>
                            <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                                A modern, simple portal for teachers to create assignments, students to submit work,
                                and admins to manage everything seamlessly.
                            </p>
                            <div className="mt-8">
                                <a
                                    href="/register"
                                    className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
                                >
                                    Get Started
                                </a>
                            </div>
                        </div>

                        {/* Hero Illustration */}
                        <div className="relative">
                            <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-indigo-200 rounded w-1/2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                        <div className="grid grid-cols-2 gap-4 mt-6">
                                            <div className="bg-indigo-50 p-4 rounded-lg">
                                                <div className="h-3 bg-indigo-300 rounded w-full mb-2"></div>
                                                <div className="h-2 bg-indigo-200 rounded w-2/3"></div>
                                            </div>
                                            <div className="bg-blue-50 p-4 rounded-lg">
                                                <div className="h-3 bg-blue-300 rounded w-full mb-2"></div>
                                                <div className="h-2 bg-blue-200 rounded w-2/3"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Everything You Need in One Place
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Designed for modern classrooms with intuitive tools for every role
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Student Card */}
                        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-8 border border-gray-100">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                                <GraduationCap className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                Track Your Assignments
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Never miss a deadline. Submit your work via links or file uploads and track your grades all in one place.
                            </p>
                            <div className="mt-6 space-y-2">
                                <div className="flex items-center text-sm text-gray-500">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                    Easy submission process
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <Clock className="h-4 w-4 text-green-500 mr-2" />
                                    Deadline notifications
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <BarChart3 className="h-4 w-4 text-green-500 mr-2" />
                                    Grade tracking
                                </div>
                            </div>
                        </div>

                        {/* Teacher Card */}
                        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-8 border border-gray-100">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                Manage Your Classroom
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Easily create assignments, grade submissions online, provide feedback, and view class analytics.
                            </p>
                            <div className="mt-6 space-y-2">
                                <div className="flex items-center text-sm text-gray-500">
                                    <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                                    Quick assignment creation
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <Clock className="h-4 w-4 text-blue-500 mr-2" />
                                    Online grading tools
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <BarChart3 className="h-4 w-4 text-blue-500 mr-2" />
                                    Class analytics
                                </div>
                            </div>
                        </div>

                        {/* Admin Card */}
                        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-8 border border-gray-100">
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                                <Shield className="h-6 w-6 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                Oversee the Portal
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Manage users, enroll students, assign teachers to classes, and ensure portal health.
                            </p>
                            <div className="mt-6 space-y-2">
                                <div className="flex items-center text-sm text-gray-500">
                                    <CheckCircle className="h-4 w-4 text-indigo-500 mr-2" />
                                    User management
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <Clock className="h-4 w-4 text-indigo-500 mr-2" />
                                    Class enrollment
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <BarChart3 className="h-4 w-4 text-indigo-500 mr-2" />
                                    System monitoring
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-50 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center mb-4">
                                <BookOpen className="h-8 w-8 text-indigo-600" />
                                <span className="ml-2 text-xl font-semibold text-gray-900">
                                    Classroom Assignment Portal
                                </span>
                            </div>
                            <p className="text-gray-600 max-w-md">
                                Streamlining education through modern technology. Making classroom management simple and effective.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                                Legal
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">
                                        Privacy Policy
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">
                                        Terms of Service
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                                Support
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">
                                        Contact
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">
                                        Help Center
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 mt-8 pt-8">
                        <p className="text-center text-gray-500 text-sm">
                            © 2025 Classroom Assignment Portal. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default LandingPage