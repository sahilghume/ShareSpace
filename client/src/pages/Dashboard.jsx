
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import {
  Wallet,
  CreditCard,
  ClipboardCheck,
  Clock,
  ShoppingBasket,
  Send,
  Megaphone,
  House,
  Users,
  Heart,
  Sparkles,
  Bell,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

import {
  getGroupNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} from "../services/noticeService";

import {
  CURRENT_USER,
  getChores,
} from "../services/choreStorage";

import {
  getShoppingItems,
} from "../services/shoppingStorage";

function Dashboard() {
  const GROUP_ID = 1;

  const [chores, setChores] = useState(() => getChores());
  const [shoppingItems, setShoppingItems] = useState(() => getShoppingItems());

  const [notices, setNotices] = useState([]);
  const [noticeInput, setNoticeInput] = useState("");
  const [noticeError, setNoticeError] = useState("");
  const [noticeLoading, setNoticeLoading] = useState(true);
  const [noticeSubmitting, setNoticeSubmitting] = useState(false);
  const [editingNoticeId, setEditingNoticeId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMessage, setEditMessage] = useState("");

  // Listen for chore and shopping list updates
  useEffect(() => {
    const updateChores = () => {
      setChores(getChores());
    };

    const updateShoppingItems = () => {
      setShoppingItems(getShoppingItems());
    };

    window.addEventListener("sharespaceChoresUpdated", updateChores);
    window.addEventListener("storage", updateChores);

    window.addEventListener("sharespaceShoppingUpdated", updateShoppingItems);
    window.addEventListener("storage", updateShoppingItems);

    return () => {
      window.removeEventListener("sharespaceChoresUpdated", updateChores);
      window.removeEventListener("storage", updateChores);

      window.removeEventListener("sharespaceShoppingUpdated", updateShoppingItems);
      window.removeEventListener("storage", updateShoppingItems);
    };
  }, []);

  // Fetch notices from backend
  const fetchNotices = async () => {
    try {
      setNoticeError("");
      const data = await getGroupNotices(GROUP_ID);
      setNotices(data);
    } catch (error) {
      setNoticeError(error.message);
    } finally {
      setNoticeLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // Notifications for chore creators and secondary verifiers
  const choreNotifications = chores.filter(
    (chore) =>
      (
        chore.createdBy === CURRENT_USER ||
        chore.secondaryVerifier === CURRENT_USER
      ) &&
      chore.status === "Awaiting Verification"
  );

  // Notifications for shopping item creators and secondary verifiers
  const shoppingNotifications = shoppingItems.filter(
    (item) =>
      (
        item.createdBy === CURRENT_USER ||
        item.secondaryVerifier === CURRENT_USER
      ) &&
      item.status === "Awaiting Verification"
  );

  // Dashboard Summary Data
  const summaryCards = [
    {
      title: "Total Expenses",
      amount: "₹12,500",
      description: "This month",
      icon: Wallet,
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Your Balance",
      amount: "₹2,500",
      description: "You owe others",
      icon: CreditCard,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Pending Chores",
      amount: "2",
      description: "Tasks assigned to you",
      icon: ClipboardCheck,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  // Recent Expense Data
  const recentExpenses = [
    {
      title: "Monthly Electricity Bill",
      category: "Utilities",
      paidBy: "Rahul",
      date: "04 Nov 2026",
      amount: "₹2,400",
    },
    {
      title: "Grocery Shopping",
      category: "Groceries",
      paidBy: "Amit",
      date: "03 Nov 2026",
      amount: "₹1,850",
    },
    {
      title: "Internet Bill",
      category: "Utilities",
      paidBy: "Rohit",
      date: "02 Nov 2026",
      amount: "₹999",
    },
  ];

  // Pending Payment Data
  const pendingPayments = [
    {
      name: "Rahul Sharma",
      reason: "Electricity Bill",
      amount: "₹600",
    },
    {
      name: "Amit Patil",
      reason: "Grocery Shopping",
      amount: "₹450",
    },
    {
      name: "Priya Deshmukh",
      reason: "Internet Bill",
      amount: "₹333",
    },
  ];

  // Upcoming Chores Data
  const upcomingChores = [
    {
      title: "Clean Kitchen",
      date: "Today",
      assignedTo: "Rohit",
      status: "Pending",
    },
    {
      title: "Take Out Garbage",
      date: "Tomorrow",
      assignedTo: "Rahul",
      status: "Upcoming",
    },
    {
      title: "Clean Living Room",
      date: "06 Nov 2026",
      assignedTo: "Amit",
      status: "Upcoming",
    },
  ];

  // Add New Notice
  async function addNotice(e) {
    e.preventDefault();

    if (!noticeInput.trim()) {
      return;
    }

    try {
      setNoticeError("");
      setNoticeSubmitting(true);

      await createNotice({
        groupId: GROUP_ID,
        title: "Notice",
        message: noticeInput.trim(),
      });

      setNoticeInput("");
      await fetchNotices();
    } catch (error) {
      setNoticeError(error.message);
    } finally {
      setNoticeSubmitting(false);
    }
  }

  // Format notice date
  function formatNoticeDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function handleEditNotice(notice) {
    setEditingNoticeId(notice.notice_id);
    setEditTitle(notice.title);
    setEditMessage(notice.message);
  }

  function cancelEdit() {
    setEditingNoticeId(null);
    setEditTitle("");
    setEditMessage("");
  }

  async function handleUpdateNotice(noticeId) {
    if (!editTitle.trim() || !editMessage.trim()) {
      setNoticeError("Title and message are required.");
      return;
    }

    try {
      setNoticeError("");

      await updateNotice(noticeId, {
        title: editTitle.trim(),
        message: editMessage.trim(),
      });

      cancelEdit();
      await fetchNotices();
    } catch (error) {
      setNoticeError(error.message);
    }
  }

  async function handleDeleteNotice(noticeId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this notice?"
    );

    if (!confirmed) return;

    try {
      setNoticeError("");

      await deleteNotice(noticeId);
      await fetchNotices();
    } catch (error) {
      setNoticeError(error.message);
    }
  }

  return (
    <div className="space-y-8">

      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Here's what's happening in your shared space today.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg w-fit">
          <Megaphone size={18} />
          <span className="text-sm font-medium">Green Valley Flat</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 font-medium">
                  {card.title}
                </p>

                <div className={`p-3 rounded-lg ${card.color}`}>
                  <Icon size={22} />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mt-4">
                {card.amount}
              </h2>

              <p className="text-xs text-gray-500 mt-2">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Verification Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Chore Verification Notifications */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 text-orange-600 p-3 rounded-lg">
                <Bell size={22} />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-800">
                  Chore Verification Notifications
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Chores waiting for your approval.
                </p>
              </div>

              {choreNotifications.length > 0 && (
                <span className="ml-auto shrink-0 bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">
                  {choreNotifications.length} New
                </span>
              )}
            </div>
          </div>

          <div className="p-5 space-y-4">
            {choreNotifications.length > 0 ? (
              choreNotifications.map((chore) => (
                <div
                  key={chore.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-orange-100 bg-orange-50 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="bg-white text-orange-600 p-2 rounded-lg shrink-0">
                      <ShieldCheck size={21} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 break-words">
                        {chore.title}
                      </p>

                      <p className="text-sm text-gray-600 mt-1">
                        {chore.submittedBy} has submitted this chore for verification.
                      </p>

                      <p className="text-xs text-gray-400 mt-2">
                        Assigned to: {chore.assignedTo}
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/chores"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold text-center transition-colors shrink-0"
                  >
                    Verify Chore
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <CheckCircle
                  size={35}
                  className="mx-auto text-green-500 mb-2"
                />

                <p className="text-sm font-semibold text-gray-700">
                  No pending chore verifications
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  You're all caught up!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Shopping Verification Notifications */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 text-green-600 p-3 rounded-lg">
                <ShoppingBasket size={22} />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-800">
                  Shopping List Verification Notifications
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Purchases waiting for your approval.
                </p>
              </div>

              {shoppingNotifications.length > 0 && (
                <span className="ml-auto shrink-0 bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">
                  {shoppingNotifications.length} New
                </span>
              )}
            </div>
          </div>

          <div className="p-5 space-y-4">
            {shoppingNotifications.length > 0 ? (
              shoppingNotifications.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-green-100 bg-green-50 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="bg-white text-green-600 p-2 rounded-lg shrink-0">
                      <ShieldCheck size={21} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 break-words">
                        {item.title}
                      </p>

                      <p className="text-sm text-gray-600 mt-1">
                        {item.submittedBy} has submitted this purchase for verification.
                      </p>

                      <p className="text-xs text-gray-400 mt-2">
                        Assigned to: {item.assignedTo}
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/shopping-list"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold text-center transition-colors shrink-0"
                  >
                    Verify Purchase
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <CheckCircle
                  size={35}
                  className="mx-auto text-green-500 mb-2"
                />

                <p className="text-sm font-semibold text-gray-700">
                  No pending shopping verifications
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  You're all caught up!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notice Board */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 text-green-700 p-3 rounded-lg">
              <Megaphone size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Notice Board
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Important updates from your roommates
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Notices */}
        <div className="max-h-64 overflow-y-auto p-5 space-y-4">
          {noticeLoading && (
            <p className="text-center text-gray-500 text-sm">
              Loading notices...
            </p>
          )}

          {noticeError && (
            <p className="text-center text-red-500 text-sm">
              {noticeError}
            </p>
          )}

          {!noticeLoading && notices.map((notice) => (
            <div
              key={notice.notice_id}
              className="border-b border-gray-100 pb-4 last:border-0"
            >
              {editingNoticeId === notice.notice_id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="Notice title"
                  />

                  <textarea
                    value={editMessage}
                    onChange={(e) => setEditMessage(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="Notice message"
                    rows={3}
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateNotice(notice.notice_id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Save
                    </button>

                    <button
                      onClick={cancelEdit}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <div className="bg-green-100 text-green-700 rounded-full w-10 h-10 flex items-center justify-center font-bold shrink-0">
                    {notice.posted_by_name?.charAt(0).toUpperCase() || "U"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {notice.posted_by_name}
                      </p>

                      <p className="text-xs text-gray-400">
                        {formatNoticeDate(notice.created_at)}
                      </p>
                    </div>


                    <p className="text-sm text-gray-600 mt-1 break-words">
                      {notice.message}
                    </p>

                    {Number(notice.can_manage) === 1 && (
                      <div className="flex gap-3 mt-3">
                        <button
                          onClick={() => handleEditNotice(notice)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDeleteNotice(notice.notice_id)}
                          className="text-red-600 hover:text-red-800 text-sm font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {!noticeLoading && notices.length === 0 && !noticeError && (
            <p className="text-center text-gray-400 text-sm py-6">
              No notices yet. Be the first to post!
            </p>
          )}
        </div>

        {/* Add Notice Input */}
        <form
          onSubmit={addNotice}
          className="p-5 border-t border-gray-100 flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            value={noticeInput}
            onChange={(e) => setNoticeInput(e.target.value)}
            placeholder="Write a notice for your roommates..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
          />

          <button
            type="submit"
            disabled={noticeSubmitting}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Send size={16} />
            {noticeSubmitting ? "Posting..." : "Post Notice"}
          </button>
        </form>
      </div>

      {/* Recent Expenses and Pending Payments */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent Expenses */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Recent Expenses
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Latest 3 group transactions
              </p>
            </div>

            <button className="text-green-700 text-sm font-semibold hover:text-green-800">
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-5 py-4">Expense</th>
                  <th className="px-5 py-4">Paid By</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Amount</th>
                </tr>
              </thead>

              <tbody>
                {recentExpenses.map((expense) => (
                  <tr
                    key={expense.title}
                    className="border-t border-gray-100 hover:bg-green-50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-gray-800">
                        {expense.title}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {expense.category}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {expense.paidBy}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {expense.date}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-gray-800 whitespace-nowrap">
                      {expense.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">
              Pending Payments
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Your outstanding balances
            </p>
          </div>

          <div className="p-5 space-y-5">
            {pendingPayments.map((payment) => (
              <div
                key={payment.name}
                className="flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800">
                    {payment.name}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    {payment.reason}
                  </p>
                </div>

                <p className="text-sm font-bold text-orange-600 whitespace-nowrap">
                  {payment.amount}
                </p>
              </div>
            ))}

            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-xs text-orange-700">
                Total amount you owe
              </p>

              <h3 className="text-2xl font-bold text-orange-700 mt-1">
                ₹1,383
              </h3>
            </div>

            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-sm font-semibold transition-colors">
              View All Payments
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Chores */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Upcoming Chores
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Household responsibilities
            </p>
          </div>

          <button className="text-green-700 text-sm font-semibold hover:text-green-800">
            View All
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {upcomingChores.map((chore) => (
            <div
              key={chore.title}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 hover:bg-green-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-green-100 text-green-700 p-3 rounded-lg">
                  <ClipboardCheck size={21} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    {chore.title}
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    Assigned to {chore.assignedTo}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                  <Clock size={15} />
                  {chore.date}
                </div>

                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${chore.status === "Pending"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-blue-100 text-blue-700"
                    }`}
                >
                  {chore.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Shared Shopping List */}
        <div className="bg-white rounded-xl p-6 text-black flex flex-col justify-between border border-gray-200">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <ShoppingBasket size={25} className="text-green-600" />
              <h3 className="text-lg font-bold">
                Shared Shopping List
              </h3>
            </div>

            <p className="text-sm text-gray-600 mb-5">
              Keep track of household essentials and shopping items.
            </p>
          </div>

          <Link
            to="/shopping-list"
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 w-fit"
          >
            Manage Shopping List
          </Link>
        </div>

        {/* Roommate Community Card */}
        <div className="bg-white border border-green-100 rounded-xl p-6 flex items-center justify-between gap-4 overflow-hidden">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-green-600" />

              <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                Together is Better
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-800">
              Roommate Community
            </h3>

            <p className="text-sm text-gray-500 mt-2 mb-4">
              Share responsibilities, support each other and make your shared
              space feel like home.
            </p>

            <div className="flex items-center gap-2 text-green-700 text-sm font-semibold">
              <Heart size={17} />
              <span>Live better together!</span>
            </div>
          </div>

          {/* Decorative House Illustration */}
          <div className="relative shrink-0 w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center">
            <div className="absolute inset-0 bg-green-50 rounded-full"></div>

            <div className="relative flex flex-col items-center">
              <House
                size={75}
                strokeWidth={1.5}
                className="text-green-700"
              />

              <div className="flex items-center gap-1 -mt-5 bg-green-100 px-3 py-1 rounded-full">
                <Users size={17} className="text-green-700" />
                <span className="text-xs font-bold text-green-700">
                  Roommates
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
