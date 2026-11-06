
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  House,
  Users,
  Plus,
  KeyRound,
  MapPin,
} from "lucide-react";

import {
  createGroup,
  joinGroup
} from "../services/groupStorage";

function GroupSetup() {
  const navigate = useNavigate();

  const [activeOption, setActiveOption] = useState("create");

  const [groupData, setGroupData] = useState({
    name: "",
    description: "",
    address: ""
  });

  const [inviteCode, setInviteCode] = useState("");

  const [error, setError] = useState("");

  // Get the currently logged-in user
  const currentUser = JSON.parse(
    localStorage.getItem("sharespace_current_user")
  );

  // Handle group form changes
  const handleGroupChange = (e) => {
    const { name, value } = e.target;

    setGroupData({
      ...groupData,
      [name]: value
    });

    setError("");
  };

  // Create a new group
  const handleCreateGroup = (e) => {
    e.preventDefault();

    if (!groupData.name.trim()) {
      setError("Please enter a group name.");
      return;
    }

    if (!groupData.description.trim()) {
      setError("Please enter a group description.");
      return;
    }

    if (!groupData.address.trim()) {
      setError("Please enter the accommodation address.");
      return;
    }

    try {
      createGroup(currentUser, groupData);

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  // Join an existing group
  const handleJoinGroup = (e) => {
    e.preventDefault();

    if (!inviteCode.trim()) {
      setError("Please enter an invite code.");
      return;
    }

    try {
      joinGroup(currentUser, inviteCode);

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-600 rounded-2xl mb-4">
            <House className="text-white" size={28} />
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            ShareSpace
          </h1>

          <p className="text-gray-500 mt-2">
            Your shared home, managed together.
          </p>

        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">

          <div className="text-center mb-7">

            <h2 className="text-2xl font-bold text-gray-900">
              Set Up Your Group
            </h2>

            <p className="text-gray-500 mt-2">
              Create a new group or join an existing one.
            </p>

          </div>

          {/* Option Selection */}
          <div className="grid grid-cols-2 gap-3 mb-7">

            <button
              type="button"
              onClick={() => {
                setActiveOption("create");
                setError("");
              }}
              className={`flex items-center justify-center gap-2 py-3 px-2 rounded-lg border font-semibold transition ${
                activeOption === "create"
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-green-500"
              }`}
            >
              <Plus size={18} />
              Create Group
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveOption("join");
                setError("");
              }}
              className={`flex items-center justify-center gap-2 py-3 px-2 rounded-lg border font-semibold transition ${
                activeOption === "join"
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-green-500"
              }`}
            >
              <Users size={18} />
              Join Group
            </button>

          </div>

          {/* Create Group Form */}
          {activeOption === "create" && (

            <form onSubmit={handleCreateGroup} className="space-y-5">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={groupData.name}
                  onChange={handleGroupChange}
                  placeholder="Enter your group name"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>

                <textarea
                  name="description"
                  value={groupData.description}
                  onChange={handleGroupChange}
                  placeholder="Describe your group"
                  rows={3}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accommodation Address
                </label>

                <div className="relative">

                  <MapPin
                    size={19}
                    className="absolute left-4 top-4 text-gray-400"
                  />

                  <textarea
                    name="address"
                    value={groupData.address}
                    onChange={handleGroupChange}
                    placeholder="Enter your accommodation address"
                    rows={2}
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg outline-none resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />

                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition duration-200"
              >
                Create Group
              </button>

            </form>
          )}

          {/* Join Group Form */}
          {activeOption === "join" && (

            <form onSubmit={handleJoinGroup} className="space-y-5">

              <div className="text-center mb-5">

                <div className="inline-flex items-center justify-center w-14 h-14 bg-green-50 rounded-full mb-3">
                  <KeyRound className="text-green-600" size={26} />
                </div>

                <h3 className="text-lg font-semibold text-gray-900">
                  Join an Existing Group
                </h3>

                <p className="text-sm text-gray-500 mt-2">
                  Ask an existing group member for their invite code.
                </p>

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invite Code
                </label>

                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter invite code"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none uppercase focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition duration-200"
              >
                Join Group
              </button>

            </form>
          )}

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          ShareSpace · Live better, together.
        </p>

      </div>

    </div>
  );
}

export default GroupSetup;
