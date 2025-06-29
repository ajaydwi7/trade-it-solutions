import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminAuthContext = createContext();

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = (adminUser, adminToken) => {
    setAdmin(adminUser);
    setToken(adminToken);
    localStorage.setItem("adminToken", adminToken);
    localStorage.setItem("adminUser", JSON.stringify(adminUser));
    navigate("/admin");
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/auth");
  };

  // Optionally, add useEffect to restore admin session from localStorage

  return (
    <AdminAuthContext.Provider value={{ admin, token, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};