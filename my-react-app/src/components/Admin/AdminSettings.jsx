"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAdminAuth } from "../../contexts/AdminAuthContext"
import { Settings, User, Lock, Bell, Save, Eye, EyeOff, Upload, X } from "lucide-react"
import { DashboardLayout, CardLayout } from "../Layout"
import { updateAdminProfile, changeAdminPassword, updateAdminSettings } from "../../services/adminApi"
import { toast } from "react-toastify"

const AdminSettings = () => {
  const navigate = useNavigate()
  const { admin, token, login } = useAdminAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    securityAlerts: true,
    twoFactorAuth: false,
  })

  useEffect(() => {
    if (admin) {
      setProfileForm({
        firstName: admin.firstName || "",
        lastName: admin.lastName || "",
        email: admin.email || "",
        phone: admin.phone || "",
        bio: admin.bio || "",
      })
    }
  }, [admin])

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await updateAdminProfile(profileForm, token)
      console.log("Profile update response:", response)

      // Update the admin context with new data
      const updatedAdmin = response.admin || response
      login(updatedAdmin, token)

      toast.success("Profile updated successfully")
    } catch (error) {
      toast.error("Failed to update profile")
      console.error("Error updating profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords don't match")
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      await changeAdminPassword(
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        token,
      )
      toast.success("Password changed successfully")
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      toast.error("Failed to change password")
      console.error("Error changing password:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSettingsSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateAdminSettings(settingsForm, token)
      toast.success("Settings updated successfully")
    } catch (error) {
      toast.error("Failed to update settings")
      console.error("Error updating settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePhoto(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeProfilePhoto = () => {
    setProfilePhoto(null)
  }

  const sidebar = (
    <>
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
            <Settings className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Settings</h2>
            <p className="text-indigo-400">Manage your account</p>
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
          onClick={() => setActiveTab("profile")}
          className={`flex items-center p-3 rounded-lg transition-colors text-white w-full ${activeTab === "profile" ? "bg-indigo-600 bg-opacity-50" : "bg-gray-700 bg-opacity-30 hover:bg-opacity-50"
            }`}
        >
          <User className="w-5 h-5 mr-3" />
          <span>Profile</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center p-3 rounded-lg transition-colors text-white w-full ${activeTab === "security" ? "bg-indigo-600 bg-opacity-50" : "bg-gray-700 bg-opacity-30 hover:bg-opacity-50"
            }`}
        >
          <Lock className="w-5 h-5 mr-3" />
          <span>Security</span>
        </button>

        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center p-3 rounded-lg transition-colors text-white w-full ${activeTab === "notifications"
            ? "bg-indigo-600 bg-opacity-50"
            : "bg-gray-700 bg-opacity-30 hover:bg-opacity-50"
            }`}
        >
          <Bell className="w-5 h-5 mr-3" />
          <span>Notifications</span>
        </button>
      </nav>
    </>
  )

  return (
    <DashboardLayout sidebar={sidebar}>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Admin Settings</h1>
            <p className="text-gray-300 text-lg">Manage your account preferences and security</p>
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <CardLayout variant="dashboard">
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Profile Information</h2>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>

                {/* Profile Photo */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
                      {profilePhoto ? (
                        <img
                          src={profilePhoto || "/placeholder.svg"}
                          alt="Profile"
                          className="w-24 h-24 object-cover rounded-full"
                        />
                      ) : (
                        <User className="w-12 h-12 text-white" />
                      )}
                    </div>
                    {profilePhoto && (
                      <button
                        type="button"
                        onClick={removeProfilePhoto}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                    <p className="text-gray-400 text-sm mt-2">JPG, PNG or GIF (max 5MB)</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">First Name</label>
                    <input
                      type="text"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Last Name</label>
                    <input
                      type="text"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Phone</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Bio</label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    rows={4}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </form>
            </CardLayout>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <CardLayout variant="dashboard">
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Security Settings</h2>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 pr-12 text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 pr-12 text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 pr-12 text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Two-Factor Authentication */}
                <div className="border-t border-gray-700 pt-6">
                  <h3 className="text-xl font-bold text-white mb-4">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between p-4 bg-gray-700 bg-opacity-30 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Enable 2FA</p>
                      <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.twoFactorAuth}
                        onChange={(e) => setSettingsForm({ ...settingsForm, twoFactorAuth: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </form>
            </CardLayout>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <CardLayout variant="dashboard">
              <form onSubmit={handleSettingsSubmit} className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Notification Preferences</h2>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Saving..." : "Save Preferences"}
                  </button>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      key: "emailNotifications",
                      title: "Email Notifications",
                      description: "Receive notifications via email",
                    },
                    {
                      key: "pushNotifications",
                      title: "Push Notifications",
                      description: "Receive push notifications in your browser",
                    },
                    {
                      key: "weeklyReports",
                      title: "Weekly Reports",
                      description: "Get weekly summary reports",
                    },
                    {
                      key: "securityAlerts",
                      title: "Security Alerts",
                      description: "Important security notifications",
                    },
                  ].map((setting) => (
                    <div
                      key={setting.key}
                      className="flex items-center justify-between p-4 bg-gray-700 bg-opacity-30 rounded-lg"
                    >
                      <div>
                        <p className="text-white font-medium">{setting.title}</p>
                        <p className="text-gray-400 text-sm">{setting.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm[setting.key]}
                          onChange={(e) => setSettingsForm({ ...settingsForm, [setting.key]: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </form>
            </CardLayout>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AdminSettings
