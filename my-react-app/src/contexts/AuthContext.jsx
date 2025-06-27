"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { getUserProfile, getApplicationSections, createApplicationIfNeeded } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState(null)
  const [userId, setUserId] = useState(null)
  const [user, setUser] = useState(null)
  const [isApplicationCompleted, setIsApplicationCompleted] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState(null) // "In Review", "Accepted", "Confirmation Email Sent"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    warmUp: {
      animalQuestion: "",
      accomplishment: "",
      responseWhenLost: ""
    },
    commitment: {
      canCommit: "",
      incompleteCourses: "",
      finishedHardThing: ""
    },
    purpose: {
      whyTrade: "",
      lifeChange: "",
      doingFor: "",
      disciplineMeaning: ""
    },
    exclusivity: {
      preparedInvestment: "",
      strongCandidate: "",
      firstPerson: ""
    },
    videoSubmission: "",
    socialMedia: {
      twitter: "",
      instagram: "",
      linkedIn: "",
      facebook: ""
    },
    bio: "",
    profilePhoto: null
  })

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('authToken')
      const storedUserId = localStorage.getItem('userId')

      if (storedToken && storedUserId) {
        setToken(storedToken)
        setUserId(storedUserId)
        try {
          const profile = await getUserProfile(storedToken)
          setUser(profile)
          setIsApplicationCompleted(profile.isApplicationCompleted || false)
          setApplicationStatus(profile.applicationStatus || null)
        } catch {
          setUser(null)
          setIsApplicationCompleted(false)
          setApplicationStatus(null)
        }
      }
      setIsLoading(false) // <-- Move this here, after all async logic
    }

    initializeAuth()
  }, [])

  const login = async (authToken, userIdValue) => {
    setIsLoading(true);
    setToken(authToken);
    setUserId(userIdValue);
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('userId', userIdValue);

    try {
      const profile = await getUserProfile(authToken);
      setUser(profile);
      setIsApplicationCompleted(profile.isApplicationCompleted || false);
      setApplicationStatus(profile.applicationStatus || null);

      // Ensure application exists for this user (fixes 404 on first login)
      try {
        await createApplicationIfNeeded(userIdValue, authToken);
      } catch (e) { }

      // Only navigate to application step if NOT completed
      if (profile.isApplicationCompleted) {
        navigate('/dashboard');
      } else {
        const nextStep = await getNextApplicationStep(userIdValue, authToken);
        navigate(`/application/${nextStep}`);
      }
    } catch (error) {
      console.error('Login failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      setError(error.message || 'Login failed');
    }
    setIsLoading(false);
  };

  const logout = () => {
    setToken(null)
    setUserId(null)
    setUser(null)
    setIsApplicationCompleted(false)
    setApplicationStatus(null)
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      warmUp: {
        animalQuestion: "",
        accomplishment: "",
        responseWhenLost: ""
      },
      commitment: {
        canCommit: "",
        incompleteCourses: "",
        finishedHardThing: ""
      },
      purpose: {
        whyTrade: "",
        lifeChange: "",
        doingFor: "",
        disciplineMeaning: ""
      },
      exclusivity: {
        preparedInvestment: "",
        strongCandidate: "",
        firstPerson: ""
      },
      videoSubmission: "",
      socialMedia: {
        twitter: "",
        instagram: "",
        linkedIn: "",
        facebook: ""
      },
      bio: "",
      profilePhoto: null
    })

    localStorage.removeItem('authToken')
    localStorage.removeItem('userId')
    localStorage.removeItem('appState')
  }

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateApplicationData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }))
  }

  const markApplicationCompleted = async (status = "In Review") => {
    setIsApplicationCompleted(true)
    setApplicationStatus(status)

    // TODO: Send to backend API
    // await updateApplicationStatus(userId, true, status, token)

    // Fallback to localStorage
    localStorage.setItem('appCompleted', 'true')
  }

  const updateApplicationStatus = (status) => {
    setApplicationStatus(status)

    // TODO: Send to backend API
    // await updateUserApplicationStatus(userId, status, token)
  }

  const getNextApplicationStep = async (userId, token) => {
    try {
      const result = await getApplicationSections(userId, token);
      const { sections } = result;

      // Define the order of your steps/sections
      const sectionOrder = ['warmUp', 'commitment', 'purpose', 'exclusivity', 'optional'];

      // Find the first incomplete section
      for (let i = 0; i < sectionOrder.length; i++) {
        const section = sectionOrder[i];
        if (!sections[section]?.isComplete) {
          // Steps are usually 1-based in your routes
          return i + 1;
        }
      }
      // If all are complete, return the last step
      return sectionOrder.length;
    } catch (error) {
      // If no application exists, start at step 1
      return 1;
    }
  };

  const isAuthenticated = () => {
    return !!(token && userId)
  }

  const value = {
    // State
    isLoading,
    token,
    userId,
    user,
    isApplicationCompleted,
    setIsApplicationCompleted,
    applicationStatus,
    setApplicationStatus,
    formData,

    // Actions
    login,
    logout,
    updateFormData,
    updateApplicationData,
    markApplicationCompleted,
    updateApplicationStatus,
    isAuthenticated
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext

