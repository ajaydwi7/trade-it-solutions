import express from "express";
import applicationRoutes from "./applicationRoutes.js";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";

const router = express.Router();

router.use("/applications", applicationRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

export default router;
