import { BookOpen, Search, Book, Users, Settings, MessageCircle, ChevronRight } from 'lucide-react'

const HelpCenter = () => {
    const categories = [
        {
            icon: Book,
            title: "Getting Started",
            description: "Learn the basics of using our platform",
            articles: [
                "How to create your first account",
                "Setting up your profile",
                "Understanding the dashboard",
                "Basic navigation guide"
            ]
        },
        {
            icon: Users,
            title: "For Students",
            description: "Everything students need to know",
            articles: [
                "How to submit assignments",
                "Viewing your grades",
                "Joining a class",
                "Managing deadlines"
            ]
        },
        {
            icon: Settings,
            title: "For Teachers",
            description: "Tools and guides for educators",
            articles: [
                "Creating assignments",
                "Grading submissions",
                "Managing your classes",
                "Setting up class enrollment"
            ]
        },
        {
            icon: MessageCircle,
            title: "Troubleshooting",
            description: "Solutions to common issues",
            articles: [
                "Login problems",
                "File upload issues",
                "Password reset",
                "Browser compatibility"
            ]
        }
    ]

    const faqs = [
        {
            question: "How do I reset my password?",
            answer: "Click on 'Forgot Password' on the login page, enter your email address, and follow the instructions sent to your email."
        },
        {
            question: "Can I submit assignments after the deadline?",
            answer: "Late submissions depend on your teacher's settings. Some may allow late submissions with penalties, while others may not accept them at all."
        },
        {
            question: "What file formats are supported for assignments?",
            answer: "We support most common file formats including PDF, DOC, DOCX, TXT, JPG, PNG, and many others. You can also submit assignments via URL links."
        },
        {
            question: "How do I join a class?",
            answer: "Your teacher will provide you with a class code or invite you directly. You can enter the class code in your dashboard or accept the email invitation."
        },
        {
            question: "Can I edit my submission after submitting?",
            answer: "This depends on your teacher's settings. Some assignments allow resubmissions before the deadline, while others do not."
        }
    ]

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

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-indigo-50 to-blue-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Help <span className="text-indigo-600">Center</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                            Find answers to your questions and learn how to make the most of our platform.
                        </p>
                        
                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search for help articles..."
                                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
                        <p className="text-xl text-gray-600">Find the help you need organized by topic</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {categories.map((category, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
                                <div className="flex items-center mb-6">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                                        <category.icon className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900">{category.title}</h3>
                                        <p className="text-gray-600">{category.description}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    {category.articles.map((article, articleIndex) => (
                                        <a
                                            key={articleIndex}
                                            href="#"
                                            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                                        >
                                            <span className="text-gray-700 group-hover:text-indigo-600">{article}</span>
                                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="bg-gray-50 py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                        <p className="text-xl text-gray-600">Quick answers to common questions</p>
                    </div>

                    <div className="space-y-6">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Support Section */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Still Need Help?</h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Can't find what you're looking for? Our support team is here to help.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/contact"
                            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
                        >
                            Contact Support
                        </a>
                        <a
                            href="mailto:support@gradely.site"
                            className="inline-block border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
                        >
                            Email Us
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-50 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-4">
                            <BookOpen className="h-8 w-8 text-indigo-600" />
                            <span className="ml-2 text-xl font-semibold text-gray-900">
                                Gradely
                            </span>
                        </div>
                        <div className="flex justify-center space-x-6 text-sm">
                            <a href="/privacy-policy" className="text-gray-600 hover:text-indigo-600">Privacy Policy</a>
                            <a href="/terms-of-service" className="text-gray-600 hover:text-indigo-600">Terms of Service</a>
                            <a href="/contact" className="text-gray-600 hover:text-indigo-600">Contact</a>
                            <a href="/help-center" className="text-indigo-600 font-medium">Help Center</a>
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

export default HelpCenter