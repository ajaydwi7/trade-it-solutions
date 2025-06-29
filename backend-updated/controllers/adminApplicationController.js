import Application from "../models/Application.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Get all applications with filtering and pagination
export const getAllApplications = async (req, res) => {
  try {
    console.log(
      "Admin user requesting applications:",
      req.user?._id,
      req.user?.role
    );

    const {
      page = 1,
      limit = 10,
      status = "",
      search = "",
      sortBy = "updatedAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    const query = {};

    // Add status filter
    if (status && status !== "all") {
      query.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    console.log("Query:", query, "Sort:", sort);

    // Execute query with population and pagination
    let applications;
    try {
      applications = await Application.find(query)
        .populate({
          path: "userId",
          select: "firstName lastName email phone address",
          // Handle cases where user might not exist
          options: { strictPopulate: false },
        })
        .sort(sort)
        .limit(Number.parseInt(limit))
        .skip((Number.parseInt(page) - 1) * Number.parseInt(limit))
        .lean(); // Use lean for better performance
    } catch (populateError) {
      console.error("Population error:", populateError);
      // Fallback: get applications without population
      applications = await Application.find(query)
        .sort(sort)
        .limit(Number.parseInt(limit))
        .skip((Number.parseInt(page) - 1) * Number.parseInt(limit))
        .lean();
    }

    console.log("Found applications:", applications.length);

    // Filter out applications with invalid data and handle search
    let filteredApplications = applications.filter((app) => {
      // Ensure application has required fields
      if (!app || !app._id) {
        console.warn("Skipping invalid application:", app);
        return false;
      }

      // If userId is not populated or missing, try to handle gracefully
      if (!app.userId) {
        console.warn("Application missing userId:", app._id);
        // Keep the application but with placeholder user data
        app.userId = {
          _id: null,
          firstName: "Unknown",
          lastName: "User",
          email: "unknown@example.com",
          phone: "",
          address: "",
        };
      }

      return true;
    });

    // Apply search filter if provided
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filteredApplications = filteredApplications.filter((app) => {
        const user = app.userId || {};
        const firstName = user.firstName || "";
        const lastName = user.lastName || "";
        const email = user.email || "";

        return (
          firstName.toLowerCase().includes(searchLower) ||
          lastName.toLowerCase().includes(searchLower) ||
          email.toLowerCase().includes(searchLower)
        );
      });
    }

    // Get total count
    const total = await Application.countDocuments(query);

    // Format applications data with safe property access
    const formattedApplications = filteredApplications.map((app) => {
      try {
        // Calculate completion percentage safely
        let completionPercentage = 0;
        try {
          // Create a temporary Application instance to use the virtual
          const tempApp = new Application(app);
          completionPercentage = tempApp.completionPercentage || 0;
        } catch (virtualError) {
          console.warn(
            "Error calculating completion percentage:",
            virtualError
          );
          completionPercentage = 0;
        }

        return {
          _id: app._id,
          status: app.status || "Draft",
          completionPercentage,
          isComplete: completionPercentage >= 100,
          submittedAt: app.submittedAt,
          createdAt: app.createdAt,
          updatedAt: app.updatedAt,
          reviewedAt: app.reviewedAt,
          adminNotes: app.adminNotes || "",
          user: {
            _id: app.userId?._id || null,
            firstName: app.userId?.firstName || "Unknown",
            lastName: app.userId?.lastName || "User",
            email: app.userId?.email || "unknown@example.com",
            phone: app.userId?.phone || "",
            address: app.userId?.address || "",
          },
          sections: {
            warmUp: !!app.warmUp?.animalQuestion,
            commitment: !!app.commitment?.canCommit,
            purpose: !!app.purpose?.whyTrade,
            exclusivity: !!app.exclusivity?.preparedInvestment,
            optional: !!app.optional,
          },
        };
      } catch (formatError) {
        console.error("Error formatting application:", app._id, formatError);
        // Return a minimal safe version
        return {
          _id: app._id,
          status: app.status || "Draft",
          completionPercentage: 0,
          isComplete: false,
          submittedAt: app.submittedAt,
          createdAt: app.createdAt,
          updatedAt: app.updatedAt,
          reviewedAt: app.reviewedAt,
          adminNotes: app.adminNotes || "",
          user: {
            _id: null,
            firstName: "Unknown",
            lastName: "User",
            email: "unknown@example.com",
            phone: "",
            address: "",
          },
          sections: {
            warmUp: false,
            commitment: false,
            purpose: false,
            exclusivity: false,
            optional: false,
          },
        };
      }
    });

    console.log("Formatted applications:", formattedApplications.length);

    res.status(200).json({
      success: true,
      applications: formattedApplications,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(total / Number.parseInt(limit)),
        totalApplications: total,
        hasNext:
          Number.parseInt(page) < Math.ceil(total / Number.parseInt(limit)),
        hasPrev: Number.parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Get all applications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve applications",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Get application by ID with full details
export const getApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID format",
      });
    }

    const application = await Application.findById(applicationId)
      .populate({
        path: "userId",
        select: "firstName lastName email phone address",
        options: { strictPopulate: false },
      })
      .lean();

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Handle missing user data
    if (!application.userId) {
      application.userId = {
        _id: null,
        firstName: "Unknown",
        lastName: "User",
        email: "unknown@example.com",
        phone: "",
        address: "",
      };
    }

    // Calculate completion percentage safely
    let completionPercentage = 0;
    let isComplete = false;
    try {
      const tempApp = new Application(application);
      completionPercentage = tempApp.completionPercentage || 0;
      isComplete = tempApp.isComplete() || false;
    } catch (virtualError) {
      console.warn(
        "Error calculating completion for application:",
        applicationId,
        virtualError
      );
    }

    // Format detailed application data
    const detailedApplication = {
      _id: application._id,
      status: application.status || "Draft",
      completionPercentage,
      isComplete,
      submittedAt: application.submittedAt,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      reviewedAt: application.reviewedAt,
      adminNotes: application.adminNotes || "",
      user: {
        _id: application.userId._id,
        firstName: application.userId.firstName,
        lastName: application.userId.lastName,
        email: application.userId.email,
        phone: application.userId.phone,
        address: application.userId.address,
      },
      sections: {
        warmUp: {
          data: application.warmUp || {},
          isComplete: !!(
            application.warmUp?.animalQuestion &&
            application.warmUp?.accomplishment &&
            application.warmUp?.responseWhenLost
          ),
        },
        commitment: {
          data: application.commitment || {},
          isComplete: !!(
            application.commitment?.canCommit &&
            application.commitment?.incompleteCourses &&
            application.commitment?.finishedHardThing
          ),
        },
        purpose: {
          data: application.purpose || {},
          isComplete: !!(
            application.purpose?.whyTrade &&
            application.purpose?.lifeChange &&
            application.purpose?.doingFor &&
            application.purpose?.disciplineMeaning
          ),
        },
        exclusivity: {
          data: application.exclusivity || {},
          isComplete: !!(
            application.exclusivity?.preparedInvestment &&
            application.exclusivity?.strongCandidate &&
            application.exclusivity?.firstPerson
          ),
        },
        optional: {
          data: application.optional
            ? {
                ...application.optional,
                videoRecording: application.optional.videoRecording
                  ? "[VIDEO_DATA_PRESENT]"
                  : undefined,
              }
            : {},
          isComplete: true,
          videoInfo: application.optional
            ? {
                hasVideo: !!(
                  application.optional.videoRecording ||
                  application.optional.videoUrl
                ),
                hasRecording: !!application.optional.videoRecording,
                hasUrl: !!application.optional.videoUrl,
                metadata: application.videoMetadata || null,
              }
            : {
                hasVideo: false,
                hasRecording: false,
                hasUrl: false,
                metadata: null,
              },
        },
      },
    };

    res.status(200).json({
      success: true,
      ...detailedApplication,
    });
  } catch (error) {
    console.error("Get application by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve application",
      error: error.message,
    });
  }
};

