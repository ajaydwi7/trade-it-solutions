import User from "../models/User.js";
import Application from "../models/Application.js";

// Get admin dashboard statistics
export const getAdminStats = async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });
    const totalApplications = await Application.countDocuments();
    const totalAdmins = await User.countDocuments({ role: "admin" });

    // Get application status counts
    const applicationStats = await Application.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Process application stats
    let pendingApplications = 0;
    let acceptedApplications = 0;
    let rejectedApplications = 0;

    applicationStats.forEach((stat) => {
      switch (stat._id) {
        case "In Review":
          pendingApplications = stat.count;
          break;
        case "Accepted":
          acceptedApplications = stat.count;
          break;
        case "Rejected":
          rejectedApplications = stat.count;
          break;
      }
    });

    // Get user registration trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userTrends = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          role: { $ne: "admin" },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get application completion rates
    const completionStats = await Application.aggregate([
      {
        $group: {
          _id: null,
          totalApplications: { $sum: 1 },
          completedApplications: {
            $sum: {
              $cond: [{ $gte: ["$completionPercentage", 100] }, 1, 0],
            },
          },
          averageCompletion: { $avg: "$completionPercentage" },
        },
      },
    ]);

    const stats = {
      totalUsers,
      totalApplications,
      totalAdmins,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
      userTrends,
      completionRate: completionStats[0]
        ? {
            total: completionStats[0].totalApplications,
            completed: completionStats[0].completedApplications,
            average: Math.round(completionStats[0].averageCompletion || 0),
          }
        : { total: 0, completed: 0, average: 0 },
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error("Get admin stats error:", error);
    res.status(500).json({
      message: "Failed to retrieve admin statistics",
      error: error.message,
    });
  }
};

// Get recent applications for dashboard
export const getRecentApplications = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const recentApplications = await Application.find()
      .populate("userId", "firstName lastName email phone")
      .sort({ updatedAt: -1 })
      .limit(Number.parseInt(limit));

    // Filter out applications with null userId and handle missing user data
    const applicationsWithUserData = recentApplications
      .filter((app) => app.userId) // Remove applications with null userId
      .map((app) => ({
        _id: app._id,
        status: app.status,
        completionPercentage: app.completionPercentage,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        user: {
          _id: app.userId._id,
          firstName: app.userId.firstName || "Unknown",
          lastName: app.userId.lastName || "User",
          email: app.userId.email || "No email",
          phone: app.userId.phone || "No phone",
        },
      }));

    res.status(200).json(applicationsWithUserData);
  } catch (error) {
    console.error("Get recent applications error:", error);
    res.status(500).json({
      message: "Failed to retrieve recent applications",
      error: error.message,
    });
  }
};

// Get dashboard analytics data
export const getDashboardAnalytics = async (req, res) => {
  try {
    const { period = "30" } = req.query; // days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number.parseInt(period));

    // User registration analytics
    const userAnalytics = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo },
          role: { $ne: "admin" },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          newUsers: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Application submission analytics
    const applicationAnalytics = await Application.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          newApplications: { $sum: 1 },
          averageCompletion: { $avg: "$completionPercentage" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Status distribution
    const statusDistribution = await Application.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          percentage: { $avg: "$completionPercentage" },
        },
      },
    ]);

    res.status(200).json({
      userAnalytics,
      applicationAnalytics,
      statusDistribution,
      period: Number.parseInt(period),
    });
  } catch (error) {
    console.error("Get dashboard analytics error:", error);
    res.status(500).json({
      message: "Failed to retrieve dashboard analytics",
      error: error.message,
    });
  }
};
