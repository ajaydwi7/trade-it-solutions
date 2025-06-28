"use client"

import React, { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { ArrowLeftCircle, Mail, Eye, EyeOff } from "lucide-react"
import { register, login } from "../services/api";
import ProgressBar from "./ProgressBar"
import { toast } from 'react-toastify';

const AuthStep = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login: authLogin, formData: authFormData } = useAuth()

  // Check if user came from student login (should default to sign in)
  const cameFromStudentLogin = location.pathname === '/auth' && !location.state?.from
  const [isSignUp, setIsSignUp] = useState(!cameFromStudentLogin)
  const [showPassword, setShowPassword] = useState(false)
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
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
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
          password: formData.password
        });

        if (result.userId) {
          setError(null);
          setLoading(false);
          toast.success("Registration successful! Please log in to continue.");
          setIsSignUp(false); // Switch to login form
          // Optionally, prefill email
          setFormData((prev) => ({
            ...prev,
            password: "",
            confirmPassword: "",
            agreeToTerms: false,
          }));
          return;
        } else {
          setError(result.error || "Registration failed. Please try again.");
          setLoading(false);
          return;
        }
      } else {
        result = await login({
          email: formData.email,
          password: formData.password
        });
      }

      if (result.token && result.userId) {
        await authLogin(result.token, result.userId);
      } else {
        setError(result.error || "Authentication failed. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    if (cameFromStudentLogin) {
      navigate('/')
    } else {
      navigate('/onboarding/terms')
    }
  }

  const showTermsConditions = () => {
    navigate('/terms-conditions')
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
        {!cameFromStudentLogin && <ProgressBar progress={50} />}

        {error && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg z-50">
            {error}
          </div>
        )}

        <div className="min-h-screen flex flex-col justify-center px-4 py-8">
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-md">
              {/* Step Indicator */}
              <div className="flex items-center mb-16 text-white">
                <button onClick={handlePrev} className="flex items-center justify-center rounded-full mr-3">
                  <ArrowLeftCircle className="w-8 h-8" />
                </button>
                {!cameFromStudentLogin && <span className="text-sm">Step 3 of 4</span>}
              </div>

              {/* Auth Form */}
              <div className="bg-gray-800 bg-opacity-30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {isSignUp ? "Create an Account" : "Sign In"}
                </h1>

                <p className="text-gray-300 mb-8">
                  {isSignUp ? (
                    <>
                      Already have an account?{" "}
                      <button type="button" onClick={() => setIsSignUp(false)} className="text-blue-400 hover:underline">
                        Sign In
                      </button>
                    </>
                  ) : (
                    <>
                      Don't have an account?{" "}
                      <button type="button" onClick={() => setIsSignUp(true)} className="text-blue-400 hover:underline">
                        Create Account
                      </button>
                    </>
                  )}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignUp && (
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className="bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className="bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="w-full bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                    <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder={isSignUp ? "Enter your password" : "Password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="w-full bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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

                  {isSignUp && (
                    <input
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="w-full bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  )}

                  {!isSignUp && (
                    <div className="text-right">
                      <button type="button" className="text-gray-400 hover:text-white text-sm">
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {isSignUp && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={formData.agreeToTerms}
                        onChange={(e) => handleInputChange("agreeToTerms", e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        required
                      />
                      <label htmlFor="terms" className="ml-2 text-sm text-gray-300">
                        I agree to the{" "}
                        <button type="button" onClick={showTermsConditions} className="text-blue-400 hover:underline">
                          Terms & Condition
                        </button>
                      </label>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-blue-600 text-white rounded-lg px-4 py-3 hover:bg-blue-700 transition-colors font-medium ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      isSignUp ? "Create Account" : "Sign In"
                    )}
                  </button>
                </form>

                {/* Social Login Buttons */}
                <div className="text-center text-gray-400 mt-4">or</div>

                <div className="space-y-3 mt-4">
                  <button
                    type="button"
                    className="w-full bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg px-4 py-3 hover:bg-gray-600 transition-colors flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                  </button>

                  <button
                    type="button"
                    className="w-full bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg px-4 py-3 hover:bg-gray-600 transition-colors flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                    Log in with Apple
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthStep