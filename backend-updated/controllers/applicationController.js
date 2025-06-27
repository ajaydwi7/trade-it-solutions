import Application from "../models/Application.js";
import User from "../models/User.js";

// Create or update application
export const saveApplication = async (req, res) => {
  try {
    const { userId, ...applicationData } = req.body;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find existing application or create new one
    let application = await Application.findOne({ userId });

    if (application) {
      // Update existing application
      Object.keys(applicationData).forEach((section) => {
        if (
          applicationData[section] &&
          typeof applicationData[section] === "object"
        ) {
          application[section] = {
            ...application[section],
            ...applicationData[section],
          };
        } else {
          application[section] = applicationData[section];
        }
      });

      application = await application.save();
    } else {
      // Create new application
      application = new Application({
        userId,
        ...applicationData,
      });

      application = await application.save();
    }

    // Update user's application status
    user.isApplicationCompleted = application.isComplete();
    user.applicationStatus = application.status;
    await user.save();

    res.status(200).json({
      message: "Application saved successfully",
      application: {
        id: application._id,
        status: application.status,
        completionPercentage: application.completionPercentage,
        isComplete: application.isComplete(),
        requiredSectionsComplete: application.requiredSectionsComplete,
        submittedAt: application.submittedAt,
        updatedAt: application.updatedAt,
        videoInfo: application.getVideoInfo(),
      },
    });
  } catch (error) {
    console.error("Save application error:", error);
    res.status(500).json({
      message: "Failed to save application",
      error: error.message,
    });
  }
};

// Save individual section
export const saveSection = async (req, res) => {
  try {
    const { userId } = req.params;
    const { section, data } = req.body;

    // Validate section name
    const validSections = [
      "warmUp",
      "commitment",
      "purpose",
      "exclusivity",
      "optional",
    ];

    if (!validSections.includes(section)) {
      return res.status(400).json({ message: "Invalid section name" });
    }

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find or create application
    let application = await Application.findOne({ userId });

    if (!application) {
      application = new Application({ userId });
    }

    // Update section with validation
    try {
      application[section] = {
        ...application[section],
        ...data,
      };

      await application.save();
    } catch (validationError) {
      return res.status(400).json({
        message: "Validation error",
        error: validationError.message,
        details: validationError.errors,
      });
    }

    // Update user status
    user.isApplicationCompleted = application.isComplete();
    user.applicationStatus = application.status;
    await user.save();

    res.status(200).json({
      message: "Section saved successfully",
      section: application[section],
      completionPercentage: application.completionPercentage,
      isComplete: application.isComplete(),
      requiredSectionsComplete: application.requiredSectionsComplete,
      status: application.status,
      videoInfo:
        section === "optional" ? application.getVideoInfo() : undefined,
    });
  } catch (error) {
    console.error("Save section error:", error);
    res.status(500).json({
      message: "Failed to save section",
      error: error.message,
    });
  }
};

// Upload video recording
export const uploadVideo = async (req, res) => {
  try {
    const { userId } = req.params;
    const { videoData, metadata } = req.body;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate video data
    if (!videoData || !videoData.startsWith("data:video/")) {
      return res.status(400).json({ message: "Invalid video data format" });
    }

    // Check video size (approximate)
    const sizeInBytes = Math.round((videoData.length * 3) / 4);
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (sizeInBytes > maxSize) {
      return res.status(400).json({
        message: "Video file too large. Maximum size is 50MB.",
        currentSize: Math.round(sizeInBytes / (1024 * 1024)) + "MB",
      });
    }

    // Find or create application
    let application = await Application.findOne({ userId });

    if (!application) {
      application = new Application({ userId });
    }

    // Initialize optional section if it doesn't exist
    if (!application.optional) {
      application.optional = {};
    }

    // Save video data
    application.optional.videoRecording = videoData;

    // Save metadata if provided
    if (metadata) {
      application.videoMetadata = {
        duration: metadata.duration || null,
        size: sizeInBytes,
        format: metadata.format || "webm",
        recordedAt: new Date(),
      };
    }

    await application.save();

    res.status(200).json({
      message: "Video uploaded successfully",
      videoInfo: application.getVideoInfo(),
      metadata: application.videoMetadata,
    });
  } catch (error) {
    console.error("Upload video error:", error);
    res.status(500).json({
      message: "Failed to upload video",
      error: error.message,
    });
  }
};

