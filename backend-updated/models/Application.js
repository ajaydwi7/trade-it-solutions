import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Optional for initial draft
      unique: true,
    },

    // Section 1: Warm-up
    warmUp: {
      animalQuestion: {
        type: String,
        required: false, // Optional for initial draft
        minlength: 10,
        maxlength: 2000,
      }, // Question 1: If you were an animal in the jungle, which one would you be and why?
      accomplishment: {
        type: String,
        required: false, // Optional for initial draft
        minlength: 10,
        maxlength: 2000,
      }, // Question 2: What’s something you’ve accomplished that you’re proud of but rarely talk about?
      responseWhenLost: {
        type: String,
        required: false, // Optional for initial draft
        minlength: 10,
        maxlength: 2000,
      }, // Question 3: When you fall behind or feel lost, how do you typically respond?
    },

    // Section 2: Commitment & Capacity
    commitment: {
      canCommit: {
        type: String,
        enum: ["Yes", "No"],
        required: false, // Optional for initial draft
      }, // Question 4: Do you currently have the ability to commit at least 6 - 10 focused hours per week to live learning, assessments, and study?
      incompleteCourses: {
        type: String,
        required: false, // Optional for initial draft
        minlength: 10,
        maxlength: 2000,
      }, // Question 5: Have you ever enrolled in a course or program and not completed it? If so, why?
      finishedHardThing: {
        type: String,
        required: false, // Optional for initial draft
        minlength: 10,
        maxlength: 2000,
      }, // Question 6: Have you ever finished something hard that no one was forcing you to do? What was it?
    },

    // Section 3: Purpose & Psychology
    purpose: {
      whyTrade: {
        type: String,
        required: false, // Optional for initial draft
        minlength: 10,
        maxlength: 2000,
      }, // Question 7: Why do you want to learn how to trade? Be specific.
      lifeChange: {
        type: String,
        required: false, // Optional for initial draft
        minlength: 10,
        maxlength: 2000,
      }, // Question 8: What would change in your life if you became a consistently profitable trader?
      doingFor: {
        type: String,
        required: false, // Optional for initial draft
        minlength: 10,
        maxlength: 2000,
      }, // Question 9: Who are you doing this for and why them?
      disciplineMeaning: {
        type: String,
        required: false, // Optional for initial draft
        minlength: 10,
        maxlength: 2000,
      }, // Question 10: What does discipline mean to you?
    },

    // Section 4: Exclusivity & Filtering
    exclusivity: {
      preparedInvestment: {
        type: String,
        enum: ["Yes", "No"],
        required: false, // Optional for initial draft
      }, // Question 11: This program costs $X,XXX if accepted. Are you prepared to make that investment in your future?
      strongCandidate: {
        type: String,
        required: false, // Optional for initial draft
        minlength: 10,
        maxlength: 2000,
      },
      firstPerson: {
        type: String,
        required: false,
        minlength: 10,
        maxlength: 2000,
      },
    },

    // Section 5: Optional Bonus
    optional: {
      videoRecording: {
        type: String,
        maxlength: 50000000,
      },
      videoUrl: {
        type: String,
        validate: {
          validator: function (v) {
            if (!v) return true;
            return /^https?:\/\/.+/.test(v);
          },
          message: "Please provide a valid URL",
        },
      },
      twitter: {
        type: String,
        maxlength: 100,
      },
      instagram: {
        type: String,
        maxlength: 100,
      },
      linkedIn: {
        type: String,
        maxlength: 200,
      },
      facebook: {
        type: String,
        maxlength: 200,
      },
      profilePhoto: {
        type: String,
        maxlength: 10000000,
      },
      fullName: {
        type: String,
        maxlength: 100,
      },
      bio: {
        type: String,
        maxlength: 1000,
      },
    },

    status: {
      type: String,
      enum: [
        "Draft",
        "In Review",
        "Accepted",
        "Rejected",
        "Confirmation Email Sent",
      ],
      default: "Draft",
    },

    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    adminNotes: { type: String },
    selectedPlan: {
      id: { type: String },
      name: { type: String },
      price: { type: Number },
    },
    videoMetadata: {
      duration: { type: Number },
      size: { type: Number },
      format: { type: String },
      recordedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ createdAt: -1 });

