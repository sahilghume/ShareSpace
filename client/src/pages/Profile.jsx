
import { useState } from "react";

import {
  UserRound,
  Mail,
  Phone,
  Camera,
  Lock,
  Eye,
  EyeOff,
  Save,
  X,
  KeyRound
} from "lucide-react";

import { getCurrentUser } from "../services/api";

function Profile() {

  // Get logged-in user and saved profile information
  

const [profile, setProfile] = useState(() => {
  const currentUser = getCurrentUser();

  const savedProfile = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("sharespace_profile")
      ) || {};
    } catch {
      return {};
    }
  })();

  return {
    name: savedProfile.name || currentUser?.name || "User",
    email: currentUser?.email || savedProfile.email || "",
    phoneNumber:
      savedProfile.phoneNumber ||
      currentUser?.phoneNumber ||
      currentUser?.phone ||
      "",
    image: savedProfile.image || ""
  };
});



  const [formData, setFormData] = useState(profile);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Handle profile input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

    setMessage("");
  };

  // Handle profile image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setFormData({
          ...formData,
          image: reader.result
        });
      };

      reader.readAsDataURL(file);
    }
  };

  // Save profile information
  const handleSave = (e) => {
    e.preventDefault();

    const updatedProfile = {
      ...formData,
      name: formData.name.trim(),
      phoneNumber: formData.phoneNumber.trim()
    };

    // Save profile information
    localStorage.setItem(
      "sharespace_profile",
      JSON.stringify(updatedProfile)
    );

    // Update current logged-in user information
    const currentUser = getCurrentUser();

    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        name: updatedProfile.name,
        phoneNumber: updatedProfile.phoneNumber
      };

      localStorage.setItem(
        "sharespace_current_user",
        JSON.stringify(updatedUser)
      );
    }

    setProfile(updatedProfile);
    setFormData(updatedProfile);
    setIsEditing(false);
    setMessage("Profile updated successfully.");
  };

  // Cancel profile editing
  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
    setMessage("");
  };

  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData({
      ...passwordData,
      [name]: value
    });

    setError("");
    setMessage("");
  };

  // Validate password form
  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    if (passwordData.newPassword.length < 8) {
      setError("New password must contain at least 8 characters.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setError("");
    setMessage("Password form validation successful.");

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  // Generate profile initials
  const initials = profile.name
    ?.trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-5xl mx-auto">

      {/* Page Heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          My Profile
        </h1>

        <p className="text-gray-500 mt-1">
          Manage your personal information and account settings.
        </p>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">

        <div className="flex flex-col sm:flex-row items-center gap-5 mb-8">

          <div className="relative">

            {formData.image ? (
              <img
                src={formData.image}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-2xl font-bold">
                {initials || <UserRound size={32} />}
              </div>
            )}

            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700">
                <Camera size={16} />

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}

          </div>

          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-gray-800">
              {profile.name}
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              ShareSpace Member
            </p>

            {isEditing && (
              <p className="text-xs text-gray-400 mt-2">
                Click the camera icon to change your picture.
              </p>
            )}
          </div>

          <div className="sm:ml-auto">
            {!isEditing && (
              <button
                onClick={() => {
                  setIsEditing(true);
                  setMessage("");
                }}
                className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Edit Profile
              </button>
            )}
          </div>

        </div>

        <div className="border-t border-gray-200 pt-6">

          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Personal Information
            </h3>
          </div>

          <form onSubmit={handleSave}>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>

                <div className="relative">
                  <UserRound
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none bg-gray-50 text-gray-500"
                  />
                </div>

                <p className="text-xs text-gray-400 mt-1">
                  Email address is linked to your account.
                </p>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>

                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter your phone number"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

            </div>

            {isEditing && (
              <div className="flex justify-end gap-3 mt-8">

                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <X size={18} />
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Save size={18} />
                  Save Changes
                </button>

              </div>
            )}

          </form>
        </div>

      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-lg bg-green-100 flex items-center justify-center text-green-700">
              <Lock size={21} />
            </div>

            <div>
              <h3 className="font-semibold text-gray-800">
                Change Password
              </h3>

              <p className="text-sm text-gray-500">
                Update your account password.
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={() => {
              setShowPasswordForm(!showPasswordForm);
              setError("");
              setMessage("");
            }}
            className="px-5 py-2 border border-green-600 text-green-700 rounded-lg hover:bg-green-50"
          >
            {showPasswordForm ? "Cancel" : "Change Password"}
          </button>

        </div>

        {showPasswordForm && (
          <form
            onSubmit={handlePasswordSubmit}
            className="mt-6 border-t border-gray-200 pt-6 space-y-5"
          >

            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>

              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                />

                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>

              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  required
                  minLength={8}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                />

                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <KeyRound size={18} />
              Update Password
            </button>

          </form>
        )}

      </div>

      {message && (
        <p className="mt-5 text-sm text-green-700">
          {message}
        </p>
      )}

    </div>
  );
}

export default Profile;
