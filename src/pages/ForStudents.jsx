import { BookOpen, GraduationCap, CheckCircle, Clock, BarChart3, Upload, Bell, Star } from 'lucide-react'

const ForStudents = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <BookOpen className="h-8 w-8 text-indigo-600" />
                            <a href="/" className="ml-2 text-xl font-semibold text-gray-900">
                                Classroom Assignment Portal
                            </a>
                        </div>
                        <div className="flex items-center space-x-4">
                            <a href="/register" className="text-gray-600 hover:text-indigo-600 px-4 py-2 text-sm font-medium">
                                Sign Up
                            </a>
                            <a href="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                                Login
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Excel in Your <span className="text-green-600">Studies</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                            Stay organized, submit assignments on time, and track your academic progress all in one place. Your success starts here.
                        </p>
                        <a href="/register" className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold">
                            Start Learning Today
                        </a>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Everything You Need to Succeed
                        </h2>
                        <p className="text-xl text-gray-600">
                            Powerful tools designed to help you excel in your studies
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                                <Upload className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Easy Submission</h3>
                            <p className="text-gray-600">Submit assignments through file uploads or URL links. Our platform supports various file formats and makes submission simple.</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                                <Clock className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Deadline Tracking</h3>
                            <p className="text-gray-600">Never miss a deadline again. Get notifications and reminders for upcoming assignments and important dates.</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                                <BarChart3 className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Grade Tracking</h3>
                            <p className="text-gray-600">Monitor your academic progress with detailed grade tracking and performance analytics across all your classes.</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-6">
                                <GraduationCap className="h-6 w-6 text-yellow-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Class Organization</h3>
                            <p className="text-gray-600">Keep all your classes organized in one dashboard. Access assignments, materials, and announcements easily.</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                                <Bell className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Notifications</h3>
                            <p className="text-gray-600">Stay informed with intelligent notifications about new assignments, grade updates, and important announcements.</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                                <Star className="h-6 w-6 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Achievement Tracking</h3>
                            <p className="text-gray-600">Celebrate your successes and track your achievements throughout your academic journey.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Why Students Love Our Platform
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-3" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Never Miss a Deadline</h3>
                                        <p className="text-gray-600">Automated reminders and calendar integration keep you on track.</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-3" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Instant Feedback</h3>
                                        <p className="text-gray-600">Get quick feedback from teachers to improve your work.</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-3" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Mobile Friendly</h3>
                                        <p className="text-gray-600">Access your assignments and grades from any device, anywhere.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <GraduationCap className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Academic Success</h3>
                                <p className="text-gray-600">Join thousands of students who have improved their grades and academic performance using our platform.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-green-600 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Ready to Boost Your Academic Performance?
                    </h2>
                    <p className="text-xl text-green-100 mb-8">
                        Join your classmates who are already excelling with our platform
                    </p>
                    <a href="/register" className="inline-block bg-white text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50">
                        Get Started Free
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-50 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-4">
                            <BookOpen className="h-8 w-8 text-indigo-600" />
                            <span className="ml-2 text-xl font-semibold text-gray-900">
                                Classroom Assignment Portal
                            </span>
                        </div>
                        <div className="flex justify-center space-x-6 text-sm">
                            <a href="/privacy-policy" className="text-gray-600 hover:text-indigo-600">Privacy Policy</a>
                            <a href="/terms-of-service" className="text-gray-600 hover:text-indigo-600">Terms of Service</a>
                            <a href="/contact" className="text-gray-600 hover:text-indigo-600">Contact</a>
                            <a href="/help-center" className="text-gray-600 hover:text-indigo-600">Help Center</a>
                        </div>
                        <p className="text-center text-gray-500 text-sm mt-4">
                            © 2025 Classroom Assignment Portal. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default ForStudents