ApplicationSchema.virtual("completionPercentage").get(function () {
  let completed = 0;
  let total = 0;

  if (this.warmUp) {
    if (this.warmUp.animalQuestion && this.warmUp.animalQuestion.length >= 10)
      completed++;
    if (this.warmUp.accomplishment && this.warmUp.accomplishment.length >= 10)
      completed++;
    if (
      this.warmUp.responseWhenLost &&
      this.warmUp.responseWhenLost.length >= 10
    )
      completed++;
    total += 3;
  }

  if (this.commitment) {
    if (this.commitment.canCommit) completed++;
    if (
      this.commitment.incompleteCourses &&
      this.commitment.incompleteCourses.length >= 10
    )
      completed++;
    if (
      this.commitment.finishedHardThing &&
      this.commitment.finishedHardThing.length >= 10
    )
      completed++;
    total += 3;
  }

  if (this.purpose) {
    if (this.purpose.whyTrade && this.purpose.whyTrade.length >= 10)
      completed++;
    if (this.purpose.lifeChange && this.purpose.lifeChange.length >= 10)
      completed++;
    if (this.purpose.doingFor && this.purpose.doingFor.length >= 10)
      completed++;
    if (
      this.purpose.disciplineMeaning &&
      this.purpose.disciplineMeaning.length >= 10
    )
      completed++;
    total += 4;
  }

  if (this.exclusivity) {
    if (this.exclusivity.preparedInvestment) completed++;
    if (
      this.exclusivity.strongCandidate &&
      this.exclusivity.strongCandidate.length >= 10
    )
      completed++;
    if (
      this.exclusivity.firstPerson &&
      this.exclusivity.firstPerson.length >= 10
    )
      completed++;
    total += 3;
  }

  return total > 0 ? Math.round((completed / total) * 100) : 0;
});

ApplicationSchema.virtual("requiredSectionsComplete").get(function () {
  return this.completionPercentage === 100;
});

ApplicationSchema.methods.isComplete = function () {
  return this.requiredSectionsComplete;
};

ApplicationSchema.methods.submit = function () {
  if (this.isComplete()) {
    this.status = "In Review";
    this.submittedAt = new Date();
    return this.save();
  } else {
    throw new Error(
      `Application is not complete. Completion: ${this.completionPercentage}%`
    );
  }
};

ApplicationSchema.methods.getVideoInfo = function () {
  const hasRecording = !!this.optional?.videoRecording;
  const hasUrl = !!this.optional?.videoUrl;

  return {
    hasVideo: hasRecording || hasUrl,
    hasRecording,
    hasUrl,
    metadata: this.videoMetadata || null,
  };
};

ApplicationSchema.pre("save", function (next) {
  if (this.isModified() && this.isComplete() && this.status === "Draft") {
    this.status = "In Review";
    this.submittedAt = new Date();
  }

  if (
    this.isModified("optional.videoRecording") &&
    this.optional?.videoRecording
  ) {
    const videoData = this.optional.videoRecording;
    if (videoData.startsWith("data:video/")) {
      const sizeInBytes = Math.round((videoData.length * 3) / 4);
      this.videoMetadata = {
        size: sizeInBytes,
        format: videoData.split(";")[0].split("/")[1] || "webm",
        recordedAt: new Date(),
      };
    }
  }

  next();
});

ApplicationSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const totalApplications = await this.countDocuments();
  const completedApplications = await this.countDocuments({
    status: { $ne: "Draft" },
  });

  const applicationsWithVideo = await this.countDocuments({
    $or: [
      { "optional.videoRecording": { $exists: true, $ne: "" } },
      { "optional.videoUrl": { $exists: true, $ne: "" } },
    ],
  });

  const statsObject = {
    total: totalApplications,
    completed: completedApplications,
    draft: totalApplications - completedApplications,
    withVideo: applicationsWithVideo,
    byStatus: {},
  };

  stats.forEach((stat) => {
    statsObject.byStatus[stat._id] = stat.count;
  });

  return statsObject;
};

ApplicationSchema.virtual("currentSection").get(function () {
  if (!this.warmUp) return "warmUp";
  if (!this.commitment) return "commitment";
  if (!this.purpose) return "purpose";
  if (!this.exclusivity) return "exclusivity";
  return "optional";
});

ApplicationSchema.virtual("isSubmitted").get(function () {
  return this.status !== "Draft" && this.status !== "Not Started";
});

export default mongoose.model("Application", ApplicationSchema);
