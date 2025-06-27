import User from "../models/User.js";
import Application from "../models/Application.js";

// @desc    Get user profile
// @route   GET /api/users/profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (user) {
      // Get application data if it exists
      const application = await Application.findOne({ user: user._id });

      // Merge application data into user formData if application exists
      let formData = user.formData || {};
      if (application) {
        formData = {
          ...formData,
          warmUp: application.warmUp,
          commitment: application.commitment,
          purpose: application.purpose,
          exclusivity: application.exclusivity,
          videoSubmission: application.videoSubmission,
          socialMedia: application.socialMedia,
          bio: application.bio,
          profilePhoto: application.profilePhoto,
        };
      }

      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileComplete: user.profileComplete,
        isApplicationCompleted: user.isApplicationCompleted,
        applicationStatus: user.applicationStatus,
        formData: formData,
      });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.email = req.body.email || user.email;
      user.profileComplete = req.body.profileComplete || user.profileComplete;

      // Update formData if provided
      if (req.body.formData) {
        user.formData = { ...user.formData, ...req.body.formData };
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        profileComplete: updatedUser.profileComplete,
        isApplicationCompleted: updatedUser.isApplicationCompleted,
        applicationStatus: updatedUser.applicationStatus,
        formData: updatedUser.formData,
      });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Mark application as completed
// @route   POST /api/users/:id/complete-application
export const markApplicationCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    const { status = "In Review" } = req.body;

    // Verify the user is updating their own application or is an admin
    if (req.user._id.toString() !== id) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this application" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.isApplicationCompleted = true;
    user.applicationStatus = status;

    const updatedUser = await user.save();

    res.json({
      message: "Application marked as completed",
      isApplicationCompleted: updatedUser.isApplicationCompleted,
      applicationStatus: updatedUser.applicationStatus,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update application status
// @route   PUT /api/users/:id/application-status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["In Review", "Accepted", "Confirmation Email Sent"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status. Must be one of: " + validStatuses.join(", "),
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.applicationStatus = status;

    const updatedUser = await user.save();

    res.json({
      message: "Application status updated successfully",
      applicationStatus: updatedUser.applicationStatus,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update user form data (for onboarding steps)
// @route   PUT /api/users/form-data
export const updateUserFormData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update formData with provided data
    user.formData = { ...user.formData, ...req.body };

    const updatedUser = await user.save();

    res.json({
      message: "Form data updated successfully",
      formData: updatedUser.formData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
