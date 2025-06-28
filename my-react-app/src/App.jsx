"use client"

import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import LandingPage from './components/LandingPage'
import PersonalInfoStep from './components/PersonalInfoStep'
import TermsAndPricingStep from './components/TermsAndPricingStep'
import AuthStep from './components/AuthStep'
import TermsConditionsPage from './components/TermsConditionsPage'
import ApplicationForm from './components/ApplicationForm'
import Dashboard from './components/Dashboard'
import LoadingScreen from './components/LoadingScreen'
import './App.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* Public Routes - accessible when not authenticated */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <LandingPage />
                </PublicRoute>
              }
            />

            {/* Onboarding Routes - for new users starting application */}
            <Route
              path="/onboarding/personal-info/:step"
              element={
                <PublicRoute>
                  <PersonalInfoStep />
                </PublicRoute>
              }
            />

            <Route
              path="/onboarding/terms"
              element={
                <PublicRoute>
                  <TermsAndPricingStep />
                </PublicRoute>
              }
            />

            <Route
              path="/auth"
              element={
                <PublicRoute>
                  <AuthStep />
                </PublicRoute>
              }
            />

            <Route
              path="/terms-conditions"
              element={
                <PublicRoute>
                  <TermsConditionsPage />
                </PublicRoute>
              }
            />

            {/* Protected Routes - require authentication */}
            <Route
              path="/application/:step"
              element={
                <ProtectedRoute>
                  <ApplicationForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requireCompletedApplication={true}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App

