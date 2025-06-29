import React from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../../contexts/AdminAuthContext";

const AdminProtectedRoute = ({ children }) => {
  const { admin, token } = useAdminAuth();
  if (!admin || !token) {
    return <Navigate to="/admin/auth" replace />;
  }
  return children;
};

export default AdminProtectedRoute;