// Delete video recording
export const deleteVideo = async (req, res) => {
  try {
    const { userId } = req.params;

    const application = await Application.findOne({ userId });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Remove video data
    if (application.optional) {
      application.optional.videoRecording = undefined;
      application.optional.videoUrl = undefined;
    }

    application.videoMetadata = undefined;

    await application.save();

    res.status(200).json({
      message: "Video deleted successfully",
      videoInfo: application.getVideoInfo(),
    });
  } catch (error) {
    console.error("Delete video error:", error);
    res.status(500).json({
      message: "Failed to delete video",
      error: error.message,
    });
  }
};

// Get application by user ID
export const getApplication = async (req, res) => {
  try {
    const { userId } = req.params;

    const application = await Application.findOne({ userId }).populate(
      "userId",
      "firstName lastName email"
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Return application without large video data for performance
    const applicationData = application.toObject();

    // Remove large video data from response, but keep metadata
    if (applicationData.optional?.videoRecording) {
      applicationData.optional.videoRecording = "[VIDEO_DATA_PRESENT]";
    }

    res.status(200).json({
      application: {
        ...applicationData,
        completionPercentage: application.completionPercentage,
        isComplete: application.isComplete(),
        requiredSectionsComplete: application.requiredSectionsComplete,
        videoInfo: application.getVideoInfo(),
      },
    });
  } catch (error) {
    console.error("Get application error:", error);
    res.status(500).json({
      message: "Failed to retrieve application",
      error: error.message,
    });
  }
};

// Get application sections with completion status
export const getApplicationSections = async (req, res) => {
  try {
    const { userId } = req.params;

    const application = await Application.findOne({ userId });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Return sections with completion status
    const sections = {
      warmUp: {
        data: application.warmUp || {},
        isComplete: !!(
          application.warmUp?.animalQuestion &&
          application.warmUp.animalQuestion.length >= 10 &&
          application.warmUp?.accomplishment &&
          application.warmUp.accomplishment.length >= 10 &&
          application.warmUp?.responseWhenLost &&
          application.warmUp.responseWhenLost.length >= 10
        ),
        questions: [
          "If you were an animal in the jungle, which one would you be and why?",
          "What’s something you’ve accomplished that you’re proud of but rarely talk about?",
          "When you fall behind or feel lost, how do you typically respond?",
        ],
      },
      commitment: {
        data: application.commitment || {},
        isComplete: !!(
          application.commitment?.canCommit &&
          application.commitment?.incompleteCourses &&
          application.commitment.incompleteCourses.length >= 10 &&
          application.commitment?.finishedHardThing &&
          application.commitment.finishedHardThing.length >= 10
        ),
        questions: [
          "Do you currently have the ability to commit at least 6 - 10 focused hours per week to live learning, assessments, and study?",
          "Have you ever enrolled in a course or program and not completed it? If so, why?",
          "Have you ever finished something hard that no one was forcing you to do? What was it?",
        ],
      },
      purpose: {
        data: application.purpose || {},
        isComplete: !!(
          application.purpose?.whyTrade &&
          application.purpose.whyTrade.length >= 10 &&
          application.purpose?.lifeChange &&
          application.purpose.lifeChange.length >= 10 &&
          application.purpose?.doingFor &&
          application.purpose.doingFor.length >= 10 &&
          application.purpose?.disciplineMeaning &&
          application.purpose.disciplineMeaning.length >= 10
        ),
        questions: [
          "Why do you want to learn how to trade? Be specific.",
          "What would change in your life if you became a consistently profitable trader?",
          "Who are you doing this for and why them?",
          "What does discipline mean to you?",
        ],
      },
      exclusivity: {
        data: application.exclusivity || {},
        isComplete: !!(
          application.exclusivity?.preparedInvestment &&
          application.exclusivity?.strongCandidate &&
          application.exclusivity.strongCandidate.length >= 10 &&
          application.exclusivity?.firstPerson &&
          application.exclusivity.firstPerson.length >= 10
        ),
        questions: [
          "This program costs $X,XXX if accepted. Are you prepared to make that investment in your future?",
          "Why do you believe you’re a strong candidate for acceptance into TradeIT?",
          "If accepted, who’s the first person you would tell and why?",
        ],
      },
      optional: {
        data: application.optional
          ? {
              ...application.optional,
              videoRecording: application.optional.videoRecording
                ? "[VIDEO_DATA_PRESENT]"
                : undefined,
            }
          : {},
        isComplete: true, // Optional section is always "complete"
        videoInfo: application.getVideoInfo(),
      },
    };

    res.status(200).json({
      sections,
      completionPercentage: application.completionPercentage,
      isComplete: application.isComplete(),
      requiredSectionsComplete: application.requiredSectionsComplete,
    });
  } catch (error) {
    console.error("Get application sections error:", error);
    res.status(500).json({
      message: "Failed to retrieve application sections",
      error: error.message,
    });
  }
};

// Submit application for review
export const submitApplication = async (req, res) => {
  try {
    const userId = req.user._id;

    const application = await Application.findOne({ userId });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (!application.isComplete()) {
      return res.status(400).json({
        message: "Application is not complete",
        completionPercentage: application.completionPercentage,
        requiredSectionsComplete: application.requiredSectionsComplete,
      });
    }

    await application.submit();

    // Update user status
    const user = await User.findById(userId);
    user.isApplicationCompleted = true;
    user.applicationStatus = "In Review";
    await user.save();

    res.status(200).json({
      message: "Application submitted successfully",
      application: {
        id: application._id,
        status: application.status,
        submittedAt: application.submittedAt,
        completionPercentage: application.completionPercentage,
      },
    });
  } catch (error) {
    console.error("Submit application error:", error);
    res.status(500).json({
      message: "Failed to submit application",
      error: error.message,
    });
  }
};

// Get all applications (Admin only)
export const getAllApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, includeVideo = false } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Application.countDocuments(query);

    const applicationsWithCompletion = applications.map((app) => {
      const appData = app.toObject();

      // Remove large video data unless specifically requested
      if (!includeVideo && appData.optional?.videoRecording) {
        appData.optional.videoRecording = "[VIDEO_DATA_PRESENT]";
      }

      return {
        ...appData,
        completionPercentage: app.completionPercentage,
        isComplete: app.isComplete(),
        requiredSectionsComplete: app.requiredSectionsComplete,
        videoInfo: app.getVideoInfo(),
      };
    });

    res.status(200).json({
      applications: applicationsWithCompletion,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get all applications error:", error);
    res.status(500).json({
      message: "Failed to retrieve applications",
      error: error.message,
    });
  }
};

