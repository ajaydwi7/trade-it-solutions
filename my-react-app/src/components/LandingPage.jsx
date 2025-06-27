"use client"

import React from "react"
import { useNavigate } from "react-router-dom"
import { UserPlus, LogIn, ArrowRight } from "lucide-react"

const LandingPage = () => {
  const navigate = useNavigate()

  const handleStartApplication = () => {
    navigate('/onboarding/personal-info/1')
  }

  const handleStudentLogin = () => {
    navigate('/auth')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0 hidden md:block">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WEB%20BACKGROUND.png-OZ4OMdtxyVzgNZTsKH6DnBI8zA47Ol.jpeg"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 md:hidden">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MOBILE%20BACKGROUND.jpg-PHaF8vfpeVmOjN6jtm4jvvI91pnyCR.jpeg"
          alt="Mobile Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Welcome to Our Platform
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of successful traders and take your trading journey to the next level
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* New User Card */}
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20 hover:bg-opacity-15 transition-all duration-300 group">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Start Application</h2>
                <p className="text-gray-300 mb-6">
                  Begin your journey with our comprehensive application process. We'll guide you through every step to ensure you're ready for success.
                </p>
              </div>
              <button
                onClick={handleStartApplication}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center group-hover:scale-105"
              >
                Start Application
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>

            {/* Existing User Card */}
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20 hover:bg-opacity-15 transition-all duration-300 group">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogIn className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Student Login</h2>
                <p className="text-gray-300 mb-6">
                  Already a student? Sign in to access your dashboard and continue your trading journey with us.
                </p>
              </div>
              <button
                onClick={handleStudentLogin}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-green-700 hover:to-teal-700 transition-all duration-300 flex items-center justify-center group-hover:scale-105"
              >
                Student Login
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-gray-400">
            <p className="text-sm">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage

