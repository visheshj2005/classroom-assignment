import { BookOpen, Users, CheckCircle, Clock, BarChart3, FileText, MessageSquare, Shield } from 'lucide-react'

const ForTeachers = () => {
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
            <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Empower Your <span className="text-blue-600">Teaching</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                            Create, manage, and grade assignments with ease. Our platform gives you the tools to focus on what matters most - teaching.
                        </p>
                        <a href="/register" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold">
                            Start Teaching Today
                        </a>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Everything You Need to Teach Effectively
                        </h2>
                        <p className="text-xl text-gray-600">
                            Streamline your workflow with powerful teaching tools
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                                <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Easy Assignment Creation</h3>
                            <p className="text-gray-600">Create assignments in minutes with our intuitive interface. Set deadlines, add instructions, and customize submission types.</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Online Grading</h3>
                            <p className="text-gray-600">Grade submissions directly in the platform. Provide feedback, assign scores, and track student progress effortlessly.</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                                <Users className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Class Management</h3>
                            <p className="text-gray-600">Organize your classes, manage student enrollment, and keep track of all your courses in one centralized location.</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-6">
                                <BarChart3 className="h-6 w-6 text-yellow-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Analytics & Insights</h3>
                            <p className="text-gray-600">Get detailed insights into student performance, assignment completion rates, and class engagement metrics.</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                                <MessageSquare className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Student Communication</h3>
                            <p className="text-gray-600">Communicate with students through feedback, announcements, and direct messaging within the platform.</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                                <Shield className="h-6 w-6 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Secure & Reliable</h3>
                            <p className="text-gray-600">Your data is protected with enterprise-grade security. Reliable uptime ensures your classes run smoothly.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-blue-600 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Ready to Transform Your Teaching?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join thousands of educators who are already using our platform
                    </p>
                    <a href="/register" className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50">
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

export default ForTeachers