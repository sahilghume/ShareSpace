import { useEffect, useState } from "react";

import {
  ShoppingBasket,
  Plus,
  Search,
  Clock,
  CheckCircle,
  ClipboardCheck,
  User,
  Calendar,
  X,
  Send,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import {
  getShoppingItems,
  addShoppingItem,
  submitItemForVerification,
  approveShoppingItem,
  deleteShoppingItem,
} from "../services/shoppingService";

import {
  getMyGroups,
  getGroupMembers,
} from "../services/groupService";

function ShoppingList() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const currentUserId = Number(
    storedUser.user_id || storedUser.id
  );

  const currentUserName =
    storedUser.name || storedUser.fullName || "User";

  const [items, setItems] = useState([]);
  const [members, setMembers] = useState([]);
  const [groupId, setGroupId] = useState(null);

  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [newItem, setNewItem] = useState({
    title: "",
    assignedTo: "",
    secondaryVerifier: "",
  });

  const normalizeItem = (item) => ({
    id: item.item_id,
    title: item.item_name,
    quantity: item.quantity,
    assignedTo: item.assigned_to_name || "Unassigned",
    assignedToId: Number(item.assigned_to),
    createdBy: item.created_by_name || "Unknown",
    createdById: Number(item.added_by),
    secondaryVerifier: item.verifier_name || "",
    verifierId: Number(item.verifier_id),
    status: item.status,
    submittedBy: item.assigned_to_name || "",
    submittedAt: item.submitted_at,
    approvedBy: item.approved_by_name || "",
    approvedAt: item.approved_at,
    createdAt: item.created_at,
  });

  const loadItems = async (selectedGroupId) => {
    const data = await getShoppingItems(selectedGroupId);
    setItems(data.map(normalizeItem));
  };

  const loadPageData = async () => {
    try {
      setLoading(true);
      setError("");

      const groups = await getMyGroups();

      if (!groups || groups.length === 0) {
        setGroupId(null);
        setItems([]);
        setMembers([]);
        return;
      }

      const activeGroupId = groups[0].group_id;

      setGroupId(activeGroupId);

      const [shoppingItems, groupMembers] = await Promise.all([
        getShoppingItems(activeGroupId),
        getGroupMembers(activeGroupId),
      ]);

      setItems(shoppingItems.map(normalizeItem));
      setMembers(groupMembers);
    } catch (err) {
      setError(err.message || "Unable to load shopping list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const pendingItems = items.filter(
    (item) => item.status === "Pending"
  );

  const awaitingItems = items.filter(
    (item) => item.status === "Awaiting Verification"
  );

  const completedItems = items.filter(
    (item) => item.status === "Completed"
  );

  const filteredItems = items.filter((item) => {
    const matchesFilter =
      activeFilter === "All" || item.status === activeFilter;

    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleAddItem = async (e) => {
    e.preventDefault();

    if (!newItem.title.trim() || !newItem.assignedTo || !groupId) {
      alert("Please enter an item name and select a roommate.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await addShoppingItem({
        groupId,
        itemName: newItem.title.trim(),
        quantity: 1,
        assignedTo: Number(newItem.assignedTo),
        verifierId: newItem.secondaryVerifier
          ? Number(newItem.secondaryVerifier)
          : null,
      });

      await loadItems(groupId);

      setNewItem({
        title: "",
        assignedTo: "",
        secondaryVerifier: "",
      });

      setShowModal(false);
    } catch (err) {
      setError(err.message || "Unable to add shopping item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitForVerification = async (itemId) => {
    try {
      setError("");

      await submitItemForVerification(itemId);
      await loadItems(groupId);
    } catch (err) {
      setError(err.message || "Unable to submit item");
    }
  };

  const handleApproveItem = async (itemId) => {
    try {
      setError("");

      await approveShoppingItem(itemId);
      await loadItems(groupId);
    } catch (err) {
      setError(err.message || "Unable to approve item");
    }
  };

  const handleDeleteItem = async (itemId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this shopping item?"
    );

    if (!confirmDelete) return;

    try {
      setError("");

      await deleteShoppingItem(itemId);
      await loadItems(groupId);
    } catch (err) {
      setError(err.message || "Unable to delete item");
    }
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";

      case "Awaiting Verification":
        return "bg-blue-100 text-blue-700";

      case "Completed":
        return "bg-green-100 text-green-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filters = [
    "All",
    "Pending",
    "Awaiting Verification",
    "Completed",
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading shopping list...</p>
      </div>
    );
  }

  if (!groupId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <p className="text-gray-600">
          Please create or join a group before using the shopping list.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">

      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-xl bg-green-100 p-3">
              <ShoppingBasket className="h-7 w-7 text-green-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                Shopping List
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage shared shopping tasks with your roommates.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-green-700"
        >
          <Plus size={20} />
          Add Shopping Item
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Items</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-800">
            {items.length}
          </h2>
          <ShoppingBasket className="mt-2 text-purple-600" size={23} />
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Pending Items</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-800">
            {pendingItems.length}
          </h2>
          <Clock className="mt-2 text-yellow-600" size={23} />
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Awaiting Verification</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-800">
            {awaitingItems.length}
          </h2>
          <ShieldCheck className="mt-2 text-blue-600" size={23} />
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Completed Items</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-800">
            {completedItems.length}
          </h2>
          <CheckCircle className="mt-2 text-green-600" size={23} />
        </div>

      </div>

      {/* Shopping List Section */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">

        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              All Shopping Items
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Track assignments and verify completed shopping.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search items or roommates..."
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 border-b border-gray-100 px-5 py-4">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${activeFilter === filter
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Items List */}
        <div className="divide-y divide-gray-100">

          {filteredItems.length > 0 ? (

            filteredItems.map((item) => {
              const canSubmit =
                item.status === "Pending" &&
                item.assignedToId === currentUserId;

              const canApprove =
                item.status === "Awaiting Verification" &&
                (
                  item.createdById === currentUserId ||
                  item.verifierId === currentUserId
                );

              const canDelete =
                item.createdById === currentUserId;

              return (
                <div
                  key={item.id}
                  className="p-5 transition hover:bg-gray-50"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <div className="min-w-0 flex-1">

                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <h3 className="text-base font-semibold text-gray-800">
                          {item.title}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:flex-wrap sm:gap-x-5">

                        <span className="flex items-center gap-2">
                          <User size={15} />
                          Assigned to:
                          <span className="font-medium text-gray-700">
                            {item.assignedTo}
                          </span>
                        </span>

                        <span className="flex items-center gap-2">
                          <ClipboardCheck size={15} />
                          Created by:
                          <span className="font-medium text-gray-700">
                            {item.createdBy}
                          </span>
                        </span>

                        {item.secondaryVerifier && (
                          <span className="flex items-center gap-2">
                            <ShieldCheck size={15} />
                            Secondary verifier:
                            <span className="font-medium text-gray-700">
                              {item.secondaryVerifier}
                            </span>
                          </span>
                        )}
                      </div>

                      {item.status === "Awaiting Verification" && (
                        <p className="mt-3 text-sm text-blue-600">
                          Submitted by {item.submittedBy}
                          {item.submittedAt &&
                            ` on ${formatDate(item.submittedAt)}`}
                        </p>
                      )}

                      {item.status === "Completed" && (
                        <p className="mt-3 text-sm text-green-600">
                          Approved by {item.approvedBy}
                          {item.approvedAt &&
                            ` on ${formatDate(item.approvedAt)}`}
                        </p>
                      )}

                      {item.createdAt && (
                        <p className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                          <Calendar size={13} />
                          Added on {formatDate(item.createdAt)}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">

                      {canSubmit && (
                        <button
                          onClick={() => handleSubmitForVerification(item.id)}
                          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                          <Send size={16} />
                          Submit for Verification
                        </button>
                      )}

                      {canApprove && (
                        <button
                          onClick={() => handleApproveItem(item.id)}
                          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700"
                        >
                          <CheckCircle size={16} />
                          Approve Item
                        </button>
                      )}

                      {canDelete && (
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          title="Delete item"
                          className="rounded-lg border border-red-200 p-2.5 text-red-500 transition hover:bg-red-50"
                        >
                          <Trash2 size={17} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })

          ) : (

            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <div className="mb-4 rounded-full bg-gray-100 p-5">
                <ShoppingBasket size={35} className="text-gray-400" />
              </div>

              <h3 className="text-lg font-semibold text-gray-700">
                No Shopping Items Found
              </h3>

              <p className="mt-2 max-w-sm text-sm text-gray-500">
                {searchTerm
                  ? "Try searching with a different item name or roommate."
                  : "Your shopping list is empty. Add your first shopping item to get started."}
              </p>

              {!searchTerm && activeFilter === "All" && (
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-5 flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-700"
                >
                  <Plus size={17} />
                  Add Shopping Item
                </button>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Add Shopping Item Modal */}
      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Add Shopping Item
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Assign a shopping task to a roommate.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-5 p-5">

              {/* Item Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Item Name
                </label>

                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g. Buy milk, vegetables..."
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  required
                />
              </div>

              {/* Assigned Roommate */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Assign To
                </label>

                <select
                  value={newItem.assignedTo}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      assignedTo: e.target.value,
                      secondaryVerifier: "",
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  required
                >
                  <option value="">Select a roommate</option>

                  {members
                    .filter(
                      (member) =>
                        Number(member.user_id) !== currentUserId
                    )
                    .map((member) => (
                      <option
                        key={member.user_id}
                        value={member.user_id}
                      >
                        {member.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Secondary Verifier */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Secondary Verifier
                  <span className="ml-2 font-normal text-gray-400">
                    (Optional)
                  </span>
                </label>

                <select
                  value={newItem.secondaryVerifier}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      secondaryVerifier: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                >
                  <option value="">No secondary verifier</option>

                  {members
                    .filter(
                      (member) =>
                        Number(member.user_id) !== currentUserId &&
                        Number(member.user_id) !== Number(newItem.assignedTo)
                    )
                    .map((member) => (
                      <option
                        key={member.user_id}
                        value={member.user_id}
                      >
                        {member.name}
                      </option>
                    ))}
                </select>

                <p className="mt-2 text-xs text-gray-400">
                  The creator or secondary verifier can approve the submitted item.
                </p>
              </div>

              {/* Created By */}
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Created By</p>

                <p className="mt-1 text-sm font-medium text-gray-700">
                  {currentUserName}
                </p>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
                >
                  <Plus size={17} />
                  {submitting ? "Adding..." : "Add Item"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShoppingList;