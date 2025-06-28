const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// Utility function for making authenticated requests
const authenticatedRequest = async (url, method, data = null, token = null) => {
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const config = {
    method,
    headers,
    ...(data && { body: JSON.stringify(data) }),
  };

  try {
    const response = await fetch(url, config);
    const responseData = await response.json();

    if (!response.ok) {
      const error = new Error(responseData.message || "API request failed");
      error.status = response.status;
      throw error;
    }

    return responseData;
  } catch (error) {
    console.error(`API Error (${method} ${url}):`, error);
    throw error;
  }
};

// Auth API calls
export const login = async (credentials) => {
  return authenticatedRequest(
    `${API_BASE_URL}/auth/login`,
    "POST",
    credentials
  );
};

export const register = async (userData) => {
  return authenticatedRequest(
    `${API_BASE_URL}/auth/register`,
    "POST",
    userData
  );
};

export const logout = async (token) => {
  return authenticatedRequest(
    `${API_BASE_URL}/auth/logout`,
    "POST",
    null,
    token
  );
};

// User API calls
export const getUserProfile = async (token) => {
  return authenticatedRequest(
    `${API_BASE_URL}/users/profile`,
    "GET",
    null,
    token
  );
};

export const updateUserProfile = async (userId, userData, token) => {
  return authenticatedRequest(
    `${API_BASE_URL}/users/profile/${userId}`,
    "PUT",
    userData,
    token
  );
};

// Application API calls
export const createApplicationIfNeeded = async (userId, token) => {
  return authenticatedRequest(
    `${API_BASE_URL}/applications/ensure/${userId}`,
    "POST",
    null,
    token
  );
};

export const submitApplication = async (token) => {
  return authenticatedRequest(
    `${API_BASE_URL}/applications/submit`,
    "POST",
    null,
    token
  );
};

export const saveApplicationSection = async (
  userId,
  sectionName,
  sectionData,
  token
) => {
  return authenticatedRequest(
    `${API_BASE_URL}/applications/section/${userId}`,
    "POST",
    { section: sectionName, data: sectionData },
    token
  );
};

export const getApplicationSections = async (userId, token) => {
  return authenticatedRequest(
    `${API_BASE_URL}/applications/sections/${userId}`,
    "GET",
    null,
    token
  );
};

export const getApplicationStatus = async (userId, token) => {
  return authenticatedRequest(
    `${API_BASE_URL}/applications/status/${userId}`,
    "GET",
    null,
    token
  );
};

export const uploadVideo = async (userId, videoData, metadata, token) => {
  return authenticatedRequest(
    `${API_BASE_URL}/applications/video/${userId}`,
    "POST",
    { videoData, metadata },
    token
  );
};

export const deleteVideo = async (userId, token) => {
  return authenticatedRequest(
    `${API_BASE_URL}/applications/video/${userId}`,
    "DELETE",
    null,
    token
  );
};

// Admin API calls
export const getAllApplications = async (token) => {
  return authenticatedRequest(
    `${API_BASE_URL}/applications/all`,
    "GET",
    null,
    token
  );
};

export const updateApplicationStatus = async (
  applicationId,
  status,
  adminNotes,
  token
) => {
  return authenticatedRequest(
    `${API_BASE_URL}/applications/status/${applicationId}`,
    "PUT",
    { status, adminNotes },
    token
  );
};

export const getApplicationStats = async (token) => {
  return authenticatedRequest(
    `${API_BASE_URL}/applications/stats`,
    "GET",
    null,
    token
  );
};

export const markApplicationCompleted = async (
  userId,
  status = "In Review",
  token
) => {
  return authenticatedRequest(
    `${API_BASE_URL}/users/${userId}/complete-application`,
    "POST",
    { status },
    token
  );
};

// src/services/api.js
export const getApplication = async (userId, token) => {
  return authenticatedRequest(
    `${API_BASE_URL}/applications/user/${userId}`,
    "GET",
    null,
    token
  );
};
