"use client"

import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { ArrowLeft, ArrowLeftCircle, User, Mail, Phone, MapPin } from "lucide-react"
import ProgressBar from "./ProgressBar" // Assuming ProgressBar is still used and styled as before

const PersonalInfoStep = () => {
  const navigate = useNavigate()
  const { step } = useParams()
  const currentSubStep = parseInt(step) || 1
  const { formData, updateFormData } = useAuth()

  // State management for validation and submission
  const [error, setError] = useState("")
  const [touched, setTouched] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const calculateProgress = () => {
    return (currentSubStep - 1) * 7.5 + 7.5
  }

  // Function to get content and validation for each step
  const getStepContent = () => {
    switch (currentSubStep) {
      case 1:
        return {
          title: "Personal Info",
          subtitle: "Let's get to know you! What's the magic in you?",
          placeholder: "What's your name?",
          field: "name",
          value: formData.name,
          type: "text",
          validation: (value) => {
            if (!value || value.trim().length === 0) {
              return "Name is required"
            }
            if (value.trim().length < 2) {
              return "Name must be at least 2 characters"
            }
            return null
          }
        }
      case 2:
        return {
          title: "Personal Info",
          subtitle: "We will be happy to mail you exclusives.",
          placeholder: "What's your email address?",
          field: "email",
          value: formData.email,
          type: "email",
          validation: (value) => {
            if (!value || value.trim().length === 0) {
              return "Email is required"
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(value)) {
              return "Please enter a valid email address"
            }
            return null
          }
        }
      case 3:
        return {
          title: "Personal Info",
          subtitle: "Give us a buzz, we need to stay in touch.",
          placeholder: "What's your phone number?",
          field: "phone",
          value: formData.phone,
          type: "tel",
          validation: (value) => {
            if (!value || value.trim().length === 0) {
              return "Phone number is required"
            }
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
            const cleanPhone = value.replace(/[\s\-\(\)]/g, '')
            if (!phoneRegex.test(cleanPhone)) {
              return "Please enter a valid phone number"
            }
            if (cleanPhone.length < 10) {
              return "Phone number must be at least 10 digits"
            }
            return null
          }
        }
      case 4:
        return {
          title: "Personal Info",
          subtitle: "Where's home? we would someday send some love your way!",
          placeholder: "What's your home address?",
          field: "address",
          value: formData.address,
          type: "text",
          validation: (value) => {
            if (!value || value.trim().length === 0) {
              return "Address is required"
            }
            if (value.trim().length < 10) {
              return "Please enter a complete address"
            }
            return null
          }
        }
      default:
        return {}
    }
  }

  const stepContent = getStepContent()

  // Validate current field on change and blur
  useEffect(() => {
    if (touched && stepContent.validation) {
      const validationError = stepContent.validation(stepContent.value)
      setError(validationError || "")
    }
  }, [stepContent.value, touched, stepContent.validation])

  // Reset error and touched state when step changes
  useEffect(() => {
    setError("")
    setTouched(false)
  }, [currentSubStep])

  const handleInputChange = (e) => {
    const value = e.target.value
    updateFormData(stepContent.field, value)
    setTouched(true) // Mark as touched on first change
  }

  const handleInputBlur = () => {
    setTouched(true) // Mark as touched on blur
  }

  const isValid = stepContent.validation ? !stepContent.validation(stepContent.value) : true

  const handleNext = (e) => {
    e.preventDefault() // Prevent default form submission behavior
    setIsSubmitting(true)

    if (!touched) {
      setTouched(true) // Ensure validation runs if not touched yet
    }

    const validationError = stepContent.validation(stepContent.value)
    if (validationError) {
      setError(validationError)
      setIsSubmitting(false)
      return
    }

    // If validation passes, proceed to next step or terms
    if (currentSubStep < 4) {
      navigate(`/onboarding/personal-info/${currentSubStep + 1}`)
    } else {
      navigate('/onboarding/terms')
    }
    setIsSubmitting(false)
  }

  const handlePrev = () => {
    if (currentSubStep > 1) {
      navigate(`/onboarding/personal-info/${currentSubStep - 1}`)
    } else {
      navigate('/') // Go back to landing page
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
        <ProgressBar progress={calculateProgress()} />

        <div className="min-h-screen flex flex-col justify-center px-4 py-8">
          <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col justify-center">
            {/* Step Indicator */}
            <div className="flex items-center text-white mb-16">
              <button onClick={handlePrev} className="flex items-center justify-center rounded-full mr-3">
                <ArrowLeftCircle className="w-8 h-8" />
              </button>
              <span className="text-sm">Step {currentSubStep} of 4</span>
            </div>

            {/* Form Content */}
            <div className="mb-16 flex-1 flex flex-col justify-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{stepContent.title}</h1>
              <p className="text-gray-300 text-lg mb-8">{stepContent.subtitle}</p>

              <div className="space-y-2">
                <input
                  type={stepContent.type}
                  placeholder={stepContent.placeholder}
                  value={stepContent.value}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={`w-full bg-transparent border rounded-lg px-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-1 text-lg transition-colors ${error && touched
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                />
                {error && touched && (
                  <p className="text-red-400 text-sm mt-2">{error}</p>
                )}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrev}
                disabled={currentSubStep === 1 || isSubmitting}
                className="flex items-center px-6 py-3 text-white border border-gray-600 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Prev
              </button>

              <button
                onClick={handleNext}
                disabled={!isValid || isSubmitting}
                className={`px-8 py-3 rounded-lg transition-colors font-medium ${isValid && !isSubmitting ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PersonalInfoStep;
