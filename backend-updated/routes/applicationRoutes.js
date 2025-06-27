import express from "express";
import {
  saveApplication,
  saveSection,
  uploadVideo,
  deleteVideo,
  getApplication,
  getApplicationSections,
  submitApplication,
  getAllApplications,
  updateApplicationStatus,
  deleteApplication,
  getApplicationStats,
  ensureApplication,
} from "../controllers/applicationController.js";
import { protect } from "../middleware/authMiddleware.js";
import Application from "../models/Application.js"; // Import Application model directly

const router = express.Router();

// Public routes (with auth middleware)
router.post("/save", protect, saveApplication);
router.get("/user/:userId", protect, getApplication);
router.post("/submit", protect, submitApplication);

// Section-based routes
router.get("/sections/:userId", protect, getApplicationSections);
router.post("/section/:userId", protect, saveSection);

// Video handling routes
router.post("/video/:userId", protect, uploadVideo);
router.delete("/video/:userId", protect, deleteVideo);

// Admin routes (would need admin middleware in production)
router.get("/all", protect, getAllApplications);
router.put("/status/:applicationId", protect, updateApplicationStatus);
router.delete("/:applicationId", protect, deleteApplication);
router.get("/stats", protect, getApplicationStats);

// Additional utility routes
router.get("/status/:userId", protect, async (req, res) => {
  try {
    const { userId } = req.params;

    const application = await Application.findOne({ userId });

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
        status: null,
        completionPercentage: 0,
        isComplete: false,
        requiredSectionsComplete: false,
      });
    }

    res.status(200).json({
      status: application.status,
      completionPercentage: application.completionPercentage,
      isComplete: application.isComplete(),
      requiredSectionsComplete: application.requiredSectionsComplete,
      submittedAt: application.submittedAt,
      updatedAt: application.updatedAt,
      videoInfo: application.getVideoInfo(),
    });
  } catch (error) {
    console.error("Get application status error:", error);
    res.status(500).json({
      message: "Failed to retrieve application status",
      error: error.message,
    });
  }
});

// Route to validate individual section
router.post("/validate/:userId/:section", protect, async (req, res) => {
  try {
    const { userId, section } = req.params;
    const { data } = req.body;

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

    // Create a temporary application instance for validation
    const tempApp = new Application({ userId });
    tempApp[section] = data;

    // Validate the section
    try {
      await tempApp.validate();

      // Check section-specific completion
      let isComplete = false;
      switch (section) {
        case "warmUp":
          isComplete = !!(
            data.animalQuestion &&
            data.animalQuestion.length >= 10 &&
            data.accomplishment &&
            data.accomplishment.length >= 10 &&
            data.responseWhenLost &&
            data.responseWhenLost.length >= 10
          );
          break;
        case "commitment":
          isComplete = !!(
            data.canCommit &&
            data.incompleteCourses &&
            data.incompleteCourses.length >= 10 &&
            data.finishedHardThing &&
            data.finishedHardThing.length >= 10
          );
          break;
        case "purpose":
          isComplete = !!(
            data.whyTrade &&
            data.whyTrade.length >= 10 &&
            data.lifeChange &&
            data.lifeChange.length >= 10 &&
            data.doingFor &&
            data.doingFor.length >= 10 &&
            data.disciplineMeaning &&
            data.disciplineMeaning.length >= 10
          );
          break;
        case "exclusivity":
          isComplete = !!(
            data.preparedInvestment &&
            data.strongCandidate &&
            data.strongCandidate.length >= 10 &&
            data.firstPerson &&
            data.firstPerson.length >= 10
          );
          break;
        case "optional":
          isComplete = true; // Optional section is always complete
          break;
      }

      res.status(200).json({
        valid: true,
        isComplete,
        message: "Section data is valid",
      });
    } catch (validationError) {
      res.status(400).json({
        valid: false,
        isComplete: false,
        message: "Validation failed",
        errors: validationError.errors,
      });
    }
  } catch (error) {
    console.error("Validate section error:", error);
    res.status(500).json({
      message: "Failed to validate section",
      error: error.message,
    });
  }
});

// Route to get video data (for admin or user viewing)
router.get("/video/:userId", protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const { download = false } = req.query;

    const application = await Application.findOne({ userId });

    if (!application || !application.optional?.videoRecording) {
      return res.status(404).json({ message: "Video not found" });
    }

    if (download === "true") {
      // Return video data for download
      const videoData = application.optional.videoRecording;
      const metadata = application.videoMetadata || {};

      res.status(200).json({
        videoData,
        metadata,
        videoInfo: application.getVideoInfo(),
      });
    } else {
      // Return only metadata
      res.status(200).json({
        videoInfo: application.getVideoInfo(),
        metadata: application.videoMetadata || {},
      });
    }
  } catch (error) {
    console.error("Get video error:", error);
    res.status(500).json({
      message: "Failed to retrieve video",
      error: error.message,
    });
  }
});

// Route to get section progress for all users (Admin)
router.get("/progress/all", protect, async (req, res) => {
  try {
    const applications = await Application.find({})
      .populate("userId", "firstName lastName email")
      .select(
        "userId status completionPercentage warmUp commitment purpose exclusivity optional createdAt updatedAt"
      );

    const progressData = applications.map((app) => ({
      userId: app.userId._id,
      userInfo: {
        firstName: app.userId.firstName,
        lastName: app.userId.lastName,
        email: app.userId.email,
      },
      status: app.status,
      completionPercentage: app.completionPercentage,
      isComplete: app.isComplete(),
      requiredSectionsComplete: app.requiredSectionsComplete,
      sectionProgress: {
        warmUp: !!(
          app.warmUp?.animalQuestion &&
          app.warmUp?.accomplishment &&
          app.warmUp?.responseWhenLost
        ),
        commitment: !!(
          app.commitment?.canCommit &&
          app.commitment?.incompleteCourses &&
          app.commitment?.finishedHardThing
        ),
        purpose: !!(
          app.purpose?.whyTrade &&
          app.purpose?.lifeChange &&
          app.purpose?.doingFor &&
          app.purpose?.disciplineMeaning
        ),
        exclusivity: !!(
          app.exclusivity?.preparedInvestment &&
          app.exclusivity?.strongCandidate &&
          app.exclusivity?.firstPerson
        ),
        optional: true,
      },
      videoInfo: app.getVideoInfo(),
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    }));

    res.status(200).json({ progressData });
  } catch (error) {
    console.error("Get progress error:", error);
    res.status(500).json({
      message: "Failed to retrieve progress data",
      error: error.message,
    });
  }
});

// Add this route
router.post("/ensure/:userId", protect, ensureApplication);

export default router;
