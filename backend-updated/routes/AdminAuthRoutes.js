import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/adminUserController.js";
import {
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  updateAdminRole,
} from "../controllers/adminAdminController.js";
import {
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
} from "../controllers/adminApplicationController.js";
import { updateAdminProfile } from "../controllers/adminProfileController.js";
import {
  registerAdmin,
  loginAdmin,
} from "../controllers/AdminAuthController.js";

const router = express.Router();

// Auth
router.post("/auth/register", registerAdmin);
router.post("/auth/login", loginAdmin);

// Users
router.get("/users", protect, getAllUsers);
router.get("/users/:userId", protect, getUserById);
router.put("/users/:userId", protect, updateUser);
router.delete("/users/:userId", protect, deleteUser);

// Admins
router.get("/admins", protect, getAllAdmins);
router.get("/admins/:adminId", protect, getAdminById);
router.put("/admins/:adminId", protect, updateAdmin);
router.delete("/admins/:adminId", protect, deleteAdmin);
router.patch("/admins/:adminId/role", protect, updateAdminRole);

// Applications
router.get("/applications", protect, getAllApplications);
router.get("/applications/:applicationId", protect, getApplicationById);
router.patch(
  "/applications/:applicationId/status",
  protect,
  updateApplicationStatus
);
router.delete("/applications/:applicationId", protect, deleteApplication);

// Admin Profile
router.put("/profile", protect, updateAdminProfile);

export default router;
