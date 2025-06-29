import User from "../models/User.js";
import mongoose from "mongoose";

// Get all admins
export const getAllAdmins = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    console.log("Fetching admins with params:", {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    });

    // Build query for admin users (including both admin and super_admin)
    const query = {
      $or: [
        { role: "admin" },
        { role: "super_admin" },
        { role: "super-admin" },
      ],
    };

    // Add search filter
    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      query.$and = [
        {
          $or: [
            { role: "admin" },
            { role: "super_admin" },
            { role: "super-admin" },
          ],
        },
        {
          $or: [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { email: searchRegex },
          ],
        },
      ];
      // Remove the original $or to avoid conflict
      delete query.$or;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    console.log("Admin query:", JSON.stringify(query, null, 2));

    // Execute query
    const admins = await User.find(query)
      .select("-password")
      .sort(sort)
      .limit(Number.parseInt(limit))
      .skip((Number.parseInt(page) - 1) * Number.parseInt(limit))
      .lean();

    const total = await User.countDocuments(query);

    console.log("Found admins:", admins.length, "Total:", total);

    // Format admin data and ensure consistent role naming
    const formattedAdmins = admins.map((admin) => ({
      _id: admin._id,
      firstName: admin.firstName || "",
      lastName: admin.lastName || "",
      email: admin.email || "",
      role:
        admin.role === "super-admin" ? "super_admin" : admin.role || "admin",
      phone: admin.phone || "",
      bio: admin.bio || "",
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    }));

    res.status(200).json({
      success: true,
      admins: formattedAdmins,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(total / Number.parseInt(limit)),
        totalAdmins: total,
        hasNext:
          Number.parseInt(page) < Math.ceil(total / Number.parseInt(limit)),
        hasPrev: Number.parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Get all admins error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve admins",
      error: error.message,
    });
  }
};

// Get admin by ID
export const getAdminById = async (req, res) => {
  try {
    const { adminId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin ID format",
      });
    }

    const admin = await User.findOne({
      _id: adminId,
      $or: [
        { role: "admin" },
        { role: "super_admin" },
        { role: "super-admin" },
      ],
    })
      .select("-password")
      .lean();

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      admin: {
        ...admin,
        role:
          admin.role === "super-admin" ? "super_admin" : admin.role || "admin",
      },
    });
  } catch (error) {
    console.error("Get admin by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve admin",
      error: error.message,
    });
  }
};

// Create new admin
export const createAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role = "admin" } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin with this email already exists",
      });
    }

    // Validate role
    const validRoles = ["admin", "super_admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be one of: " + validRoles.join(", "),
      });
    }

    // Create admin
    const admin = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
    });

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin: {
        _id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create admin",
      error: error.message,
    });
  }
};

// Update admin
export const updateAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const updateData = { ...req.body };

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin ID format",
      });
    }

    // Remove sensitive fields
    delete updateData.password;
    delete updateData._id;
    delete updateData.role; // Role should be updated via separate endpoint

    const admin = await User.findOneAndUpdate(
      {
        _id: adminId,
        $or: [
          { role: "admin" },
          { role: "super_admin" },
          { role: "super-admin" },
        ],
      },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .select("-password")
      .lean();

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      admin: {
        ...admin,
        role:
          admin.role === "super-admin" ? "super_admin" : admin.role || "admin",
      },
    });
  } catch (error) {
    console.error("Update admin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update admin",
      error: error.message,
    });
  }
};

// Delete admin
export const deleteAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin ID format",
      });
    }

    // Prevent self-deletion
    if (req.user._id.toString() === adminId) {
      return res.status(403).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    const admin = await User.findOneAndDelete({
      _id: adminId,
      $or: [
        { role: "admin" },
        { role: "super_admin" },
        { role: "super-admin" },
      ],
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    console.error("Delete admin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete admin",
      error: error.message,
    });
  }
};

// Update admin role
export const updateAdminRole = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { role } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin ID format",
      });
    }

    const validRoles = ["admin", "super_admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be one of: " + validRoles.join(", "),
      });
    }

    // Prevent self-role change
    if (req.user._id.toString() === adminId) {
      return res.status(403).json({
        success: false,
        message: "Cannot change your own role",
      });
    }

    const admin = await User.findOneAndUpdate(
      {
        _id: adminId,
        $or: [
          { role: "admin" },
          { role: "super_admin" },
          { role: "super-admin" },
        ],
      },
      { role },
      { new: true }
    )
      .select("-password")
      .lean();

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Admin role updated successfully",
      admin: {
        ...admin,
        role:
          admin.role === "super-admin" ? "super_admin" : admin.role || "admin",
      },
    });
  } catch (error) {
    console.error("Update admin role error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update admin role",
      error: error.message,
    });
  }
};
