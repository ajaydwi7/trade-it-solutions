"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAdminAuth } from "../../contexts/AdminAuthContext"
import { FileText, Search, Filter, Eye, CheckCircle, XCircle, Clock, Calendar, Mail, Phone } from "lucide-react"
import { DashboardLayout, CardLayout } from "../Layout"
import { getAllApplications, updateApplicationStatus } from "../../services/adminApi"
import { toast } from "react-toastify"

const ApplicationsManagement = () => {
  const navigate = useNavigate()
  const { token } = useAdminAuth() // Fixed: Use useAdminAuth instead of useAuth
  const [applications, setApplications] = useState([])
  const [filteredApplications, setFilteredApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchApplications()
  }, [token])

  useEffect(() => {
    filterApplications()
  }, [applications, searchTerm, statusFilter])

  const fetchApplications = async () => {
    if (!token) {
      setError("No authentication token found")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log("Fetching applications with token:", token)

      const response = await getAllApplications(token)
      console.log("Raw API response:", response)

      // Handle different response formats
      let applicationsData = []

      if (Array.isArray(response)) {
        applicationsData = response
      } else if (response && Array.isArray(response.applications)) {
        applicationsData = response.applications
      } else if (response && Array.isArray(response.data)) {
        applicationsData = response.data
      } else if (response && response.success && Array.isArray(response.data)) {
        applicationsData = response.data
      } else {
        console.warn("Unexpected response format:", response)
        applicationsData = []
      }

      // Filter out any null/undefined entries and validate required fields
      const validApplications = applicationsData.filter((app) => {
        return app && app._id && typeof app._id === "string"
      })

      console.log("Valid applications after filtering:", validApplications)
      setApplications(validApplications)
    } catch (error) {
      console.error("Error fetching applications:", error)
      setError("Failed to fetch applications: " + (error.message || "Unknown error"))
      toast.error("Failed to fetch applications")
      setApplications([])
    } finally {
      setLoading(false)
    }
  }

  const filterApplications = () => {
    if (!Array.isArray(applications)) {
      setFilteredApplications([])
      return
    }

    let filtered = applications.filter((app) => app && app._id) // Extra safety check

    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter((app) => {
        if (!app) return false

        const firstName = app.user?.firstName || ""
        const lastName = app.user?.lastName || ""
        const email = app.user?.email || ""

        return (
          firstName.toLowerCase().includes(searchLower) ||
          lastName.toLowerCase().includes(searchLower) ||
          email.toLowerCase().includes(searchLower)
        )
      })
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter)
    }

    setFilteredApplications(filtered)
  }

  const handleStatusChange = async (applicationId, newStatus) => {
    if (!applicationId || !newStatus) {
      toast.error("Invalid application ID or status")
      return
    }

    try {
      await updateApplicationStatus(applicationId, newStatus, token)
      setApplications((prevApps) =>
        prevApps.map((app) => (app && app._id === applicationId ? { ...app, status: newStatus } : app)),
      )
      toast.success("Application status updated successfully")
    } catch (error) {
      toast.error("Failed to update application status")
      console.error("Error updating application status:", error)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "In Review":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "Accepted":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "Rejected":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "In Review":
        return "bg-yellow-500 bg-opacity-20 text-yellow-400"
      case "Accepted":
        return "bg-green-500 bg-opacity-20 text-green-400"
      case "Rejected":
        return "bg-red-500 bg-opacity-20 text-red-400"
      default:
        return "bg-gray-500 bg-opacity-20 text-gray-400"
    }
  }

  const sidebar = (
    <>
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-4">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Applications</h2>
            <p className="text-green-400">Review submissions</p>
          </div>
        </div>
      </div>

      <nav className="space-y-2 mb-8">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="flex items-center p-3 rounded-lg bg-gray-700 bg-opacity-30 hover:bg-opacity-50 transition-colors text-white w-full"
        >
          <span>← Back to Dashboard</span>
        </button>

        <button
          onClick={() => navigate("/admin/applications")}
          className="flex items-center p-3 rounded-lg bg-green-600 bg-opacity-50 text-white w-full"
        >
          <FileText className="w-5 h-5 mr-3" />
          <span>All Applications</span>
        </button>
      </nav>
    </>
  )

  if (loading) {
    return (
      <DashboardLayout sidebar={sidebar}>
        <div className="p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
          <p className="text-white ml-4">Loading applications...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout sidebar={sidebar}>
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-6 text-center">
              <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Applications</h2>
              <p className="text-red-300 mb-4">{error}</p>
              <button
                onClick={fetchApplications}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout sidebar={sidebar}>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Applications Management</h1>
            <p className="text-gray-300 text-lg">
              Review and manage user applications ({filteredApplications.length} total)
            </p>
          </div>

          {/* Filters */}
          <CardLayout variant="dashboard" className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="In Review">In Review</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
          </CardLayout>

          {/* Applications Table */}
          <CardLayout variant="dashboard">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Applicant</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Contact</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Status</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Submitted</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((application) => {
                    // Extra safety check for each application
                    if (!application || !application._id) {
                      console.warn("Skipping invalid application:", application)
                      return null
                    }

                    return (
                      <tr
                        key={application._id}
                        className="border-b border-gray-700 hover:bg-gray-700 hover:bg-opacity-30"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {(application.user?.firstName && application.user.firstName[0]) ||
                                  (application.user?.email && application.user.email[0]) ||
                                  "U"}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                {application.user?.firstName || "Unknown"} {application.user?.lastName || "User"}
                              </p>
                              <p className="text-gray-400 text-sm">{application.user?.email || "No email"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            {application.user?.phone && (
                              <div className="flex items-center text-gray-300 text-sm">
                                <Phone className="w-4 h-4 mr-2" />
                                {application.user.phone}
                              </div>
                            )}
                            <div className="flex items-center text-gray-300 text-sm">
                              <Mail className="w-4 h-4 mr-2" />
                              {application.user?.email || "No email"}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <select
                              value={application.status || "In Review"}
                              onChange={(e) => handleStatusChange(application._id, e.target.value)}
                              className={`px-3 py-1 rounded-full text-sm border-0 focus:outline-none ${getStatusColor(
                                application.status,
                              )}`}
                            >
                              <option value="In Review">In Review</option>
                              <option value="Accepted">Accepted</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                            {getStatusIcon(application.status)}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center text-gray-300 text-sm">
                            <Calendar className="w-4 h-4 mr-2" />
                            {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : "Unknown"}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => navigate(`/admin/applications/${application._id}`)}
                            className="flex items-center px-3 py-1 bg-blue-600 bg-opacity-20 text-blue-400 rounded-lg hover:bg-opacity-30 transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Review
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {filteredApplications.length === 0 && !loading && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No applications found</p>
                  <p className="text-gray-500">
                    {searchTerm ? "Try adjusting your search" : "No applications have been submitted yet"}
                  </p>
                </div>
              )}
            </div>
          </CardLayout>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ApplicationsManagement
