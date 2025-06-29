"use client"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { AuthProvider } from "./contexts/AuthContext"
import { AdminAuthProvider } from "./contexts/AdminAuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import PublicRoute from "./components/PublicRoute"
import LandingPage from "./components/LandingPage"
import PersonalInfoStep from "./components/PersonalInfoStep"
import TermsAndPricingStep from "./components/TermsAndPricingStep"
import AuthStep from "./components/AuthStep"
import TermsConditionsPage from "./components/TermsConditionsPage"
import ApplicationForm from "./components/ApplicationForm"
import Dashboard from "./components/Dashboard"
import "./App.css"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import PersonalInfoPage from "./components/dashboard/PersonalInfoPage"
import ProfessionalInfoPage from "./components/dashboard/ProfessionalInfoPage"
import SettingsPage from "./components/dashboard/SettingsPage"
import AdminDashboard from "./components/Admin/AdminDashboard"
import AdminManagement from "./components/Admin/AdminManagement"
import ApplicationsManagement from "./components/Admin/ApplicationsManagement"
import UsersManagement from "./components/Admin/UsersManagement"
import AdminSettings from "./components/Admin/AdminSettings"
import AdminProtectedRoute from "./components/Admin/AdminProtectedRoutes"
import AdminAuthStep from "./components/Admin/AdminAuth"

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
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

              {/* Admin Authentication Route */}
              <Route
                path="/admin/auth"
                element={
                  <AdminAuthProvider>
                    <AdminAuthStep />
                  </AdminAuthProvider>
                }
              />

              {/* Admin Routes - All admin routes under one provider */}
              <Route
                path="/admin/*"
                element={
                  <AdminAuthProvider>
                    <Routes>
                      <Route
                        path="dashboard"
                        element={
                          <AdminProtectedRoute>
                            <AdminDashboard />
                          </AdminProtectedRoute>
                        }
                      />
                      <Route
                        path="users"
                        element={
                          <AdminProtectedRoute>
                            <UsersManagement />
                          </AdminProtectedRoute>
                        }
                      />
                      <Route
                        path="applications"
                        element={
                          <AdminProtectedRoute>
                            <ApplicationsManagement />
                          </AdminProtectedRoute>
                        }
                      />
                      <Route
                        path="admins"
                        element={
                          <AdminProtectedRoute>
                            <AdminManagement />
                          </AdminProtectedRoute>
                        }
                      />
                      <Route
                        path="settings"
                        element={
                          <AdminProtectedRoute>
                            <AdminSettings />
                          </AdminProtectedRoute>
                        }
                      />
                      {/* Default admin route - redirect to dashboard */}
                      <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
                      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                    </Routes>
                  </AdminAuthProvider>
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
                path="/dashboard/*"
                element={
                  <ProtectedRoute requireCompletedApplication={true}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              >
                <Route path="personal" element={<PersonalInfoPage />} />
                <Route path="professional" element={<ProfessionalInfoPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Catch all route - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
            />
          </div>
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  )
}

export default App
