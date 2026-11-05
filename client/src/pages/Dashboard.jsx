import { useState } from "react";

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
} from "lucide-react";

function Dashboard() {
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

  // Recent Expense Data (Latest 3)
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

  // Notice Board Data
  const [notices, setNotices] = useState([
    {
      id: 1,
      name: "Rahul Sharma",
      message:
        "Electricity bill has been paid. Everyone please check their pending balance.",
      time: "Today, 9:30 AM",
    },
    {
      id: 2,
      name: "Rohit Katkar",
      message:
        "Aaj Ratri Jevan Banavu Naka. Mi hotel madhun jevan order karnar aahe.",
      time: "Today, 8:15 AM",
    },
    {
      id: 3,
      name: "Arya Tamore",
      message: "Udya Sakali 8 vajta Mi Gavala janar ahe ",
      time: "Yesterday, 9:45 PM",
    },
    {
      id: 4,
      name: "Sahil Ghume",
      message: "Istriche Kapde Aanle.",
      time: "Yesterday, 8:45 PM",
    },
    {
      id: 5,
      name: "Sahil Patil",
      message: "Mala late hoil mi aaj date la jaanar ahe.",
      time: "Yesterday, 5:45 PM",
    },
  ]);

  // Notice Input
  const [noticeInput, setNoticeInput] = useState("");

  // Add New Notice
  function addNotice(e) {
    e.preventDefault();

    if (noticeInput.trim() === "") {
      return;
    }

    const newNotice = {
      id: Date.now(),
      name: "Rohit",
      message: noticeInput.trim(),
      time: new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setNotices([newNotice, ...notices]);

    setNoticeInput("");
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

              <p className="text-xs text-gray-500 mt-2">{card.description}</p>
            </div>
          );
        })}
      </div>

      {/* Notice Board */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 text-green-700 p-3 rounded-lg">
              <Megaphone size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-800">Notice Board</h2>

              <p className="text-sm text-gray-500 mt-1">
                Important updates from your roommates
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Notices */}
        <div className="max-h-64 overflow-y-auto p-5 space-y-4">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className="flex gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
            >
              <div className="bg-green-100 text-green-700 rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm shrink-0">
                {notice.name.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <p className="text-sm font-semibold text-gray-800">
                    {notice.name}
                  </p>

                  <p className="text-xs text-gray-400">{notice.time}</p>
                </div>

                <p className="text-sm text-gray-600 mt-2 break-words">
                  {notice.message}
                </p>
              </div>
            </div>
          ))}

          {notices.length === 0 && (
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
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Send size={16} />
            Post Notice
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

                  <p className="text-xs text-gray-500 mt-1">{payment.reason}</p>
                </div>

                <p className="text-sm font-bold text-orange-600 whitespace-nowrap">
                  {payment.amount}
                </p>
              </div>
            ))}

            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-xs text-orange-700">Total amount you owe</p>

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
            <h2 className="text-lg font-bold text-gray-800">Upcoming Chores</h2>

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
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    chore.status === "Pending"
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

      {/* Bottom Section: Two Equal Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Shared Shopping List */}
        <div className="bg-white rounded-xl p-6 text-black flex flex-col justify-between border border-gray-200">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <ShoppingBasket size={25} className="text-green-600" />

              <h3 className="text-lg font-bold">Shared Shopping List</h3>
            </div>

            <p className="text-sm text-gray-600 mb-5">
              Keep track of household essentials and shopping items.
            </p>
          </div>

          <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 w-fit">
            Manage Shopping List
          </button>
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
              <House size={75} strokeWidth={1.5} className="text-green-700" />

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