// Update application status with admin notes
export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, adminNotes } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID format",
      });
    }

    const validStatuses = [
      "Draft",
      "In Review",
      "Accepted",
      "Rejected",
      "Confirmation Email Sent",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: " + validStatuses.join(", "),
      });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Update application
    application.status = status;
    if (adminNotes !== undefined) {
      application.adminNotes = adminNotes;
    }
    if (status !== "Draft") {
      application.reviewedAt = new Date();
    }

    await application.save();

    // Update user's application status if user exists
    if (
      application.userId &&
      mongoose.Types.ObjectId.isValid(application.userId)
    ) {
      try {
        await User.findByIdAndUpdate(application.userId, {
          applicationStatus: status,
        });
      } catch (userUpdateError) {
        console.warn(
          "Failed to update user application status:",
          userUpdateError
        );
        // Don't fail the whole operation if user update fails
      }
    }

    res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      application: {
        _id: application._id,
        status: application.status,
        reviewedAt: application.reviewedAt,
        adminNotes: application.adminNotes,
      },
    });
  } catch (error) {
    console.error("Update application status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update application status",
      error: error.message,
    });
  }
};

// Delete application
export const deleteApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID format",
      });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Update user's application status if user exists
    if (
      application.userId &&
      mongoose.Types.ObjectId.isValid(application.userId)
    ) {
      try {
        await User.findByIdAndUpdate(application.userId, {
          isApplicationCompleted: false,
          applicationStatus: "Not Started",
        });
      } catch (userUpdateError) {
        console.warn(
          "Failed to update user after application deletion:",
          userUpdateError
        );
      }
    }

    // Delete application
    await Application.findByIdAndDelete(applicationId);

    res.status(200).json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    console.error("Delete application error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete application",
      error: error.message,
    });
  }
};

// Get application statistics
export const getApplicationStats = async (req, res) => {
  try {
    // Status distribution
    const statusStats = await Application.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Completion statistics
    const completionStats = await Application.aggregate([
      {
        $group: {
          _id: null,
          totalApplications: { $sum: 1 },
          averageCompletion: { $avg: "$completionPercentage" },
          completedApplications: {
            $sum: {
              $cond: [{ $gte: ["$completionPercentage", 100] }, 1, 0],
            },
          },
        },
      },
    ]);

    // Monthly submission trends
    const monthlyStats = await Application.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const stats = {
      statusDistribution: statusStats,
      completion: completionStats[0] || {
        totalApplications: 0,
        averageCompletion: 0,
        completedApplications: 0,
      },
      monthlyTrends: monthlyStats,
    };

    res.status(200).json({
      success: true,
      ...stats,
    });
  } catch (error) {
    console.error("Get application stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve application statistics",
      error: error.message,
    });
  }
};
