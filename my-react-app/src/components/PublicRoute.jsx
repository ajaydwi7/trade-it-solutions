"use client";

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingScreen from "./LoadingScreen";

const PublicRoute = ({ children, redirectIfAuthenticated = true }) => {
  const { isLoading, isAuthenticated, isApplicationCompleted } = useAuth();

  if (isLoading) return <LoadingScreen />; // Or a loading spinner

  if (redirectIfAuthenticated && isAuthenticated()) {
    if (isApplicationCompleted) {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/application/1" replace />;
    }
  }

  return children;
};

export default PublicRoute;