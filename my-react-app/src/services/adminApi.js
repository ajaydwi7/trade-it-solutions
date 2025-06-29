const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const registerAdmin = async (data) => {
  const response = await fetch(`${API_BASE_URL}/admin/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok)
    throw new Error((await response.json()).error || "Registration failed");
  return response.json();
};

export const loginAdmin = async (data) => {
  const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok)
    throw new Error((await response.json()).error || "Login failed");
  return response.json();
};

// Admin Dashboard Stats
export const getAdminStats = async (token) => {
  const response = await fetch(`${API_BASE_URL}/admin/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch admin stats");
  }

  return response.json();
};

export const getRecentApplications = async (token, limit = 5) => {
  const response = await fetch(
    `${API_BASE_URL}/admin/applications/recent?limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch recent applications");
  }

  return response.json();
};

export const getDashboardAnalytics = async (token, period = "30") => {
  const response = await fetch(
    `${API_BASE_URL}/admin/analytics?period=${period}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard analytics");
  }

  return response.json();
};

// Users Management
export const getAllUsers = async (token, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE_URL}/admin/users?${queryString}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  const data = await response.json();
  return data.users;
};

export const getUserById = async (userId, token) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  const data = await response.json();
  return data.user;
};

export const updateUser = async (userId, userData, token) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error("Failed to update user");
  }

  const data = await response.json();
  return data.user;
};

export const deleteUser = async (userId, token) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete user");
  }

  return response.json();
};

export const updateUserStatus = async (userId, status, token) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error("Failed to update user status");
  }

  const data = await response.json();
  return data.user;
};

// Applications Management
export const getAllApplications = async (token, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(
    `${API_BASE_URL}/admin/applications?${queryString}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch applications");
  }

  const data = await response.json();
  return data.applications;
};

export const getApplicationById = async (applicationId, token) => {
  const response = await fetch(
    `${API_BASE_URL}/admin/applications/${applicationId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch application");
  }

  return response.json();
};

export const updateApplicationStatus = async (
  applicationId,
  status,
  token,
  adminNotes = ""
) => {
  const response = await fetch(
    `${API_BASE_URL}/admin/applications/${applicationId}/status`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, adminNotes }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update application status");
  }

  return response.json();
};

// Admin Management
export const getAllAdmins = async (token, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE_URL}/admin/admins?${queryString}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch admins");
  }

  const data = await response.json();
  return data.admins;
};

export const createAdmin = async (adminData, token) => {
  const response = await fetch(`${API_BASE_URL}/admin/admins`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(adminData),
  });

  if (!response.ok) {
    throw new Error("Failed to create admin");
  }

  const data = await response.json();
  return data.admin;
};

export const updateAdmin = async (adminId, adminData, token) => {
  const response = await fetch(`${API_BASE_URL}/admin/admins/${adminId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(adminData),
  });

  if (!response.ok) {
    throw new Error("Failed to update admin");
  }

  const data = await response.json();
  return data.admin;
};

export const deleteAdmin = async (adminId, token) => {
  const response = await fetch(`${API_BASE_URL}/admin/admins/${adminId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete admin");
  }

  return response.json();
};

export const updateAdminRole = async (adminId, role, token) => {
  const response = await fetch(`${API_BASE_URL}/admin/admins/${adminId}/role`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    throw new Error("Failed to update admin role");
  }

  const data = await response.json();
  return data.admin;
};

// Admin Settings
export const updateAdminProfile = async (profileData, token) => {
  const response = await fetch(`${API_BASE_URL}/admin/profile`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    throw new Error("Failed to update profile");
  }

  const data = await response.json();
  return data.admin;
};

export const changeAdminPassword = async (passwordData, token) => {
  const response = await fetch(`${API_BASE_URL}/admin/change-password`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(passwordData),
  });

  if (!response.ok) {
    throw new Error("Failed to change password");
  }

  return response.json();
};

export const updateAdminSettings = async (settings, token) => {
  const response = await fetch(`${API_BASE_URL}/admin/settings`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error("Failed to update settings");
  }

  return response.json();
};
