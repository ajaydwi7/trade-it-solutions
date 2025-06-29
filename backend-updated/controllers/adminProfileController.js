import User from "../models/User.js"
import bcrypt from "bcryptjs"

// Update admin profile
export const updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.user._id
    const { firstName, lastName, email, phone, bio } = req.body

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: adminId },
      })

      if (existingUser) {
        return res.status(400).json({
          message: "Email is already taken by another user",
        })
      }
    }

    const admin = await User.findByIdAndUpdate(
      adminId,
      {
        firstName,
        lastName,
        email,
        phone,
        bio,
      },
      { new: true, runValidators: true },
    ).select("-password")

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" })
    }

    res.status(200).json({
      message: "Profile updated successfully",
      admin: admin.toObject(),
    })
  } catch (error) {
    console.error("Update admin profile error:", error)
    res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    })
  }
}

// Change admin password
export const changeAdminPassword = async (req, res) => {
  try {
    const adminId = req.user._id
    const { currentPassword, newPassword } = req.body

    // Get admin with password
    const admin = await User.findById(adminId)
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" })
    }

    // Verify current password
    const isCurrentPasswordValid = await admin.matchPassword(currentPassword)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" })
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long",
      })
    }

    // Hash and update new password
    const salt = await bcrypt.genSalt(10)
    admin.password = await bcrypt.hash(newPassword, salt)
    await admin.save()

    res.status(200).json({
      message: "Password changed successfully",
    })
  } catch (error) {
    console.error("Change admin password error:", error)
    res.status(500).json({
      message: "Failed to change password",
      error: error.message,
    })
  }
}

// Update admin settings
export const updateAdminSettings = async (req, res) => {
  try {
    const adminId = req.user._id
    const settings = req.body

    // Define allowed settings
    const allowedSettings = [
      "emailNotifications",
      "pushNotifications",
      "weeklyReports",
      "securityAlerts",
      "twoFactorAuth",
    ]

    // Filter settings to only allowed ones
    const filteredSettings = {}
    Object.keys(settings).forEach((key) => {
      if (allowedSettings.includes(key)) {
        filteredSettings[`settings.${key}`] = settings[key]
      }
    })

    const admin = await User.findByIdAndUpdate(adminId, { $set: filteredSettings }, { new: true }).select("-password")

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" })
    }

    res.status(200).json({
      message: "Settings updated successfully",
      settings: admin.settings || {},
    })
  } catch (error) {
    console.error("Update admin settings error:", error)
    res.status(500).json({
      message: "Failed to update settings",
      error: error.message,
    })
  }
}
