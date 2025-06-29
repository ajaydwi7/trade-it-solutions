import express from "express";
import {
  registerUser,
  loginUser,
  googleAuthController,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuthController);

export default router;
