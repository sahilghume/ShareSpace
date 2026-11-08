import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  House,
  Users,
  Plus,
  KeyRound,
} from "lucide-react";

import {
  createGroup,
  joinGroup,
} from "../services/groupService";

function GroupSetup() {
  const navigate = useNavigate();

  const [activeOption, setActiveOption] = useState("create");
  const [groupName, setGroupName] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setError("");

    if (!groupName.trim()) {
      setError("Please enter a group name.");
      return;
    }

    try {
      setLoading(true);

      await createGroup(groupName.trim());

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to create group.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    setError("");

    if (!groupCode.trim()) {
      setError("Please enter a group code.");
      return;
    }

    try {
      setLoading(true);

      await joinGroup(groupCode.trim().toUpperCase());

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to join group.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">

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

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">

          <div className="text-center mb-7">
            <h2 className="text-2xl font-bold text-gray-900">
              Set Up Your Group
            </h2>

            <p className="text-gray-500 mt-2">
              Create a new group or join an existing one.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-7">
            <button
              type="button"
              onClick={() => {
                setActiveOption("create");
                setError("");
              }}
              className={`flex items-center justify-center gap-2 py-3 px-2 rounded-lg border font-semibold transition ${activeOption === "create"
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
              className={`flex items-center justify-center gap-2 py-3 px-2 rounded-lg border font-semibold transition ${activeOption === "join"
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-green-500"
                }`}
            >
              <Users size={18} />
              Join Group
            </button>
          </div>

          {activeOption === "create" && (
            <form onSubmit={handleCreateGroup} className="space-y-5">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name
                </label>

                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => {
                    setGroupName(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your group name"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-lg transition duration-200"
              >
                {loading ? "Creating Group..." : "Create Group"}
              </button>
            </form>
          )}

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
                  Ask an existing group member for their group code.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Code
                </label>

                <input
                  type="text"
                  value={groupCode}
                  onChange={(e) => {
                    setGroupCode(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter group code"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none uppercase focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-lg transition duration-200"
              >
                {loading ? "Joining Group..." : "Join Group"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          ShareSpace · Live better, together.
        </p>

      </div>
    </div>
  );
}

export default GroupSetup;