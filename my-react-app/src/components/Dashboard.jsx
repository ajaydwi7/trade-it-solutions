"use client"

import React, { useState, useEffect } from "react"
import { useNavigate, NavLink } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import {
  User,
  Briefcase,
  Users,
  BookOpen,
  Settings,
  LogOut,
  UserCircle,
  CheckCircle,
  Clock,
  Mail,
  AlertCircle,
  Phone,
  MapPin
} from "lucide-react"
import { getApplication } from "../services/api"

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, formData, applicationStatus, logout, token } = useAuth()
  const [profilePhoto, setProfilePhoto] = useState(null)

  useEffect(() => {
    const fetchProfilePhoto = async () => {
      if (user?._id && token) {
        try {
          const application = await getApplication(user._id, token)
          setProfilePhoto(application.application?.optional?.profilePhoto || null);
        } catch (e) {
          setProfilePhoto(null)
        }
      }
    }
    fetchProfilePhoto()
  }, [user, token])

  const getStatusIcon = (status) => {
    switch (status) {
      case "In Review":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "Accepted":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "Confirmation Email Sent":
        return <Mail className="w-5 h-5 text-blue-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "In Review":
        return "text-yellow-500 bg-yellow-500 bg-opacity-20"
      case "Accepted":
        return "text-green-500 bg-green-500 bg-opacity-20"
      case "Confirmation Email Sent":
        return "text-blue-500 bg-blue-500 bg-opacity-20"
      default:
        return "text-gray-500 bg-gray-500 bg-opacity-20"
    }
  }

  const sidebarItems = [
    {
      icon: User,
      label: "Personal Information",
      status: "complete",
      color: "green",
      onClick: () => { } // Could navigate to edit profile
    },
    {
      icon: Briefcase,
      label: "Application Status",
      status: applicationStatus ? "complete" : "incomplete",
      color: applicationStatus ? "green" : "orange",
      onClick: () => { } // Could show application details
    },
    {
      icon: Users,
      label: "Community",
      status: null,
      onClick: () => { } // Could navigate to community
    },
    {
      icon: BookOpen,
      label: "Courses",
      status: null,
      onClick: () => { } // Could navigate to courses
    },
    {
      icon: Settings,
      label: "Settings",
      status: null,
      onClick: () => { } // Could navigate to settings
    },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const calculateProfileCompletion = () => {
    let completed = 0;
    let total = 0;

    // --- Personal Info Step ---
    if (formData.name) completed++;
    total++;
    if (formData.email) completed++;
    total++;
    if (formData.phone) completed++;
    total++;
    if (formData.address) completed++;
    total++;

    // --- Terms Step ---
    if (formData.agreedToTerms) completed++;
    total++;

    // --- Auth Step ---
    // If user is registered, count as complete
    if (user && user._id) completed++;
    total++;

    // --- Application Form Steps ---
    if (formData.warmUp?.animalQuestion) completed++;
    total++;
    if (formData.commitment?.canCommit) completed++;
    total++;
    if (formData.purpose?.whyTrade) completed++;
    total++;
    if (formData.exclusivity?.preparedInvestment) completed++;
    total++;

    // Optional: Profile Photo (uncomment if you want to count it)
    // if (formData.profilePhoto) completed++;
    // total++;

    return Math.round((completed / total) * 100);
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

      <div className="relative z-10 min-h-screen flex">
        {/* Sidebar */}
        <div className="w-80 bg-gray-800 bg-opacity-50 backdrop-blur-sm border-r border-gray-700 p-6">
          {/* Profile Section */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center mr-4 overflow-hidden">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    className="w-16 h-16 object-cover rounded-full"
                  />
                ) : (
                  <UserCircle className="w-10 h-10 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Hi {user?.firstName || formData.name?.split(' ')[0] || 'User'}
                </h2>
                <p className="text-blue-400">
                  {user?.email || formData.email || 'user@example.com'}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${calculateProfileCompletion()}%` }}
                ></div>
              </div>
            </div>

            <p className="text-gray-300 text-sm">
              Your profile is <span className="text-green-400 font-semibold">{calculateProfileCompletion()}%</span> complete
            </p>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-2 mb-8">
            <NavLink to="/dashboard/personal" className="flex items-center p-3 rounded-lg bg-gray-700 bg-opacity-30 hover:bg-opacity-50 transition-colors text-white" activeClassName="bg-opacity-50 font-bold">
              <User className="w-5 h-5 text-gray-300 mr-3" />
              Personal Information
            </NavLink>
            <NavLink to="/dashboard/professional" className="flex items-center p-3 rounded-lg bg-gray-700 bg-opacity-30 hover:bg-opacity-50 transition-colors text-white" activeClassName="bg-opacity-50 font-bold">
              <Briefcase className="w-5 h-5 text-gray-300 mr-3" />
              Professional Information
            </NavLink>
            <NavLink to="/dashboard/settings" className="flex items-center p-3 rounded-lg bg-gray-700 bg-opacity-30 hover:bg-opacity-50 transition-colors text-white" activeClassName="bg-opacity-50 font-bold">
              <Settings className="w-5 h-5 text-gray-300 mr-3" />
              Settings
            </NavLink>
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center p-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 hover:bg-opacity-30 transition-colors w-full"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Log out
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Welcome Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome back, {user?.firstName || formData.name?.split(' ')[0] || 'User'}!
              </h1>
              <p className="text-gray-300 text-lg">
                Here's an overview of your trading journey with us.
              </p>
            </div>

            {/* Application Status Card */}
            <div className="bg-gray-800 bg-opacity-30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Briefcase className="w-6 h-6 mr-3" />
                  Application Status
                </h2>
                {getStatusIcon(applicationStatus)}
              </div>

              <div className="flex items-center space-x-4">
                <div className={`px-4 py-2 rounded-full ${getStatusColor(applicationStatus)}`}>
                  <span className="font-semibold">
                    {applicationStatus || "Pending"}
                  </span>
                </div>

                <div className="text-gray-300">
                  {applicationStatus === "In Review" && "Your application is being reviewed by our team."}
                  {applicationStatus === "Accepted" && "Congratulations! Your application has been accepted."}
                  {applicationStatus === "Confirmation Email Sent" && "Check your email for next steps."}
                  {!applicationStatus && "Your application status will appear here."}
                </div>
              </div>
            </div>

            {/* Personal Information Card */}
            <div className="bg-gray-800 bg-opacity-30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-8">
              <h2 className="text-2xl font-bold text-white flex items-center mb-6">
                <User className="w-6 h-6 mr-3" />
                Personal Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Full Name</p>
                      <p className="text-white font-medium">
                        {user?.firstName && user?.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Email</p>
                      <p className="text-white font-medium">
                        {user?.email || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Phone</p>
                      <p className="text-white font-medium">
                        {user?.phone || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Location</p>
                      <p className="text-white font-medium">
                        {user?.address || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Course Access */}
              <div className="bg-gray-800 bg-opacity-30 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:bg-opacity-40 transition-colors cursor-pointer">
                <div className="flex items-center mb-4">
                  <BookOpen className="w-8 h-8 text-blue-500 mr-3" />
                  <h3 className="text-xl font-bold text-white">Courses</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Access your trading courses and learning materials.
                </p>
                <button className="text-blue-400 hover:text-blue-300 font-medium">
                  View Courses →
                </button>
              </div>

              {/* Community */}
              <div className="bg-gray-800 bg-opacity-30 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:bg-opacity-40 transition-colors cursor-pointer">
                <div className="flex items-center mb-4">
                  <Users className="w-8 h-8 text-green-500 mr-3" />
                  <h3 className="text-xl font-bold text-white">Community</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Connect with fellow traders and share experiences.
                </p>
                <button className="text-green-400 hover:text-green-300 font-medium">
                  Join Community →
                </button>
              </div>

              {/* Settings */}
              <div className="bg-gray-800 bg-opacity-30 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:bg-opacity-40 transition-colors cursor-pointer">
                <div className="flex items-center mb-4">
                  <Settings className="w-8 h-8 text-purple-500 mr-3" />
                  <h3 className="text-xl font-bold text-white">Settings</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Manage your account settings and preferences.
                </p>
                <button className="text-purple-400 hover:text-purple-300 font-medium">
                  Open Settings →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Profile Button */}
        <div className="fixed bottom-6 right-6">
          <button className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors">
            <UserCircle className="w-8 h-8 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

