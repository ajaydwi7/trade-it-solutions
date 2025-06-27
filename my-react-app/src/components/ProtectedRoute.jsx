"use client"

import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingScreen from './LoadingScreen';

const ProtectedRoute = ({ children, requireCompletedApplication = false }) => {
  const { isLoading, isAuthenticated, isApplicationCompleted } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />; // Or a loading spinner

  if (!isAuthenticated()) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireCompletedApplication && !isApplicationCompleted) {
    return <Navigate to="/application/1" replace />;
  }

  return children;
};

export default ProtectedRoute

