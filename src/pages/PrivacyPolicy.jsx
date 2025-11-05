import { BookOpen } from 'lucide-react'

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <BookOpen className="h-8 w-8 text-indigo-600" />
                            <a href="/" className="ml-2 text-xl font-semibold text-gray-900">
                                Gradely
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

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="prose prose-lg max-w-none">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
                    
                    <p className="text-gray-600 mb-8">
                        <strong>Last updated:</strong> January 1, 2025
                    </p>

                    <div className="space-y-8">
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
                            <p className="text-gray-700 mb-4">
                                We collect information you provide directly to us, such as when you create an account, 
                                submit assignments, or contact us for support.
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Personal information (name, email address, student/teacher ID)</li>
                                <li>Academic information (assignments, grades, class enrollment)</li>
                                <li>Usage data (how you interact with our platform)</li>
                                <li>Device information (browser type, IP address)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
                            <p className="text-gray-700 mb-4">
                                We use the information we collect to:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Provide and maintain our educational services</li>
                                <li>Process assignments and manage grades</li>
                                <li>Communicate with you about your account and assignments</li>
                                <li>Improve our platform and develop new features</li>
                                <li>Ensure security and prevent fraud</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
                            <p className="text-gray-700 mb-4">
                                We do not sell, trade, or otherwise transfer your personal information to third parties, except:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>With your explicit consent</li>
                                <li>To comply with legal obligations</li>
                                <li>To protect our rights and safety</li>
                                <li>With service providers who assist in our operations</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
                            <p className="text-gray-700">
                                We implement appropriate security measures to protect your personal information against 
                                unauthorized access, alteration, disclosure, or destruction. However, no method of 
                                transmission over the internet is 100% secure.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
                            <p className="text-gray-700 mb-4">
                                You have the right to:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Access your personal information</li>
                                <li>Correct inaccurate information</li>
                                <li>Delete your account and associated data</li>
                                <li>Opt out of certain communications</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Contact Us</h2>
                            <p className="text-gray-700">
                                If you have any questions about this Privacy Policy, please contact us at:
                            </p>
                            <div className="bg-gray-50 p-4 rounded-lg mt-4">
                                <p className="text-gray-700">
                                    Email: support@gradely.site<br />
                                    Address: 304, Diamond Plaza Hiran Magri Sector - 5 Udaipur, Rajasthan<br />
                                    Phone: +91 9664049426
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-50 border-t border-gray-200 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-4">
                            <BookOpen className="h-8 w-8 text-indigo-600" />
                            <span className="ml-2 text-xl font-semibold text-gray-900">
                                Gradely
                            </span>
                        </div>
                        <div className="flex justify-center space-x-6 text-sm">
                            <a href="/privacy-policy" className="text-indigo-600 font-medium">Privacy Policy</a>
                            <a href="/terms-of-service" className="text-gray-600 hover:text-indigo-600">Terms of Service</a>
                            <a href="/contact" className="text-gray-600 hover:text-indigo-600">Contact</a>
                            <a href="/help-center" className="text-gray-600 hover:text-indigo-600">Help Center</a>
                        </div>
                        <p className="text-center text-gray-500 text-sm mt-4">
                            © 2025 Gradely. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default PrivacyPolicy