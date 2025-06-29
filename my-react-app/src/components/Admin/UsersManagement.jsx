"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { Users, Search, Filter, Edit, Trash2, Eye, UserPlus, Phone, MapPin, Calendar } from "lucide-react"
import { DashboardLayout, CardLayout } from "../Layout"
import { getAllUsers, deleteUser, updateUserStatus } from "../../services/adminApi"
import { toast } from "react-toastify"

const UsersManagement = () => {
  const navigate = useNavigate()
  const { token } = useAdminAuth()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUsers, setSelectedUsers] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [token])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, statusFilter])

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers(token)
      setUsers(data)
    } catch (error) {
      toast.error("Failed to fetch users")
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId, token)
      setUsers(users.filter((user) => user._id !== userId))
      toast.success("User deleted successfully")
      setShowDeleteModal(false)
      setUserToDelete(null)
    } catch (error) {
      toast.error("Failed to delete user")
      console.error("Error deleting user:", error)
    }
  }

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await updateUserStatus(userId, newStatus, token)
      setUsers(users.map((user) => (user._id === userId ? { ...user, status: newStatus } : user)))
      toast.success("User status updated successfully")
    } catch (error) {
      toast.error("Failed to update user status")
      console.error("Error updating user status:", error)
    }
  }

  const sidebar = (
    <>
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4">
            <Users className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Users</h2>
            <p className="text-purple-400">Manage platform users</p>
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
          onClick={() => navigate("/admin/users")}
          className="flex items-center p-3 rounded-lg bg-blue-600 bg-opacity-50 text-white w-full"
        >
          <Users className="w-5 h-5 mr-3" />
          <span>All Users</span>
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
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Users Management</h1>
              <p className="text-gray-300 text-lg">Manage and monitor all platform users</p>
            </div>
            <button
              onClick={() => navigate("/admin/users/create")}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Add User
            </button>
          </div>

          {/* Filters */}
          <CardLayout variant="dashboard" className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search users..."
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
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>
          </CardLayout>

          {/* Users Table */}
          <CardLayout variant="dashboard">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">User</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Contact</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Status</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Joined</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="border-b border-gray-700 hover:bg-gray-700 hover:bg-opacity-30">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {user.firstName?.[0] || user.email?.[0] || "U"}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-gray-400 text-sm">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          {user.phone && (
                            <div className="flex items-center text-gray-300 text-sm">
                              <Phone className="w-4 h-4 mr-2" />
                              {user.phone}
                            </div>
                          )}
                          {user.address && (
                            <div className="flex items-center text-gray-300 text-sm">
                              <MapPin className="w-4 h-4 mr-2" />
                              {user.address}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={user.status || "active"}
                          onChange={(e) => handleStatusChange(user._id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-sm border-0 focus:outline-none ${user.status === "active"
                            ? "bg-green-500 bg-opacity-20 text-green-400"
                            : user.status === "suspended"
                              ? "bg-red-500 bg-opacity-20 text-red-400"
                              : "bg-gray-500 bg-opacity-20 text-gray-400"
                            }`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center text-gray-300 text-sm">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => navigate(`/admin/users/${user._id}`)}
                            className="p-2 text-blue-400 hover:bg-blue-500 hover:bg-opacity-20 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/users/${user._id}/edit`)}
                            className="p-2 text-green-400 hover:bg-green-500 hover:bg-opacity-20 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setUserToDelete(user)
                              setShowDeleteModal(true)
                            }}
                            className="p-2 text-red-400 hover:bg-red-500 hover:bg-opacity-20 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No users found</p>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </CardLayout>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {userToDelete?.firstName} {userToDelete?.lastName}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setUserToDelete(null)
                }}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(userToDelete._id)}
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

export default UsersManagement
