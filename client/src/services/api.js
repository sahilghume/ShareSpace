
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Common API request function
async function apiRequest(endpoint, method, body) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

// Register a new user
export async function registerUser(userData) {
  return await apiRequest(
    "/api/auth/register",
    "POST",
    userData
  );
}

// Login an existing user
export async function loginUser(email, password) {
  const data = await apiRequest(
    "/api/auth/login",
    "POST",
    { email, password }
  );

  // Save authentication token
  localStorage.setItem(
    "sharespace_token",
    data.token
  );

  // Save basic user information
  localStorage.setItem(
    "sharespace_current_user",
    JSON.stringify(data.user)
  );

  return data.user;
}

// Get currently logged-in user
export function getCurrentUser() {
  try {
    return JSON.parse(
      localStorage.getItem("sharespace_current_user")
    );
  } catch {
    return null;
  }
}

// Get authentication token
export function getToken() {
  return localStorage.getItem("sharespace_token");
}

// Logout user
export function logoutUser() {
  localStorage.removeItem("sharespace_token");
  localStorage.removeItem("sharespace_current_user");
}
