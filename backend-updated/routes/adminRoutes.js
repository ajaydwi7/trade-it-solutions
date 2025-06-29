import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOrSuperAdmin } from "../middleware/adminMiddleware.js";

// Import controllers
import {
  getAdminStats,
  getRecentApplications,
  getDashboardAnalytics,
} from "../controllers/adminDashboardController.js";

import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserStatus,
  getUserStats,
} from "../controllers/adminUserController.js";

import {
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
  getApplicationStats,
} from "../controllers/adminApplicationController.js";

import {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  updateAdminRole,
} from "../controllers/adminAdminController.js";

import {
  updateAdminProfile,
  changeAdminPassword,
  updateAdminSettings,
} from "../controllers/adminProfileController.js";

import {
  registerAdmin,
  loginAdmin,
} from "../controllers/AdminAuthController.js";

const router = express.Router();

// Auth routes
router.post("/auth/register", registerAdmin);
router.post("/auth/login", loginAdmin);

// Dashboard routes
router.get("/stats", protect, adminOrSuperAdmin, getAdminStats);
router.get(
  "/applications/recent",
  protect,
  adminOrSuperAdmin,
  getRecentApplications
);
router.get("/analytics", protect, adminOrSuperAdmin, getDashboardAnalytics);

// User management routes
router.get("/users", protect, adminOrSuperAdmin, getAllUsers);
router.get("/users/:userId", protect, adminOrSuperAdmin, getUserById);
router.put("/users/:userId", protect, adminOrSuperAdmin, updateUser);
router.delete("/users/:userId", protect, adminOrSuperAdmin, deleteUser);
router.patch(
  "/users/:userId/status",
  protect,
  adminOrSuperAdmin,
  updateUserStatus
);
router.get("/users/:userId/stats", protect, adminOrSuperAdmin, getUserStats);

// Application management routes
router.get("/applications", protect, adminOrSuperAdmin, getAllApplications);
router.get(
  "/applications/:applicationId",
  protect,
  adminOrSuperAdmin,
  getApplicationById
);
router.patch(
  "/applications/:applicationId/status",
  protect,
  adminOrSuperAdmin,
  updateApplicationStatus
);
router.delete(
  "/applications/:applicationId",
  protect,
  adminOrSuperAdmin,
  deleteApplication
);
router.get(
  "/applications/stats/overview",
  protect,
  adminOrSuperAdmin,
  getApplicationStats
);

// Admin management routes
router.get("/admins", protect, adminOrSuperAdmin, getAllAdmins);
router.post("/admins", protect, adminOrSuperAdmin, createAdmin);
router.get("/admins/:adminId", protect, adminOrSuperAdmin, getAdminById);
router.put("/admins/:adminId", protect, adminOrSuperAdmin, updateAdmin);
router.delete("/admins/:adminId", protect, adminOrSuperAdmin, deleteAdmin);
router.patch(
  "/admins/:adminId/role",
  protect,
  adminOrSuperAdmin,
  updateAdminRole
);

// Admin profile routes
router.put("/profile", protect, adminOrSuperAdmin, updateAdminProfile);
router.post(
  "/change-password",
  protect,
  adminOrSuperAdmin,
  changeAdminPassword
);
router.put("/settings", protect, adminOrSuperAdmin, updateAdminSettings);

export default router;
