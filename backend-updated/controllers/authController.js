import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import Application from "../models/Application.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, address } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
    });

    if (user) {
      // Ensure Application is created for new user
      let application = await Application.findOne({ userId: user._id });
      if (!application) {
        application = await Application.create({ userId: user._id });
      }

      res.status(201).json({
        _id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        token: generateToken(user._id.toString()),
        userId: user._id.toString(),
        user: {
          _id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isApplicationCompleted: user.isApplicationCompleted,
          applicationStatus: user.applicationStatus,
        },
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Block admin login here
    if (user.role === "admin" || user.role === "super-admin") {
      return res
        .status(403)
        .json({ error: "Please use the admin login page." });
    }

    // Compare passwords using the model method
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      console.log("Password mismatch for user:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    let application = await Application.findOne({ userId: user._id });

    const isSubmitted =
      application &&
      application.status !== "Draft" &&
      application.status !== "Not Started";

    res.json({
      _id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      token: generateToken(user._id.toString()),
      userId: user._id.toString(),
      user: {
        _id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        redirectTo: isSubmitted ? "/dashboard" : "/application",
        applicationStatus: user.applicationStatus,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Google Authentication
export const googleAuthController = async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    // Find or create user
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        firstName: payload.given_name || "",
        lastName: payload.family_name || "",
        email: payload.email,
        password: Math.random().toString(36), // random password, not used
        profileComplete: true,
      });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      token,
      userId: user._id,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileComplete: user.profileComplete,
      },
    });
  } catch (error) {
    res.status(401).json({ error: "Google authentication failed" });
  }
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};