// Update application status (Admin only)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, adminNotes } = req.body;

    const validStatuses = [
      "Draft",
      "In Review",
      "Accepted",
      "Rejected",
      "Confirmation Email Sent",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = status;
    if (adminNotes) {
      application.adminNotes = adminNotes;
    }

    if (status !== "Draft") {
      application.reviewedAt = new Date();
    }

    await application.save();

    // Update user status
    const user = await User.findById(application.userId);
    user.applicationStatus = status;
    await user.save();

    res.status(200).json({
      message: "Application status updated successfully",
      application: {
        id: application._id,
        status: application.status,
        reviewedAt: application.reviewedAt,
        adminNotes: application.adminNotes,
      },
    });
  } catch (error) {
    console.error("Update application status error:", error);
    res.status(500).json({
      message: "Failed to update application status",
      error: error.message,
    });
  }
};

// Delete application (Admin only)
export const deleteApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    await application.deleteOne();

    // Optionally update user's application status if needed
    const user = await User.findById(application.userId);
    if (user) {
      user.isApplicationCompleted = false;
      user.applicationStatus = "Draft";
      await user.save();
    }

    res.status(200).json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error("Delete application error:", error);
    res.status(500).json({
      message: "Failed to delete application",
      error: error.message,
    });
  }
};

// Get application statistics (Admin only)
export const getApplicationStats = async (req, res) => {
  try {
    const stats = await Application.getStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error("Get application stats error:", error);
    res.status(500).json({
      message: "Failed to retrieve application stats",
      error: error.message,
    });
  }
};

// Add this controller
// controllers/applicationController.js
export const ensureApplication = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Try to find existing application
    let application = await Application.findOne({ userId });
    if (!application) {
      try {
        application = await Application.create({ userId });
      } catch (err) {
        // If duplicate key error, another request just created it
        if (err.code === 11000) {
          application = await Application.findOne({ userId });
        } else {
          throw err;
        }
      }
    }

    res.status(200).json({
      message: "Application ensured",
      applicationId: application._id,
    });
  } catch (error) {
    console.error("Ensure application error:", error);
    res.status(500).json({
      message: "Failed to ensure application",
      error: error.message,
    });
  }
};
