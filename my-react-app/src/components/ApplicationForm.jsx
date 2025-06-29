"use client"

import React, { useState, useRef, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { ArrowLeftCircle, Upload, X, Video, Play, StopCircle, Pause } from "lucide-react"
import { getApplicationSections, saveApplicationSection, uploadVideo, submitApplication, markApplicationCompleted } from "../services/api";
import ProgressBar from "./ProgressBar"
import { toast } from "react-toastify";

const ApplicationForm = () => {
  const navigate = useNavigate()
  const { step } = useParams()
  const currentStep = parseInt(step) || 1
  const { token, userId, formData, updateApplicationData, setIsApplicationCompleted, setApplicationStatus } = useAuth();

  // Add loading state for API calls
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);


  const [filePreview, setFilePreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Video recording states
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordedVideo, setRecordedVideo] = useState(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [mediaStream, setMediaStream] = useState(null)
  const [videoUrl, setVideoUrl] = useState("")

  const videoRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  const steps = [
    { id: 1, title: "Warm-up", section: "warmUp" },
    { id: 2, title: "Commitment & Capacity", section: "commitment" },
    { id: 3, title: "Purpose & Psychology", section: "purpose" },
    { id: 4, title: "Exclusivity & Filtering", section: "exclusivity" },
    { id: 5, title: "Optional Bonus", section: "optional" },
  ]

  const calculateProgress = () => {
    return 75 + (currentStep - 1) * (25 / steps.length)
  }

  // Video recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      setMediaStream(stream)
      videoRef.current.srcObject = stream

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const videoURL = URL.createObjectURL(blob);
        setRecordedVideo(videoURL);

        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64data = reader.result;
          handleInputChange("videoRecording", base64data);

          // Upload to backend
          await uploadVideoToBackend(base64data);
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 60) {
            stopRecording()
            return 60
          }
          return prev + 1
        })
      }, 1000)

    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error('Could not access camera/microphone. Please check permissions.');
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop())
        setMediaStream(null)
      }
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        setIsPaused(false)
      } else {
        mediaRecorderRef.current.pause()
        setIsPaused(true)
      }
    }
  }

  const deleteRecording = () => {
    setRecordedVideo(null)
    setRecordingTime(0)
    handleInputChange("videoRecording", "")
  }

  const saveSectionToBackend = async (sectionName, sectionData) => {
    setApiLoading(true);
    setApiError(null);

    try {
      await saveApplicationSection(
        userId,
        sectionName,
        sectionData,
        token
      );
    } catch (error) {
      console.error("Save section error:", error);
      setApiError(error.message || "Failed to save section");
    } finally {
      setApiLoading(false);
    }
  };
  // Update uploadVideoToBackend function
  const uploadVideoToBackend = async (videoData) => {
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
    const chunks = Math.ceil(videoData.length / CHUNK_SIZE);

    for (let i = 0; i < chunks; i++) {
      const chunk = videoData.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      await uploadVideo(
        userId,
        chunk,
        {
          chunkIndex: i,
          totalChunks: chunks
        },
        token
      );
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [mediaStream])

  const validateField = (value, min = 10, max = 2000) => {
    if (!value) return false;
    const trimmed = value.trim();
    return trimmed.length >= min && trimmed.length <= max;
  };

  const validateCurrentStep = () => {
    const currentSection = steps[currentStep - 1]?.section;
    const sectionData = formData[currentSection] || {};

    switch (currentStep) {
      case 1: // Warm-up
        return (
          validateField(sectionData.animalQuestion) &&
          validateField(sectionData.accomplishment) &&
          validateField(sectionData.responseWhenLost)
        );

      case 2: // Commitment & Capacity
        return (
          ["Yes", "No"].includes(sectionData.canCommit) &&
          validateField(sectionData.incompleteCourses) &&
          validateField(sectionData.finishedHardThing)
        );

      case 3: // Purpose & Psychology
        return (
          validateField(sectionData.whyTrade) &&
          validateField(sectionData.lifeChange) &&
          validateField(sectionData.doingFor) &&
          validateField(sectionData.disciplineMeaning)
        );

      case 4: // Exclusivity & Filtering
        return (
          ["Yes", "No"].includes(sectionData.preparedInvestment) &&
          validateField(sectionData.strongCandidate) &&
          validateField(sectionData.firstPerson)
        );

      case 5: // Optional - no validation required
        return true;

      default:
        return true;
    }
  };
  useEffect(() => {
    if (!token || !userId) return;

    const fetchApplicationData = async () => {
      try {
        await getApplicationSections(userId, token);
      } catch (error) {
        setApiError(error.message || "Failed to load application data");
      }
    };

    fetchApplicationData();
  }, [currentStep, userId, token]);

  const handleNext = async () => {
    if (!token) {
      setApiError("Session expired. Please log in again.");
      toast.error("Session expired. Please log in again.");
      navigate("/auth");
      return;
    }

    try {
      await saveApplicationSection(
        userId,
        steps[currentStep - 1].section,
        formData[steps[currentStep - 1].section],
        token
      );

      if (currentStep === steps.length) {
        await submitApplication(token);
        try {
          await markApplicationCompleted(userId, "In Review", token);
          setIsApplicationCompleted(true);
          setApplicationStatus("In Review");
          toast.success("Application submitted successfully!");
        } catch (err) {
          if (err.status === 401) {
            setApiError("Session expired. Please log in again.");
            toast.error("Session expired. Please log in again.");
            navigate("/auth");
            return;
          }
          setApiError("Could not mark as completed, but your application was submitted.");
          toast.warn("Could not mark as completed, but your application was submitted.");
        }
        navigate('/dashboard');
      } else {
        toast.success("Section saved!");
        navigate(`/application/${currentStep + 1}`);
      }
    } catch (error) {
      setApiError(error.message || "Failed to save section");
      toast.error(error.message || "Failed to save section");
      // Do NOT navigate to step 1 here!
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      navigate(`/application/${currentStep - 1}`)
    } else {
      navigate('/auth')
    }
  }

  const handleInputChange = (field, value) => {
    const currentSection = steps[currentStep - 1]?.section
    updateApplicationData(currentSection, {
      ...formData[currentSection],
      [field]: value
    })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreview(reader.result)
        handleInputChange("profilePhoto", reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeFile = () => {
    setFilePreview(null)
    handleInputChange("profilePhoto", "")
  }

  const renderStepContent = () => {
    const currentSection = steps[currentStep - 1]?.section
    const sectionData = formData[currentSection] || {}

    switch (currentStep) {
      case 1: // Warm-up
        return (
          <div className="space-y-6">
            <div>
              {apiError && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg z-50">
                  {apiError}
                </div>
              )}
            </div>
            <div>
              <p className="text-white mb-3 font-medium">1. If you were an animal in the jungle, which one would you be and why?</p>
              <textarea
                value={sectionData.animalQuestion || ""}
                onChange={(e) => handleInputChange("animalQuestion", e.target.value)}
                className="w-full h-32 bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Your answer..."
              />
            </div>

            <div>
              <p className="text-white mb-3 font-medium">2. What's something you've accomplished that you're proud of but rarely talk about?</p>
              <textarea
                value={sectionData.accomplishment || ""}
                onChange={(e) => handleInputChange("accomplishment", e.target.value)}
                className="w-full h-32 bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Your answer..."
              />
            </div>

            <div>
              <p className="text-white mb-3 font-medium">3. When you fall behind or feel lost, how do you typically respond?</p>
              <textarea
                value={sectionData.responseWhenLost || ""}
                onChange={(e) => handleInputChange("responseWhenLost", e.target.value)}
                className="w-full h-32 bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Your answer..."
              />
            </div>
          </div>
        )

      case 2: // Commitment & Capacity
        return (
          <div className="space-y-6">
            <div>
              <p className="text-white mb-3 font-medium">4. Do you currently have the ability to commit at least 6 - 10 focused hours per week to live learning, assessments, and study?</p>
              <div className="flex gap-4">
                {["Yes", "No"].map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="canCommit"
                      value={option}
                      checked={sectionData.canCommit === option}
                      onChange={() => handleInputChange("canCommit", option)}
                      className="mr-2 text-blue-600"
                    />
                    <span className="text-white">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-white mb-3 font-medium">5. Have you ever enrolled in a course or program and not completed it? If so, why?</p>
              <textarea
                value={sectionData.incompleteCourses || ""}
                onChange={(e) => handleInputChange("incompleteCourses", e.target.value)}
                className="w-full h-32 bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Your answer..."
              />
            </div>

            <div>
              <p className="text-white mb-3 font-medium">6. Have you ever finished something hard that no one was forcing you to do? What was it?</p>
              <textarea
                value={sectionData.finishedHardThing || ""}
                onChange={(e) => handleInputChange("finishedHardThing", e.target.value)}
                className="w-full h-32 bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Your answer..."
              />
            </div>
          </div>
        )

      case 3: // Purpose & Psychology
        return (
          <div className="space-y-6">
            <div>
              <p className="text-white mb-3 font-medium">7. Why do you want to learn how to trade? Be specific.</p>
              <textarea
                value={sectionData.whyTrade || ""}
                onChange={(e) => handleInputChange("whyTrade", e.target.value)}
                className="w-full h-32 bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Your answer..."
              />
            </div>

            <div>
              <p className="text-white mb-3 font-medium">8. What would change in your life if you became a consistently profitable trader?</p>
              <textarea
                value={sectionData.lifeChange || ""}
                onChange={(e) => handleInputChange("lifeChange", e.target.value)}
                className="w-full h-32 bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Your answer..."
              />
            </div>

            <div>
              <p className="text-white mb-3 font-medium">9. Who are you doing this for and why them?</p>
              <textarea
                value={sectionData.doingFor || ""}
                onChange={(e) => handleInputChange("doingFor", e.target.value)}
                className="w-full h-32 bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Your answer..."
              />
            </div>

            <div>
              <p className="text-white mb-3 font-medium">10. What does discipline mean to you?</p>
              <textarea
                value={sectionData.disciplineMeaning || ""}
                onChange={(e) => handleInputChange("disciplineMeaning", e.target.value)}
                className="w-full h-32 bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Your answer..."
              />
            </div>
          </div>
        )

      case 4: // Exclusivity & Filtering
        return (
          <div className="space-y-6">
            <div>
              <p className="text-white mb-3 font-medium">11. This program costs $X,XXX if accepted. Are you prepared to make that investment in your future?</p>
              <div className="flex gap-4">
                {["Yes", "No"].map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="preparedInvestment"
                      value={option}
                      checked={sectionData.preparedInvestment === option}
                      onChange={() => handleInputChange("preparedInvestment", option)}
                      className="mr-2 text-blue-600"
                    />
                    <span className="text-white">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-white mb-3 font-medium">12. Why do you believe you're a strong candidate for acceptance into TradeIT?</p>
              <textarea
                value={sectionData.strongCandidate || ""}
                onChange={(e) => handleInputChange("strongCandidate", e.target.value)}
                className="w-full h-32 bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Your answer..."
              />
            </div>

            <div>
              <p className="text-white mb-3 font-medium">13. If accepted, who's the first person you would tell and why?</p>
              <textarea
                value={sectionData.firstPerson || ""}
                onChange={(e) => handleInputChange("firstPerson", e.target.value)}
                className="w-full h-32 bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Your answer..."
              />
            </div>
          </div>
        )

      case 5: // Optional Bonus
        return (
          <div className="space-y-8">
            {/* Video Submission Section */}
            <div>
              <p className="text-white mb-3 font-medium text-lg">Video Submission (Optional)</p>
              <p className="text-gray-400 text-sm mb-4">Record a 60-second video explaining why you want to be a part of TradeIT</p>

              {/* Video Recording Interface */}
              <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 mb-4">
                <div className="flex flex-col items-center space-y-4">
                  {/* Video Preview */}
                  <div className="w-full max-w-md">
                    {recordedVideo ? (
                      <div className="relative">
                        <video
                          src={recordedVideo}
                          controls
                          className="w-full rounded-lg"
                        />
                        <button
                          onClick={deleteRecording}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        className={`w-full rounded-lg ${isRecording ? 'block' : 'hidden'}`}
                      />
                    )}
                  </div>

                  {/* Recording Controls */}
                  {!recordedVideo && (
                    <div className="flex items-center space-x-4">
                      {!isRecording ? (
                        <button
                          onClick={startRecording}
                          className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Start Recording
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={pauseRecording}
                            className="flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg"
                          >
                            {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                            {isPaused ? 'Resume' : 'Pause'}
                          </button>
                          <button
                            onClick={stopRecording}
                            className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                          >
                            <StopCircle className="w-4 h-4 mr-2" />
                            Stop
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* Timer */}
                  {isRecording && (
                    <div className="text-white font-mono text-lg">
                      {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')} / 1:00
                    </div>
                  )}
                </div>
              </div>

              {/* Alternative URL Input */}
              <div className="text-center text-gray-400 mb-4">or</div>
              <input
                type="url"
                placeholder="Paste video URL here"
                value={videoUrl}
                onChange={(e) => {
                  setVideoUrl(e.target.value)
                  handleInputChange("videoUrl", e.target.value)
                }}
                className="w-full bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Social Media Section */}
            <div>
              <p className="text-white mb-3 font-medium text-lg">Social Media (Optional)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { platform: "Twitter", field: "twitter", placeholder: "@username" },
                  { platform: "Instagram", field: "instagram", placeholder: "@username" },
                  { platform: "LinkedIn", field: "linkedIn", placeholder: "linkedin.com/in/username" },
                  { platform: "Facebook", field: "facebook", placeholder: "facebook.com/username" }
                ].map(social => (
                  <input
                    key={social.field}
                    type="text"
                    value={sectionData[social.field] || ""}
                    onChange={(e) => handleInputChange(social.field, e.target.value)}
                    placeholder={`${social.platform} - ${social.placeholder}`}
                    className="w-full bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                ))}
              </div>
            </div>

            {/* Profile Photo Section */}
            <div>
              <p className="text-white mb-3 font-medium text-lg">Profile Photo (Optional)</p>
              <div className="flex items-center space-x-4">
                <label className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {filePreview ? (
                    <div className="relative">
                      <img
                        src={filePreview}
                        alt="Profile preview"
                        className="w-28 h-28 rounded-lg object-cover"
                      />
                      <button
                        onClick={removeFile}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Upload Photo</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Name and Bio Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-white mb-3 font-medium">Full Name (Optional)</p>
                <input
                  type="text"
                  value={sectionData.fullName || ""}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Your full name"
                  className="w-full bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <p className="text-white mb-3 font-medium">Bio (Optional)</p>
                <textarea
                  value={sectionData.bio || ""}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Tell us a bit about yourself..."
                  className="w-full h-24 bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0 hidden md:block">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WEB%20BACKGROUND.png-OZ4OMdtxyVzgNZTsKH6DnBI8zA47Ol.jpeg"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 md:hidden">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MOBILE%20BACKGROUND.jpg-PHaF8vfpeVmOjN6jtm4jvvI91pnyCR.jpeg"
          alt="Mobile Background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10">
        <ProgressBar progress={calculateProgress()} showPercent={true} />

        <div className="min-h-screen flex items-center justify-center px-4 pt-8">
          <div className="w-full max-w-6xl">
            {/* Header */}
            <div className="flex items-center mb-8 text-white">
              <button onClick={handlePrev} className="flex items-center justify-center rounded-full mr-3">
                <ArrowLeftCircle className="w-8 h-8" />
              </button>
              <span className="text-sm">Step {currentStep} of {steps.length}</span>
            </div>

            {/* Main Content */}
            <div className="bg-gray-900 bg-opacity-40 backdrop-blur-xl border border-gray-700 rounded-2xl p-8">
              <h1 className="text-3xl font-bold text-white mb-8">Application Form</h1>

              <div className="grid lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                  <div className="space-y-2">
                    {steps.map((stepItem, index) => (
                      <div key={stepItem.id} className="flex items-center">
                        <div className="flex flex-col items-center mr-4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-300 ${stepItem.id === currentStep
                              ? "bg-blue-600 text-white"
                              : stepItem.id < currentStep
                                ? "bg-green-600 text-white"
                                : "bg-gray-700 text-gray-300"
                              }`}
                          >
                            {stepItem.id}
                          </div>
                          {index < steps.length - 1 && (
                            <div
                              className={`w-0.5 h-8 transition-colors duration-300 ${stepItem.id < currentStep ? "bg-green-600" : "bg-gray-600"
                                }`}
                            ></div>
                          )}
                        </div>
                        <span
                          className={`py-1 text-sm font-medium ${stepItem.id === currentStep
                            ? "text-white"
                            : stepItem.id < currentStep
                              ? "text-green-400"
                              : "text-gray-400"
                            }`}
                        >
                          {stepItem.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Content */}
                <div className="lg:col-span-3">
                  <div className="bg-gray-800 bg-opacity-30 rounded-lg p-6 min-h-[500px]">
                    {renderStepContent()}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={handlePrev}
                  className="px-6 py-3 text-white border border-gray-600 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
                >
                  Prev
                </button>

                <button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className={`px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : currentStep === steps.length ? "Complete Application" : "Save and continue"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplicationForm

