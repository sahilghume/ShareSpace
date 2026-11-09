
import { useState, useEffect } from "react";

import {
  Users,
  CalendarDays,
  Copy,
  Home,
  Crown,
  Mail,
  LogOut,
  AlertTriangle,
  X,
} from "lucide-react";
import {
  getMyGroups,
  getGroupDetails,
  getGroupMembers,
  leaveGroup,
  transferAdminAndLeave,
  deleteGroup,
} from "../services/groupService";

function Group() {
  const [copied, setCopied] = useState(false);
  const [showLeavePopup, setShowLeavePopup] = useState(false);

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const [isLeaving, setIsLeaving] = useState(false);
  const [leaveAction, setLeaveAction] = useState("transfer");

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = currentUser.user_id || currentUser.id;

  const currentMember = members.find(
    (member) => Number(member.user_id) === Number(currentUserId)
  );

  const isAdmin = currentMember?.role === "admin";

  const otherMembers = members.filter(
    (member) => Number(member.user_id) !== Number(currentUserId)
  );

  // Fetch group details and members
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        setLoading(true);
        setError("");

        const groups = await getMyGroups();

        if (!groups || groups.length === 0) {
          setGroup(null);
          return;
        }

        const groupId = groups[0].group_id;

        const [groupData, membersData] = await Promise.all([
          getGroupDetails(groupId),
          getGroupMembers(groupId),
        ]);

        setGroup(groupData);
        setMembers(membersData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, []);

  // Copy invite code
  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(group.group_code);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      setError("Unable to copy invite code.");
    }
  };

  // Confirm leave group
  const confirmLeaveGroup = async () => {
    try {
      setIsLeaving(true);

      if (isAdmin) {
        if (leaveAction === "delete") {
          const confirmed = window.confirm(
            `Are you sure you want to permanently delete "${group.group_name}" and all its associated data? This action cannot be undone.`
          );

          if (!confirmed) return;

          await deleteGroup(group.group_id);

          alert("Group deleted successfully.");
        } else {
          if (!selectedAdminId) {
            alert("Please select a member to transfer admin rights.");
            return;
          }

          await transferAdminAndLeave(group.group_id, selectedAdminId);

          alert("Admin rights transferred and you left the group.");
        }
      } else {
        await leaveGroup(group.group_id);

        alert("You have successfully left the group.");
      }

      setShowLeavePopup(false);
      window.location.reload();

    } catch (error) {
      alert(error.message);
    } finally {
      setIsLeaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-500">
        Loading group details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        {error}
      </div>
    );
  }

  if (!group) {
    return (
      <div className="p-6 text-gray-500">
        You haven't joined any group yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          My Group
        </h1>

        <p className="text-gray-500 mt-1">
          Manage your group, members and household information.
        </p>
      </div>

      {/* Group Overview */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div className="flex items-center gap-4">

            <div className="bg-green-100 text-green-700 p-4 rounded-xl">
              <Home size={30} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {group.group_name}
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Shared space for your group members.
              </p>
            </div>

          </div>

          <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold w-fit">
            Active Group
          </span>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6 pt-6 border-t border-gray-100">


          <div className="flex items-center gap-3">
            <CalendarDays className="text-green-600" size={20} />

            <div>
              <p className="text-xs text-gray-500">Created On</p>
              <p className="text-sm font-semibold text-gray-800">
                {group.created_at
                  ? new Date(group.created_at).toLocaleDateString("en-IN")
                  : "Not available"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Users className="text-green-600" size={20} />

            <div>
              <p className="text-xs text-gray-500">Total Members</p>
              <p className="text-sm font-semibold text-gray-800">
                {members.length} Members
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Members and Invite Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Group Members */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6">

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Group Members
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                People who are part of your group.
              </p>
            </div>

            <Users className="text-green-600" size={24} />

          </div>

          {/* Scrollable Members List */}
          <div className="max-h-80 overflow-y-auto space-y-4 pr-2">

            {members.map((member) => {
              const initials = member.name
                .split(" ")
                .map((word) => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50"
                >

                  <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold shrink-0">
                      {initials}
                    </div>

                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {member.name}
                      </p>

                      <p className="text-xs text-gray-500">
                        {member.email}
                      </p>
                    </div>

                  </div>

                  {member.role === "admin" ? (

                    <span className="flex items-center gap-1 text-xs font-semibold bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full">
                      <Crown size={13} />
                      Admin
                    </span>

                  ) : (

                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">
                      Member
                    </span>

                  )}

                </div>
              );
            })}

            {members.length === 0 && (
              <p className="text-center text-gray-400 py-6 text-sm">
                No members found.
              </p>
            )}

          </div>

        </div>

        {/* Invite Members */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">

          <div className="bg-green-100 text-green-700 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <Mail size={25} />
          </div>

          <h2 className="text-lg font-bold text-gray-800">
            Invite Members
          </h2>

          <p className="text-sm text-gray-500 mt-2 mb-5">
            Share your group invite code with people you want to add.
          </p>

          <p className="text-xs font-semibold text-gray-500 mb-2">
            GROUP INVITE CODE
          </p>

          <div className="flex items-center justify-between gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3">

            <span className="font-bold tracking-wider text-gray-800">
              {group.group_code}
            </span>

            <button
              onClick={copyInviteCode}
              className="text-green-600 hover:text-green-700"
              title="Copy invite code"
            >
              <Copy size={18} />
            </button>

          </div>

          <button
            onClick={copyInviteCode}
            className="w-full mt-4 bg-green-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700"
          >
            {copied ? "Copied!" : "Copy Invite Code"}
          </button>

          <p className="text-xs text-gray-400 mt-3">
            Share this code with people you want to invite to your group.
          </p>

        </div>

      </div>

      {/* Leave Group Section */}
      <div className="bg-white border border-red-200 rounded-xl p-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Leave Group
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Leave your current group if you no longer want to be a member.
            </p>
          </div>

          <button
            onClick={() => setShowLeavePopup(true)}
            className="flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700 transition w-fit"
          >
            <LogOut size={17} />
            Leave Group
          </button>

        </div>

      </div>

      {/* Leave Group Confirmation Popup */}
      {showLeavePopup && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">

            {/* Close Button */}
            <button
              onClick={() => setShowLeavePopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <X size={21} />
            </button>

            {/* Warning Icon */}
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={30} />
            </div>

            {/* Popup Content */}
            <div className="text-center">

              <h2 className="text-xl font-bold text-gray-800">
                Leave Group?
              </h2>

              <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                Are you sure you want to leave{" "}
                <span className="font-semibold text-gray-800">
                  {group.group_name}
                </span>
                ? You will lose access to this group's expenses, chores and
                shared shopping list.
              </p>

              <p className="text-sm text-red-600 font-medium mt-3">
                You will need to join another group to access group features again.
              </p>

            </div>
            {isAdmin && (
              <div className="mt-5 space-y-4">

                <p className="text-sm font-semibold text-gray-700">
                  Choose what you want to do:
                </p>

                <label className="flex items-start gap-3 border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="leaveAction"
                    value="transfer"
                    checked={leaveAction === "transfer"}
                    onChange={() => setLeaveAction("transfer")}
                    className="mt-1 accent-green-600"
                  />

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Assign New Admin & Leave
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Transfer admin rights to another member and leave the group.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 border border-red-200 rounded-lg p-3 cursor-pointer hover:bg-red-50">
                  <input
                    type="radio"
                    name="leaveAction"
                    value="delete"
                    checked={leaveAction === "delete"}
                    onChange={() => setLeaveAction("delete")}
                    className="mt-1 accent-red-600"
                  />

                  <div>
                    <p className="text-sm font-semibold text-red-600">
                      Delete Group
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Permanently delete the group and its associated data.
                    </p>
                  </div>
                </label>

                {leaveAction === "transfer" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Transfer Admin Rights To
                    </label>

                    {otherMembers.length > 0 ? (
                      <select
                        value={selectedAdminId}
                        onChange={(e) => setSelectedAdminId(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Select a group member</option>

                        {otherMembers.map((member) => (
                          <option key={member.user_id} value={member.user_id}>
                            {member.name} ({member.email})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm text-red-600">
                        No other members available to transfer admin rights.
                      </p>
                    )}
                  </div>
                )}

              </div>
            )}
            {/* Popup Buttons */}
            <div className="flex items-center gap-3 mt-6">

              <button
                onClick={() => setShowLeavePopup(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={confirmLeaveGroup}
                disabled={
                  isLeaving ||
                  (isAdmin &&
                    leaveAction === "transfer" &&
                    (!selectedAdminId || otherMembers.length === 0))
                }
                className={`flex-1 text-white py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${isAdmin && leaveAction === "delete"
                  ? "bg-red-700 hover:bg-red-800"
                  : "bg-red-600 hover:bg-red-700"
                  }`}
              >
                {isLeaving
                  ? "Processing..."
                  : isAdmin
                    ? leaveAction === "delete"
                      ? "Delete Group"
                      : "Transfer Admin & Leave"
                    : "Yes, Leave Group"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Group;
