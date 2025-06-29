import User from "../models/User.js"
import Application from "../models/Application.js"

// Get all users with pagination and filtering
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status = "", sortBy = "createdAt", sortOrder = "desc" } = req.query

    // Build query
    const query = { role: { $ne: "admin" } }

    // Add search filter
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]
    }

    // Add status filter
    if (status && status !== "all") {
      query.status = status
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    // Execute query with pagination
    const users = await User.find(query)
      .select("-password")
      .sort(sort)
      .limit(Number.parseInt(limit))
      .skip((Number.parseInt(page) - 1) * Number.parseInt(limit))

    // Get total count for pagination
    const total = await User.countDocuments(query)

    // Get application data for each user
    const usersWithApplications = await Promise.all(
      users.map(async (user) => {
        const application = await Application.findOne({ userId: user._id })
        return {
          ...user.toObject(),
          applicationStatus: user.applicationStatus || "Not Started",
          completionPercentage: application ? application.completionPercentage : 0,
          applicationId: application ? application._id : null,
        }
      }),
    )

    res.status(200).json({
      users: usersWithApplications,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(total / Number.parseInt(limit)),
        totalUsers: total,
        hasNext: Number.parseInt(page) < Math.ceil(total / Number.parseInt(limit)),
        hasPrev: Number.parseInt(page) > 1,
      },
    })
  } catch (error) {
    console.error("Get all users error:", error)
    res.status(500).json({
      message: "Failed to retrieve users",
      error: error.message,
    })
  }
}

// Get user by ID with detailed information
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Get user's application
    const application = await Application.findOne({ userId })

    // Get user activity/stats
    const userStats = {
      registrationDate: user.createdAt,
      lastLogin: user.lastLogin || null,
      applicationSubmitted: application ? application.submittedAt : null,
      applicationStatus: user.applicationStatus || "Not Started",
      completionPercentage: application ? application.completionPercentage : 0,
    }

    res.status(200).json({
      user: {
        ...user.toObject(),
        ...userStats,
        application: application
          ? {
              _id: application._id,
              status: application.status,
              completionPercentage: application.completionPercentage,
              submittedAt: application.submittedAt,
              updatedAt: application.updatedAt,
            }
          : null,
      },
    })
  } catch (error) {
    console.error("Get user by ID error:", error)
    res.status(500).json({
      message: "Failed to retrieve user",
      error: error.message,
    })
  }
}

// Update user information
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params
    const updateData = req.body

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password
    delete updateData.role
    delete updateData._id

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select(
      "-password",
    )

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json({
      message: "User updated successfully",
      user: user.toObject(),
    })
  } catch (error) {
    console.error("Update user error:", error)
    res.status(500).json({
      message: "Failed to update user",
      error: error.message,
    })
  }
}

// Delete user and associated data
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params

    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Prevent deletion of admin users
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot delete admin users" })
    }

    // Delete associated application
    await Application.deleteOne({ userId })

    // Delete user
    await User.findByIdAndDelete(userId)

    res.status(200).json({
      message: "User and associated data deleted successfully",
    })
  } catch (error) {
    console.error("Delete user error:", error)
    res.status(500).json({
      message: "Failed to delete user",
      error: error.message,
    })
  }
}

// Update user status
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params
    const { status } = req.body

    const validStatuses = ["active", "inactive", "suspended"]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be one of: " + validStatuses.join(", "),
      })
    }

    const user = await User.findByIdAndUpdate(userId, { status }, { new: true }).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json({
      message: "User status updated successfully",
      user: user.toObject(),
    })
  } catch (error) {
    console.error("Update user status error:", error)
    res.status(500).json({
      message: "Failed to update user status",
      error: error.message,
    })
  }
}

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const application = await Application.findOne({ userId })

    const stats = {
      registrationDate: user.createdAt,
      profileCompletion: user.profileComplete ? 100 : 50,
      applicationCompletion: application ? application.completionPercentage : 0,
      applicationStatus: user.applicationStatus || "Not Started",
      lastActivity: user.updatedAt,
      applicationSections: application
        ? {
            warmUp: !!application.warmUp?.animalQuestion,
            commitment: !!application.commitment?.canCommit,
            purpose: !!application.purpose?.whyTrade,
            exclusivity: !!application.exclusivity?.preparedInvestment,
            optional: !!application.optional,
          }
        : null,
    }

    res.status(200).json(stats)
  } catch (error) {
    console.error("Get user stats error:", error)
    res.status(500).json({
      message: "Failed to retrieve user statistics",
      error: error.message,
    })
  }
}
