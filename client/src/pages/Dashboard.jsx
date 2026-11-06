import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyGroups } from "../services/groupService";
import {
  getGroupExpenses,
  getExpenseSplits,
} from "../services/expenseService";
import { getDailyAssignments } from "../services/choreService";

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

import { getShoppingItems } from "../services/shoppingStorage";

function Dashboard() {
  const [group, setGroup] = useState(null);
  const [groupLoading, setGroupLoading] = useState(true);
  const [groupError, setGroupError] = useState("");

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

  const [expenses, setExpenses] = useState([]);
  const [expenseLoading, setExpenseLoading] = useState(true);
  const [expenseError, setExpenseError] = useState("");

  const [expenseSplits, setExpenseSplits] = useState([]);
  const [balanceLoading, setBalanceLoading] = useState(true);

  const [choreAssignments, setChoreAssignments] = useState([]);
  const [choreLoading, setChoreLoading] = useState(true);
  const [choreError, setChoreError] = useState("");

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

  // Fetch group details
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setGroupError("");

        const groups = await getMyGroups();

        if (!groups || groups.length === 0) {
          throw new Error("You are not a member of any group.");
        }

        setGroup(groups[0]);
      } catch (error) {
        setGroupError(error.message);
      } finally {
        setGroupLoading(false);
      }
    };

    fetchGroup();
  }, []);

  // Fetch group expenses
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setExpenseError("");
        setExpenseLoading(true);

        const data = await getGroupExpenses(group.group_id);
        setExpenses(data);
      } catch (error) {
        setExpenseError(error.message);
      } finally {
        setExpenseLoading(false);
      }
    };

    if (group?.group_id) {
      fetchExpenses();
    }
  }, [group]);

  // Fetch expense splits
  useEffect(() => {
    const fetchExpenseSplits = async () => {
      try {
        setBalanceLoading(true);

        const allSplits = await Promise.all(
          expenses.map(async (expense) => {
            const splits = await getExpenseSplits(expense.expense_id);

            return splits.map((split) => ({
              ...split,
              paid_by: expense.paid_by,
              paid_by_name: expense.paid_by_name,
              expense_title: expense.title,
            }));
          })
        );

        setExpenseSplits(allSplits.flat());
      } catch (error) {
        console.error("Balance Fetch Error:", error);
      } finally {
        setBalanceLoading(false);
      }
    };

    if (!expenseLoading) {
      fetchExpenseSplits();
    }
  }, [expenses, expenseLoading]);

  // Fetch chore assignments
  useEffect(() => {
    const fetchChoreAssignments = async () => {
      try {
        setChoreLoading(true);
        setChoreError("");

        const data = await getDailyAssignments(group.group_id);
        setChoreAssignments(data);
      } catch (error) {
        setChoreError(error.message);
      } finally {
        setChoreLoading(false);
      }
    };

    if (group?.group_id) {
      fetchChoreAssignments();
    }
  }, [group]);

  // Fetch notices from backend
  const fetchNotices = async (groupId) => {
    try {
      setNoticeError("");
      setNoticeLoading(true);

      const data = await getGroupNotices(groupId);
      setNotices(data);
    } catch (error) {
      setNoticeError(error.message);
    } finally {
      setNoticeLoading(false);
    }
  };

  // Fetch group notices
  useEffect(() => {
    if (group?.group_id) {
      fetchNotices(group.group_id);
    }
  }, [group]);

  // Notifications for chore creators and secondary verifiers
  const choreNotifications = chores.filter(
    (chore) =>
      (chore.createdBy === CURRENT_USER ||
        chore.secondaryVerifier === CURRENT_USER) &&
      chore.status === "Awaiting Verification"
  );

  // Notifications for shopping item creators and secondary verifiers
  const shoppingNotifications = shoppingItems.filter(
    (item) =>
      (item.createdBy === CURRENT_USER ||
        item.secondaryVerifier === CURRENT_USER) &&
      item.status === "Awaiting Verification"
  );

  const currentDate = new Date();

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = Number(currentUser.id);

  // Calculate monthly expenses
  const totalMonthlyExpenses = expenses
    .filter((expense) => {
      const expenseDate = String(expense.expense_date).slice(0, 10);

      return (
        expenseDate.slice(0, 4) === String(currentDate.getFullYear()) &&
        expenseDate.slice(5, 7) ===
        String(currentDate.getMonth() + 1).padStart(2, "0")
      );
    })
    .reduce((total, expense) => total + Number(expense.amount), 0);

  // Calculate pending chores assigned to current user
  const pendingChores = choreAssignments.filter(
    (assignment) =>
      Number(assignment.assigned_to) === currentUserId &&
      assignment.status === "Pending"
  ).length;

  // Calculate outstanding balance
  const yourBalance = expenseSplits
    .filter(
      (split) =>
        Number(split.user_id) === currentUserId &&
        Number(split.paid_by) !== currentUserId &&
        Number(split.is_paid) === 0
    )
    .reduce((total, split) => total + Number(split.share_amount), 0);

  // Dashboard Summary Data
  const summaryCards = [
    {
      title: "Total Expenses",
      amount: expenseLoading
        ? "Loading..."
        : `₹${totalMonthlyExpenses.toLocaleString("en-IN")}`,
      description: "This month",
      icon: Wallet,
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Your Balance",
      amount: balanceLoading
        ? "Loading..."
        : `₹${yourBalance.toLocaleString("en-IN")}`,
      description: "You owe others",
      icon: CreditCard,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Pending Chores",
      amount: choreLoading ? "Loading..." : pendingChores,
      description: "Tasks assigned to you",
      icon: ClipboardCheck,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  // Recent Expense Data
  const recentExpenses = [...expenses]
    .sort(
      (a, b) =>
        new Date(b.expense_date) - new Date(a.expense_date)
    )
    .slice(0, 3)
    .map((expense) => ({
      id: expense.expense_id,
      title: expense.title,
      category: expense.category || "Other",
      paidBy: expense.paid_by_name,
      date: new Date(
        `${String(expense.expense_date).slice(0, 10)}T00:00:00`
      ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      amount: `₹${Number(expense.amount).toLocaleString("en-IN")}`,
    }));

  // Get unpaid payments for the current user
  const pendingPayments = expenseSplits
    .filter(
      (split) =>
        Number(split.user_id) === currentUserId &&
        Number(split.paid_by) !== currentUserId &&
        Number(split.is_paid) === 0
    )
    .map((split) => ({
      id: split.split_id,
      name: split.paid_by_name,
      reason: split.expense_title,
      amount: Number(split.share_amount),
    }));

  const totalPendingPayments = pendingPayments.reduce(
    (total, payment) => total + payment.amount,
    0
  );

  // Upcoming Chores Data
  const upcomingChores = [...choreAssignments]
    .filter((chore) => chore.status !== "Completed")
    .sort((a, b) => {
      return new Date(a.due_date) - new Date(b.due_date);
    })
    .slice(0, 3)
    .map((chore) => ({
      id: chore.assignment_id,
      title: chore.chore_name,
      assignedTo: chore.assigned_to_name,
      date: chore.due_date
        ? new Date(
          `${String(chore.due_date).slice(0, 10)}T00:00:00`
        ).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        : "No due date",
      status: chore.status,
    }));

  // Add New Notice
  async function addNotice(e) {
    e.preventDefault();

    if (!noticeInput.trim()) {
      return;
    }

    if (!group?.group_id) {
      setNoticeError("Group not found.");
      return;
    }

    try {
      setNoticeError("");
      setNoticeSubmitting(true);

      await createNotice({
        groupId: group.group_id,
        title: "Notice",
        message: noticeInput.trim(),
      });

      setNoticeInput("");
      await fetchNotices(group.group_id);
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

  // Update notice
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
      await fetchNotices(group.group_id);
    } catch (error) {
      setNoticeError(error.message);
    }
  }

  // Delete notice
  async function handleDeleteNotice(noticeId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this notice?"
    );

    if (!confirmed) return;

    try {
      setNoticeError("");

      await deleteNotice(noticeId);
      await fetchNotices(group.group_id);
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
          <span className="text-sm font-medium">
            {groupLoading ? "Loading group..." : group?.group_name || "No Group"}
          </span>
        </div>
      </div>

      {groupError && (
        <p className="text-sm text-red-500">{groupError}</p>
      )}

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

            <Link
              to="/expenses"
              className="text-green-700 text-sm font-semibold hover:text-green-800"
            >
              View All
            </Link>
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
                {expenseLoading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-gray-500">
                      Loading expenses...
                    </td>
                  </tr>
                ) : expenseError ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-red-500">
                      {expenseError}
                    </td>
                  </tr>
                ) : recentExpenses.length > 0 ? (
                  recentExpenses.map((expense) => (
                    <tr
                      key={expense.id}
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
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-gray-500">
                      No expenses found. Add your first group expense!
                    </td>
                  </tr>
                )}
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
            {pendingPayments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No pending payments!
              </p>
            ) : (
              pendingPayments.map((payment) => (
                <div
                  key={payment.id}
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
                    ₹{payment.amount.toLocaleString("en-IN")}
                  </p>
                </div>
              ))
            )}

            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-xs text-orange-700">
                Total amount you owe
              </p>

              <h3 className="text-2xl font-bold text-orange-700 mt-1">
                ₹{totalPendingPayments.toLocaleString("en-IN")}
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

          <Link
            to="/chores"
            className="text-green-700 text-sm font-semibold hover:text-green-800"
          >
            View All
          </Link>
        </div>

        <div className="divide-y divide-gray-100">
          {choreLoading ? (
            <p className="text-center py-8 text-gray-500">
              Loading chores...
            </p>
          ) : choreError ? (
            <p className="text-center py-8 text-red-500">
              {choreError}
            </p>
          ) : upcomingChores.length > 0 ? (
            upcomingChores.map((chore) => (
              <div
                key={chore.id}
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
            ))
          ) : (
            <p className="text-center py-8 text-gray-500">
              No upcoming chores found.
            </p>
          )}
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