"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAdminAuth } from "../../contexts/AdminAuthContext"
import { Shield, Search, UserPlus, Edit, Trash2, Eye, Mail, Calendar, Crown, User } from "lucide-react"
import { DashboardLayout, CardLayout } from "../Layout"
import { getAllAdmins, deleteAdmin, updateAdminRole } from "../../services/adminApi"
import { toast } from "react-toastify"

const AdminManagement = () => {
  const navigate = useNavigate()
  const { token, admin: currentAdmin } = useAdminAuth()
  const [admins, setAdmins] = useState([])
  const [filteredAdmins, setFilteredAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [adminToDelete, setAdminToDelete] = useState(null)

  useEffect(() => {
    fetchAdmins()
  }, [token])

  useEffect(() => {
    filterAdmins()
  }, [admins, searchTerm])

  const fetchAdmins = async () => {
    if (!token) {
      setError("No authentication token found")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log("Fetching admins with token:", token)

      const response = await getAllAdmins(token)
      console.log("Raw API response:", response)

      // Handle different response formats
      let adminsData = []

      if (Array.isArray(response)) {
        adminsData = response
      } else if (response && Array.isArray(response.admins)) {
        adminsData = response.admins
      } else if (response && Array.isArray(response.data)) {
        adminsData = response.data
      } else if (response && response.success && Array.isArray(response.admins)) {
        adminsData = response.admins
      } else {
        console.warn("Unexpected response format:", response)
        adminsData = []
      }

      // Filter out any null/undefined entries and validate required fields
      const validAdmins = adminsData.filter((admin) => {
        return admin && admin._id && typeof admin._id === "string" && admin.email && typeof admin.email === "string"
      })

      console.log("Valid admins after filtering:", validAdmins)
      setAdmins(validAdmins)
    } catch (error) {
      console.error("Error fetching admins:", error)
      setError("Failed to fetch admins: " + (error.message || "Unknown error"))
      toast.error("Failed to fetch admins")
      setAdmins([])
    } finally {
      setLoading(false)
    }
  }

  const filterAdmins = () => {
    if (!Array.isArray(admins)) {
      setFilteredAdmins([])
      return
    }

    let filtered = admins.filter((admin) => admin && admin._id) // Extra safety check

    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter((admin) => {
        if (!admin) return false

        const firstName = admin.firstName || ""
        const lastName = admin.lastName || ""
        const email = admin.email || ""

        return (
          firstName.toLowerCase().includes(searchLower) ||
          lastName.toLowerCase().includes(searchLower) ||
          email.toLowerCase().includes(searchLower)
        )
      })
    }

    setFilteredAdmins(filtered)
  }

  const handleDeleteAdmin = async (adminId) => {
    if (!adminId) {
      toast.error("Invalid admin ID")
      return
    }

    try {
      await deleteAdmin(adminId, token)
      setAdmins((prevAdmins) => prevAdmins.filter((admin) => admin && admin._id !== adminId))
      toast.success("Admin deleted successfully")
      setShowDeleteModal(false)
      setAdminToDelete(null)
    } catch (error) {
      toast.error("Failed to delete admin")
      console.error("Error deleting admin:", error)
    }
  }

  const handleRoleChange = async (adminId, newRole) => {
    if (!adminId || !newRole) {
      toast.error("Invalid admin ID or role")
      return
    }

    try {
      await updateAdminRole(adminId, newRole, token)
      setAdmins((prevAdmins) =>
        prevAdmins.map((admin) => (admin && admin._id === adminId ? { ...admin, role: newRole } : admin)),
      )
      toast.success("Admin role updated successfully")
    } catch (error) {
      toast.error("Failed to update admin role")
      console.error("Error updating admin role:", error)
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case "super_admin":
      case "super-admin":
        return <Crown className="w-4 h-4 text-yellow-500" />
      case "admin":
        return <Shield className="w-4 h-4 text-blue-500" />
      default:
        return <User className="w-4 h-4 text-gray-500" />
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case "super_admin":
      case "super-admin":
        return "bg-yellow-500 bg-opacity-20 text-yellow-400"
      case "admin":
        return "bg-blue-500 bg-opacity-20 text-blue-400"
      default:
        return "bg-gray-500 bg-opacity-20 text-gray-400"
    }
  }

  const sidebar = (
    <>
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mr-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Admins</h2>
            <p className="text-yellow-400">Manage administrators</p>
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
          onClick={() => navigate("/admin/admins")}
          className="flex items-center p-3 rounded-lg bg-yellow-600 bg-opacity-50 text-white w-full"
        >
          <Shield className="w-5 h-5 mr-3" />
          <span>All Admins</span>
        </button>
      </nav>
    </>
  )

  if (loading) {
    return (
      <DashboardLayout sidebar={sidebar}>
        <div className="p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
          <p className="text-white ml-4">Loading admins...</p>
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
              <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Admins</h2>
              <p className="text-red-300 mb-4">{error}</p>
              <button
                onClick={fetchAdmins}
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Admin Management</h1>
              <p className="text-gray-300 text-lg">Manage platform administrators ({filteredAdmins.length} total)</p>
            </div>
            <button
              onClick={() => navigate("/admin/admins/create")}
              className="flex items-center px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Add Admin
            </button>
          </div>

          {/* Search */}
          <CardLayout variant="dashboard" className="mb-6">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search admins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </CardLayout>

          {/* Admins Table */}
          <CardLayout variant="dashboard">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Admin</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Role</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Created</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmins.map((admin) => {
                    // Extra safety check for each admin
                    if (!admin || !admin._id) {
                      console.warn("Skipping invalid admin:", admin)
                      return null
                    }

                    return (
                      <tr key={admin._id} className="border-b border-gray-700 hover:bg-gray-700 hover:bg-opacity-30">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {(admin.firstName && admin.firstName[0]) || (admin.email && admin.email[0]) || "A"}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                {admin.firstName || "Unknown"} {admin.lastName || "Admin"}
                              </p>
                              <div className="flex items-center text-gray-400 text-sm">
                                <Mail className="w-4 h-4 mr-1" />
                                {admin.email || "No email"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            {currentAdmin?.role === "super_admin" || currentAdmin?.role === "super-admin" ? (
                              <select
                                value={admin.role || "admin"}
                                onChange={(e) => handleRoleChange(admin._id, e.target.value)}
                                className={`px-3 py-1 rounded-full text-sm border-0 focus:outline-none ${getRoleColor(
                                  admin.role,
                                )}`}
                                disabled={admin._id === currentAdmin._id}
                              >
                                <option value="admin">Admin</option>
                                <option value="super_admin">Super Admin</option>
                              </select>
                            ) : (
                              <div className={`px-3 py-1 rounded-full text-sm ${getRoleColor(admin.role)}`}>
                                {admin.role === "super_admin" || admin.role === "super-admin" ? "Super Admin" : "Admin"}
                              </div>
                            )}
                            {getRoleIcon(admin.role)}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center text-gray-300 text-sm">
                            <Calendar className="w-4 h-4 mr-2" />
                            {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "Unknown"}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => navigate(`/admin/admins/${admin._id}`)}
                              className="p-2 text-blue-400 hover:bg-blue-500 hover:bg-opacity-20 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/admin/admins/${admin._id}/edit`)}
                              className="p-2 text-green-400 hover:bg-green-500 hover:bg-opacity-20 rounded-lg transition-colors"
                              title="Edit Admin"
                              disabled={admin._id === currentAdmin?._id}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {admin._id !== currentAdmin?._id && (
                              <button
                                onClick={() => {
                                  setAdminToDelete(admin)
                                  setShowDeleteModal(true)
                                }}
                                className="p-2 text-red-400 hover:bg-red-500 hover:bg-opacity-20 rounded-lg transition-colors"
                                title="Delete Admin"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {filteredAdmins.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No admins found</p>
                  <p className="text-gray-500">
                    {searchTerm ? "Try adjusting your search" : "No administrators have been created yet"}
                  </p>
                </div>
              )}
            </div>
          </CardLayout>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && adminToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete admin{" "}
              <span className="font-semibold">
                {adminToDelete.firstName || "Unknown"} {adminToDelete.lastName || "Admin"}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setAdminToDelete(null)
                }}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteAdmin(adminToDelete._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default AdminManagement
