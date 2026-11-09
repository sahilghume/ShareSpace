const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Common API request function
async function apiRequest(endpoint, method, body) {
  const token = getToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(body !== undefined && {
      body: JSON.stringify(body),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

// Register a new user
export async function registerUser(userData) {
  return await apiRequest("/api/auth/register", "POST", userData);
}

// Login an existing user
export async function loginUser(email, password) {
  const data = await apiRequest("/api/auth/login", "POST", { email, password });

  // Save authentication token
  localStorage.setItem("sharespace_token", data.token);

  // Save basic user information
  localStorage.setItem("sharespace_current_user", JSON.stringify(data.user));

  return data.user;
}

// Get currently logged-in user
export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("sharespace_current_user"));
  } catch {
    return null;
  }
}

// Get authentication token
export function getToken() {
  return (
    localStorage.getItem("sharespace_token") || localStorage.getItem("token")
  );
}

export function logoutUser() {
  localStorage.removeItem("sharespace_token");
  localStorage.removeItem("token");
  localStorage.removeItem("sharespace_current_user");
}

// Get profile from backend
export async function fetchProfile() {
  const data = await apiRequest("/api/auth/profile", "GET");

  localStorage.setItem("sharespace_current_user", JSON.stringify(data.user));

  return data.user;
}

// Update profile
export async function updateProfile(profileData) {
  const data = await apiRequest("/api/auth/profile", "PUT", profileData);

  localStorage.setItem("sharespace_current_user", JSON.stringify(data.user));

  return data.user;
}

// Change password
export async function changePassword(passwordData) {
  return await apiRequest("/api/auth/change-password", "PUT", passwordData);
}
