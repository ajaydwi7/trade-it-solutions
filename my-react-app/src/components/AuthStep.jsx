"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { ArrowLeftCircle, Mail, Eye, EyeOff, Apple } from "lucide-react"
import { register, login } from "../services/api"
import { toast } from "react-toastify"
import { GoogleLogin } from "@react-oauth/google"
import ProgressBar from "./ProgressBar";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const AuthStep = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login: authLogin, formData: authFormData } = useAuth()

  // Check if user came from student login (should default to sign in)
  const cameFromStudentLogin = location.pathname === "/auth" && !location.state?.from
  const [isSignUp, setIsSignUp] = useState(!cameFromStudentLogin)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    firstName: authFormData.name?.split(" ")[0] || "",
    lastName: authFormData.name?.split(" ")[1] || "",
    email: authFormData.email || "",
    phone: authFormData.phone || "",
    address: authFormData.address || "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Basic validation
    if (isSignUp) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError("Please enter a valid email address")
        setLoading(false)
        return
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters")
        setLoading(false)
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords don't match")
        setLoading(false)
        return
      }
      if (!formData.agreeToTerms) {
        setError("You must agree to the terms")
        setLoading(false)
        return
      }
    }

    try {
      let result
      if (isSignUp) {
        result = await register({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          password: formData.password,
        })

        if (result.userId) {
          setError(null)
          setLoading(false)
          toast.success("Registration successful! Please log in to continue.")
          setIsSignUp(false)
          setFormData((prev) => ({
            ...prev,
            password: "",
            confirmPassword: "",
            agreeToTerms: false,
          }))
          return
        } else {
          setError(result.error || "Registration failed. Please try again.")
          setLoading(false)
          return
        }
      } else {
        result = await login({
          email: formData.email,
          password: formData.password,
        })
      }

      if (result.token && result.userId) {
        await authLogin(result.token, result.userId)
      } else {
        // Show user-friendly error for login failure
        setError("Invalid email or password")
      }
    } catch (err) {
      // Show user-friendly error for login failure
      setError("Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  const handlePrev = () => {
    if (cameFromStudentLogin) {
      navigate("/")
    } else {
      navigate("/onboarding/terms")
    }
  }

  const showTermsConditions = () => {
    navigate("/terms-conditions")
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      })
      const result = await res.json()
      if (result.token && result.userId) {
        await authLogin(result.token, result.userId)
        toast.success("Logged in with Google!")
      } else {
        toast.error(result.error || "Google authentication failed")
      }
    } catch (err) {
      toast.error("Google authentication failed")
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900 relative overflow-hidden">
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
        {/* Progress bar for Auth step (Step 3 of 4 = 75%) */}
        <ProgressBar progress={75} showPercent={true} />

        {/* Error notification */}
        {error && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg z-50 shadow-lg">
            {error}
          </div>
        )}
        {/* Main form container */}
        <div className="flex items-center justify-center min-h-screen p-8">
          <div className="w-full max-w-lg">
            {/* Step Indicator */}
            <div className="flex items-center text-white mb-16">
              <button onClick={handlePrev} className="flex items-center justify-center rounded-full mr-3">
                <ArrowLeftCircle className="w-8 h-8" />
              </button>
              <span className="text-sm">Step 3 of 4</span>
            </div>
            {/* Form card */}
            <div className="bg-black/20 backdrop-blur-2xl border border-indigo-500/50 rounded-3xl p-10 shadow-2xl">
              <div className="space-y-6">
                {/* Header */}
                <div className="space-y-2">
                  <h1 className="text-4xl font-normal text-white leading-[50px]">
                    {isSignUp ? "Create an Account" : "Sign In"}
                  </h1>
                  <p className="text-xl font-normal text-white leading-normal">
                    {isSignUp ? (
                      <>
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setIsSignUp(false)}
                          className="text-indigo-500 underline hover:text-indigo-400"
                        >
                          Sign in
                        </button>
                      </>
                    ) : (
                      <>
                        Don't have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setIsSignUp(true)}
                          className="text-indigo-500 underline hover:text-indigo-400"
                        >
                          Create Account
                        </button>
                      </>
                    )}
                  </p>
                </div>

                {/* Form fields */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name fields for sign up */}
                  {isSignUp && (
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className="bg-gradient-to-r from-[#5558B9] to-purple-500 border border-indigo-700/50 text-white placeholder:text-gray-600 focus:border-indigo-600 focus:ring-indigo-600/20 rounded-lg px-5 py-4 text-lg font-medium focus:outline-none focus:ring-1"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className="bg-indigo-700/50 border border-indigo-700/50 text-white placeholder:text-gray-600 focus:border-indigo-600 focus:ring-indigo-600/20 rounded-lg px-5 py-4 text-lg font-medium focus:outline-none focus:ring-1"
                        required
                      />
                    </div>
                  )}

                  {/* Email field */}
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="w-full bg-indigo-700/50 border border-indigo-700/50 text-white placeholder:text-gray-600 focus:border-indigo-600 focus:ring-indigo-600/20 rounded-lg px-5 py-4 pr-12 text-lg font-medium focus:outline-none focus:ring-1"
                      required
                    />
                    {!isSignUp && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="bg-indigo-500 rounded-md p-1.5 shadow-[0px_0px_40px_0px_rgba(88,93,239,1.00)]">
                          <Mail className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Password field */}
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder={isSignUp ? "Enter your password" : "Password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="w-full bg-indigo-700/50 border border-indigo-700/50 text-white placeholder:text-gray-600 focus:border-indigo-600 focus:ring-indigo-600/20 rounded-lg px-5 py-4 pr-12 text-lg font-medium focus:outline-none focus:ring-1"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Confirm password field for sign up */}
                  {isSignUp && (
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className="w-full bg-indigo-700/50 border border-indigo-700/50 text-white placeholder:text-gray-600 focus:border-indigo-600 focus:ring-indigo-600/20 rounded-lg px-5 py-4 pr-12 text-lg font-medium focus:outline-none focus:ring-1"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  )}

                  {/* Forgot password for sign in */}
                  {!isSignUp && (
                    <div className="text-left">
                      <button type="button" className="text-white text-base font-medium hover:text-gray-300">
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {/* Terms checkbox for sign up */}
                  {isSignUp && (
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={formData.agreeToTerms}
                        onChange={(e) => handleInputChange("agreeToTerms", e.target.checked)}
                        className="w-5 h-5 text-indigo-600 bg-white border-zinc-300 rounded focus:ring-indigo-500 focus:ring-2"
                        required
                      />
                      <label htmlFor="terms" className="text-base font-medium text-white">
                        I agree to the{" "}
                        <button
                          type="button"
                          onClick={showTermsConditions}
                          className="text-indigo-500 underline hover:text-indigo-400"
                        >
                          Terms & Condition
                        </button>
                      </label>
                    </div>
                  )}

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium text-xl py-4 rounded-lg transition-colors ${loading ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8z"
                          ></path>
                        </svg>
                        Processing...
                      </span>
                    ) : isSignUp ? (
                      "Create account"
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-base font-normal">
                    <span className="bg-black/20 px-2 text-white">or</span>
                  </div>
                </div>

                {/* Social login buttons */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Custom styled Google Login */}
                  <div className="google-login-wrapper">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => {
                        toast.error("Google authentication failed")
                      }}
                      theme="filled_black"
                      text="signin_with"
                      shape="rectangular"
                      size="large"
                      width="240"
                    />
                  </div>

                  <button
                    type="button"
                    className="bg-zinc-950 border border-slate-500 text-white hover:bg-zinc-800 flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg transition-colors shadow-[0px_5px_40px_0px_rgba(0,0,0,0.05)]"
                  >
                    <Apple className="w-6 h-6" />
                    <span className="text-base font-medium">Log in with Apple</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for Google Login styling */}
      <style>{`
        .google-login-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .google-login-wrapper > div {
          width: 100% !important;
        }
        
        .google-login-wrapper iframe {
          width: 100% !important;
          height: 56px !important;
          border-radius: 8px !important;
        }
        
        .google-login-wrapper [role="button"] {
          width: 100% !important;
          height: 56px !important;
          background-color: #09090b !important;
          border: 1px solid #64748b !important;
          border-radius: 8px !important;
          box-shadow: 0px 5px 40px 0px rgba(0,0,0,0.05) !important;
          transition: background-color 0.2s ease !important;
        }
        
        .google-login-wrapper [role="button"]:hover {
          background-color: #27272a !important;
        }
        
        .google-login-wrapper [role="button"] span {
          font-size: 16px !important;
          font-weight: 500 !important;
          color: white !important;
        }
      `}</style>
    </div>
  )
}

export default AuthStep
