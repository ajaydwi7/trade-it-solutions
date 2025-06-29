"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAdminAuth } from "../../contexts/AdminAuthContext"
import {
  Users,
  FileText,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus,
  Activity,
  BarChart3,
  LogOut,
} from "lucide-react"
import { DashboardLayout, CardLayout } from "../Layout"
import { getAdminStats, getRecentApplications } from "../../services/adminApi"

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { admin, token, logout } = useAdminAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    totalAdmins: 0,
  })
  const [recentApplications, setRecentApplications] = useState([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, applicationsData] = await Promise.all([getAdminStats(token), getRecentApplications(token, 5)])
        setStats(statsData)
        setRecentApplications(applicationsData)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchDashboardData()
    }
  }, [token])

  const getStatusIcon = (status) => {
    switch (status) {
      case "In Review":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "Accepted":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "Rejected":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "In Review":
        return "text-yellow-500 bg-yellow-500 bg-opacity-20"
      case "Accepted":
        return "text-green-500 bg-green-500 bg-opacity-20"
      case "Rejected":
        return "text-red-500 bg-red-500 bg-opacity-20"
      default:
        return "text-gray-500 bg-gray-500 bg-opacity-20"
    }
  }

  const sidebar = (
    <>
      {/* Admin Profile Section */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
            <p className="text-purple-400">{admin?.email || "admin@example.com"}</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="space-y-2 mb-8">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="flex items-center justify-between p-3 rounded-lg bg-purple-600 bg-opacity-50 text-white w-full"
        >
          <div className="flex items-center">
            <BarChart3 className="w-5 h-5 text-gray-300 mr-3" />
            <span>Dashboard</span>
          </div>
        </button>

        <button
          onClick={() => navigate("/admin/users")}
          className="flex items-center p-3 rounded-lg bg-gray-700 bg-opacity-30 hover:bg-opacity-50 transition-colors text-white w-full"
        >
          <Users className="w-5 h-5 text-gray-300 mr-3" />
          <span>Users Management</span>
        </button>

        <button
          onClick={() => navigate("/admin/applications")}
          className="flex items-center p-3 rounded-lg bg-gray-700 bg-opacity-30 hover:bg-opacity-50 transition-colors text-white w-full"
        >
          <FileText className="w-5 h-5 text-gray-300 mr-3" />
          <span>Applications</span>
        </button>

        <button
          onClick={() => navigate("/admin/admins")}
          className="flex items-center p-3 rounded-lg bg-gray-700 bg-opacity-30 hover:bg-opacity-50 transition-colors text-white w-full"
        >
          <Shield className="w-5 h-5 text-gray-300 mr-3" />
          <span>Admin Management</span>
        </button>

        <button
          onClick={() => navigate("/admin/settings")}
          className="flex items-center p-3 rounded-lg bg-gray-700 bg-opacity-30 hover:bg-opacity-50 transition-colors text-white w-full"
        >
          <Activity className="w-5 h-5 text-gray-300 mr-3" />
          <span>Settings</span>
        </button>
        <button
          onClick={logout}
          className="flex items-center p-3 rounded-lg bg-red-600 bg-opacity-50 text-white w-full mt-4"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Logout</span>
        </button>
      </nav>
    </>
  )

  if (loading) {
    return (
      <DashboardLayout sidebar={sidebar}>
        <div className="p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout sidebar={sidebar}>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-300 text-lg">Overview of platform statistics and recent activity.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <CardLayout variant="dashboard" className="hover:bg-opacity-40 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardLayout>

            <CardLayout variant="dashboard" className="hover:bg-opacity-40 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Applications</p>
                  <p className="text-3xl font-bold text-white">{stats.totalApplications}</p>
                </div>
                <FileText className="w-8 h-8 text-green-500" />
              </div>
            </CardLayout>

            <CardLayout variant="dashboard" className="hover:bg-opacity-40 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Pending Review</p>
                  <p className="text-3xl font-bold text-white">{stats.pendingApplications}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardLayout>

            <CardLayout variant="dashboard" className="hover:bg-opacity-40 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Admins</p>
                  <p className="text-3xl font-bold text-white">{stats.totalAdmins}</p>
                </div>
                <Shield className="w-8 h-8 text-purple-500" />
              </div>
            </CardLayout>
          </div>

          {/* Application Status Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <CardLayout variant="dashboard" title="Application Status Breakdown">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-white">Accepted</span>
                  </div>
                  <span className="text-green-400 font-semibold">{stats.acceptedApplications}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-yellow-500 mr-3" />
                    <span className="text-white">In Review</span>
                  </div>
                  <span className="text-yellow-400 font-semibold">{stats.pendingApplications}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <XCircle className="w-5 h-5 text-red-500 mr-3" />
                    <span className="text-white">Rejected</span>
                  </div>
                  <span className="text-red-400 font-semibold">{stats.rejectedApplications}</span>
                </div>
              </div>
            </CardLayout>

            <CardLayout variant="dashboard" title="Quick Actions">
              <div className="space-y-4">
                <button
                  onClick={() => navigate("/admin/users")}
                  className="w-full flex items-center justify-between p-4 bg-blue-600 bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                >
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-blue-400 mr-3" />
                    <span className="text-white">Manage Users</span>
                  </div>
                  <span className="text-blue-400">→</span>
                </button>

                <button
                  onClick={() => navigate("/admin/applications")}
                  className="w-full flex items-center justify-between p-4 bg-green-600 bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                >
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-green-400 mr-3" />
                    <span className="text-white">Review Applications</span>
                  </div>
                  <span className="text-green-400">→</span>
                </button>

                <button
                  onClick={() => navigate("/admin/admins/create")}
                  className="w-full flex items-center justify-between p-4 bg-purple-600 bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                >
                  <div className="flex items-center">
                    <UserPlus className="w-5 h-5 text-purple-400 mr-3" />
                    <span className="text-white">Create Admin</span>
                  </div>
                  <span className="text-purple-400">→</span>
                </button>
              </div>
            </CardLayout>
          </div>

          {/* Recent Applications */}
          <CardLayout variant="dashboard" title="Recent Applications">
            <div className="space-y-4">
              {recentApplications.length > 0 ? (
                recentApplications.map((application) => (
                  <div
                    key={application._id}
                    className="flex items-center justify-between p-4 bg-gray-700 bg-opacity-30 rounded-lg hover:bg-opacity-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/applications/${application._id}`)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {application.user?.firstName?.[0] || "U"}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {application.user?.firstName} {application.user?.lastName}
                        </p>
                        <p className="text-gray-400 text-sm">{application.user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className={`px-3 py-1 rounded-full text-sm ${getStatusColor(application.status)}`}>
                        {application.status}
                      </div>
                      {getStatusIcon(application.status)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No recent applications</p>
                </div>
              )}
            </div>
          </CardLayout>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AdminDashboard
