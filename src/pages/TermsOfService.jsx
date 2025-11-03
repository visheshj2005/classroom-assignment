import { BookOpen } from 'lucide-react'

const TermsOfService = () => {
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

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="prose prose-lg max-w-none">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
                    
                    <p className="text-gray-600 mb-8">
                        <strong>Last updated:</strong> January 1, 2025
                    </p>

                    <div className="space-y-8">
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                            <p className="text-gray-700">
                                By accessing and using the Classroom Assignment Portal, you accept and agree to be bound 
                                by the terms and provision of this agreement. If you do not agree to abide by the above, 
                                please do not use this service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use License</h2>
                            <p className="text-gray-700 mb-4">
                                Permission is granted to temporarily use the Classroom Assignment Portal for personal, 
                                educational purposes. This is the grant of a license, not a transfer of title, and under this license you may not:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Modify or copy the materials</li>
                                <li>Use the materials for any commercial purpose or for any public display</li>
                                <li>Attempt to reverse engineer any software contained on the platform</li>
                                <li>Remove any copyright or other proprietary notations from the materials</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
                            <p className="text-gray-700 mb-4">
                                When you create an account with us, you must provide information that is accurate, 
                                complete, and current at all times. You are responsible for:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Safeguarding your password and account information</li>
                                <li>All activities that occur under your account</li>
                                <li>Notifying us immediately of any unauthorized use</li>
                                <li>Ensuring your account information remains current</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
                            <p className="text-gray-700 mb-4">
                                You agree not to use the platform to:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Upload or share inappropriate, offensive, or illegal content</li>
                                <li>Violate any applicable laws or regulations</li>
                                <li>Infringe on the rights of others</li>
                                <li>Attempt to gain unauthorized access to other accounts</li>
                                <li>Interfere with the proper functioning of the platform</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Academic Integrity</h2>
                            <p className="text-gray-700">
                                Users must maintain academic integrity when using our platform. This includes submitting 
                                original work, properly citing sources, and not engaging in plagiarism or cheating. 
                                Violations may result in account suspension or termination.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Content Ownership</h2>
                            <p className="text-gray-700">
                                You retain ownership of content you submit to the platform. However, by submitting content, 
                                you grant us a license to use, store, and display that content as necessary to provide our services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Termination</h2>
                            <p className="text-gray-700">
                                We may terminate or suspend your account immediately, without prior notice or liability, 
                                for any reason whatsoever, including without limitation if you breach the Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Disclaimer</h2>
                            <p className="text-gray-700">
                                The materials on the Classroom Assignment Portal are provided on an 'as is' basis. 
                                We make no warranties, expressed or implied, and hereby disclaim and negate all other 
                                warranties including without limitation, implied warranties or conditions of merchantability, 
                                fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Information</h2>
                            <p className="text-gray-700">
                                If you have any questions about these Terms of Service, please contact us at:
                            </p>
                            <div className="bg-gray-50 p-4 rounded-lg mt-4">
                                <p className="text-gray-700">
                                    Email: legal@classroomportal.com<br />
                                    Address: [Your Company Address]<br />
                                    Phone: [Your Phone Number]
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
                                Classroom Assignment Portal
                            </span>
                        </div>
                        <div className="flex justify-center space-x-6 text-sm">
                            <a href="/privacy-policy" className="text-gray-600 hover:text-indigo-600">Privacy Policy</a>
                            <a href="/terms-of-service" className="text-indigo-600 font-medium">Terms of Service</a>
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

export default TermsOfService