import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getUserProfile,
  updateUserProfile,
  markApplicationCompleted,
  updateApplicationStatus,
  updateUserFormData,
} from "../controllers/userController.js";

const router = express.Router();

// User profile routes
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Form data update route (for onboarding steps)
router.route("/form-data").put(protect, updateUserFormData);

// Application completion route
router
  .route("/:id/complete-application")
  .post(protect, markApplicationCompleted);

// Application status update route (for admin use)
router.route("/:id/application-status").put(protect, updateApplicationStatus);

export default router;
