import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Application from "../models/Application.js";

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
  console.log("Login request body:", req.body);
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare passwords using the model method
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      console.log("Password mismatch for user:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    let application = await Application.findOne({ userId: user._id });
    console.log("Application found for user:", application);

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

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};
