import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Register Admin
export const registerAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ error: "Admin already exists" });

    const admin = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: "admin",
    });

    res
      .status(201)
      .json({
        message: "Admin registered",
        admin: { ...admin.toObject(), password: undefined },
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login Admin
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await User.findOne({ email, role: "admin" });
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    res.json({
      token,
      userId: admin._id,
      user: {
        _id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
