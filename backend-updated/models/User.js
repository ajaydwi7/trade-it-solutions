import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin", "super-admin"],
      default: "user",
    },
    profileComplete: {
      type: Boolean,
      default: false,
    },
    isApplicationCompleted: {
      type: Boolean,
      default: false,
    },
    applicationStatus: {
      type: String,
      enum: [
        "Not Started",
        "Draft",
        "In Review",
        "Accepted",
        "Rejected",
        "Confirmation Email Sent",
      ],
      default: "Not Started",
    },
    formData: {
      type: Object,
      default: {},
    },
    lastSectionCompleted: {
      type: String,
      enum: ["warmUp", "commitment", "purpose", "exclusivity", "optional"],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("User", UserSchema);
