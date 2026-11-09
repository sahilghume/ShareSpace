import { useState, useEffect } from "react";
import { getMyGroups } from "../services/groupService";
import { getExpenseSplits } from "../services/expenseService";
import { getGroupMembers } from "../services/groupService";
import { getGroupExpenses, createExpense } from "../services/expenseService";
import {
  Wallet,
  IndianRupee,
  TrendingUp,
  Plus,
  Receipt,
  ArrowRight,
  X
} from 'lucide-react'

function Expenses() {

  const [showForm, setShowForm] = useState(false)

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Groceries')
  const [paidBy, setPaidBy] = useState('Rohit')
  const [expenseSplits, setExpenseSplits] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupId, setGroupId] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [expenseDate, setExpenseDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        setError("");

        const groups = await getMyGroups();

        if (!groups || groups.length === 0) {
          throw new Error("You are not a member of any group.");
        }

        const currentGroupId = groups[0].group_id;
        setGroupId(currentGroupId);
        const members = await getGroupMembers(currentGroupId);
        setGroupMembers(members);
        setSelectedMembers(members.map((member) => member.user_id));
        console.log("Group Members:", members);

        const data = await getGroupExpenses(currentGroupId);

        setExpenses(data);
        const allSplits = await Promise.all(
          data.map((expense) => getExpenseSplits(expense.expense_id))
        );

        const splits = allSplits.flat().map((split) => {
          const expense = data.find(
            (item) => item.expense_id === split.expense_id
          );

          return {
            ...split,
            paid_by: expense?.paid_by,
            paid_by_name: expense?.paid_by_name,
          };
        });

        setExpenseSplits(splits);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  // Add a new expense

  const addExpense = async (e) => {
    e.preventDefault();

    if (!title.trim() || Number(amount) <= 0 || !groupId) {
      setError("Please enter valid expense details.");
      return;
    }

    if (selectedMembers.length === 0) {
      setError("Please select at least one member for the split.");
      return;
    }

    try {
      setError("");

      await createExpense({
        groupId,
        title: title.trim(),
        amount: Number(amount),
        category,
        expenseDate,
        splitBetween: selectedMembers,
      });

      const data = await getGroupExpenses(groupId);
      setExpenses(data);

      const allSplits = await Promise.all(
        data.map((expense) => getExpenseSplits(expense.expense_id))
      );

      const splits = allSplits.flat().map((split) => {
        const expense = data.find(
          (item) => item.expense_id === split.expense_id
        );

        return {
          ...split,
          paid_by: expense?.paid_by,
          paid_by_name: expense?.paid_by_name,
        };
      });

      setExpenseSplits(splits);

      setTitle("");
      setAmount("");
      setCategory("Groceries");
      setExpenseDate(new Date().toLocaleDateString("en-CA"));
      setShowForm(false);
    } catch (error) {
      setError(error.message);
    }
  };


  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = Number(currentUser.id);

  const yourContribution = expenses
    .filter((expense) => Number(expense.paid_by) === currentUserId)
    .reduce((total, expense) => total + Number(expense.amount), 0);


  const amountYouOwe = expenseSplits
    .filter(
      (split) =>
        Number(split.user_id) === currentUserId &&
        Number(split.paid_by) !== currentUserId &&
        Number(split.is_paid) === 0
    )
    .reduce((total, split) => total + Number(split.share_amount), 0);

  const amountOwedToYou = expenseSplits
    .filter(
      (split) =>
        Number(split.paid_by) === currentUserId &&
        Number(split.user_id) !== currentUserId &&
        Number(split.is_paid) === 0
    )
    .reduce((total, split) => total + Number(split.share_amount), 0);

  const yourBalance = amountOwedToYou - amountYouOwe;

  const memberBalances = groupMembers.map((member) => {
    const amountOwed = expenseSplits
      .filter(
        (split) =>
          Number(split.user_id) === Number(member.user_id) &&
          Number(split.paid_by) !== Number(member.user_id) &&
          Number(split.is_paid) === 0
      )
      .reduce((total, split) => total + Number(split.share_amount), 0);

    const amountToReceive = expenseSplits
      .filter(
        (split) =>
          Number(split.paid_by) === Number(member.user_id) &&
          Number(split.user_id) !== Number(member.user_id) &&
          Number(split.is_paid) === 0
      )
      .reduce((total, split) => total + Number(split.share_amount), 0);

    return {
      user_id: member.user_id,
      name: member.name,
      balance: amountToReceive - amountOwed,
    };
  });

  const debtors = memberBalances
    .filter((member) => member.balance < 0)
    .map((member) => ({
      user_id: member.user_id,
      name: member.name,
      amount: Math.abs(member.balance),
    }));

  const creditors = memberBalances
    .filter((member) => member.balance > 0)
    .map((member) => ({
      user_id: member.user_id,
      name: member.name,
      amount: member.balance,
    }));

  const settlementSuggestions = [];

  let debtorIndex = 0;
  let creditorIndex = 0;

  while (
    debtorIndex < debtors.length &&
    creditorIndex < creditors.length
  ) {
    const amount = Math.min(
      debtors[debtorIndex].amount,
      creditors[creditorIndex].amount
    );

    settlementSuggestions.push({
      from: debtors[debtorIndex].name,
      to: creditors[creditorIndex].name,
      amount: Number(amount.toFixed(2)),
    });

    debtors[debtorIndex].amount -= amount;
    creditors[creditorIndex].amount -= amount;

    if (debtors[debtorIndex].amount < 0.01) debtorIndex++;
    if (creditors[creditorIndex].amount < 0.01) creditorIndex++;
  }

  return (

    <div className="space-y-6">

      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Expenses
          </h1>

          <p className="text-gray-500 mt-1">
            Track shared expenses and manage group payments.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700"
        >
          <Plus size={18} />
          Add Expense
        </button>

      </div>


      {/* Expense Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total Expenses</p>
            <Wallet className="text-green-600" size={22} />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mt-3">
            ₹{totalExpenses.toLocaleString("en-IN")}
          </h2>

          <p className="text-xs text-gray-400 mt-2">
            Total group spending
          </p>
        </div>


        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Your Contribution</p>
            <IndianRupee className="text-blue-600" size={22} />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mt-3">
            ₹{yourContribution.toLocaleString("en-IN")}
          </h2>

          <p className="text-xs text-gray-400 mt-2">
            Amount paid by you
          </p>
        </div>


        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Your Balance</p>
            <TrendingUp className="text-red-500" size={22} />
          </div>

          <h2 className="text-2xl font-bold text-red-600 mt-3">
            ₹{yourBalance.toLocaleString("en-IN")}
          </h2>

          <p className="text-xs text-gray-400 mt-2">
            You owe to the group
          </p>
        </div>

      </div>


      {/* Recent Expenses */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">

        <div className="flex items-center justify-between mb-5">

          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Recent Expenses
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              View and manage your group's expenses.
            </p>
          </div>

          <Receipt className="text-green-600" size={24} />

        </div>


        <div className="overflow-x-auto">

          <table className="w-full text-sm text-left">

            <thead className="text-gray-500 bg-gray-50">
              <tr>
                <th className="p-3 font-semibold">Expense</th>
                <th className="p-3 font-semibold">Category</th>
                <th className="p-3 font-semibold">Paid By</th>
                <th className="p-3 font-semibold">Date</th>
                <th className="p-3 font-semibold">Amount</th>
              </tr>
            </thead>


            <tbody>

              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center p-6 text-gray-500">
                    Loading expenses...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="text-center p-6 text-red-500">
                    {error}
                  </td>
                </tr>
              ) : expenses.length > 0 ? (
                expenses.map((expense) => (
                  <tr
                    key={expense.expense_id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="p-3 font-semibold text-gray-800">
                      {expense.title}
                    </td>

                    <td className="p-3 text-gray-600">
                      {expense.category}
                    </td>

                    <td className="p-3 text-gray-600">
                      {expense.paid_by_name}
                    </td>

                    <td className="p-3 text-gray-500">
                      {String(expense.expense_date).slice(0, 10)}
                    </td>

                    <td className="p-3 font-semibold text-gray-800">
                      ₹{Number(expense.amount).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-6 text-gray-400">
                    No expenses added yet.
                  </td>
                </tr>
              )}
            </tbody>

          </table>

        </div>

        {expenses.length === 0 && (
          <p className="text-center text-gray-400 py-8">
            No expenses added yet.
          </p>
        )}

      </div>


      {/* Member Balances and Settlement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Member Balances */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">

          <h2 className="text-lg font-bold text-gray-800">
            Member Balances
          </h2>

          <p className="text-sm text-gray-500 mt-1 mb-5">
            Check how much each member owes.
          </p>


          <div className="space-y-4">
            {memberBalances.length > 0 ? (
              memberBalances.map((member) => {
                const balanceType =
                  member.balance > 0
                    ? "Gets back"
                    : member.balance < 0
                      ? "Owes"
                      : "Settled";

                return (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between border-b border-gray-100 pb-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
                        {member.name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")}
                      </div>

                      <p className="text-sm font-semibold text-gray-800">
                        {member.name}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className={`text-sm font-bold ${member.balance < 0 ? "text-red-600" : "text-green-600"
                        }`}>
                        ₹{Math.abs(member.balance).toLocaleString("en-IN")}
                      </p>

                      <p className="text-xs text-gray-400">
                        {balanceType}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 text-center">
                No member balances available.
              </p>
            )}
          </div>

        </div>


        {/* Settlement Suggestions */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">

          <h2 className="text-lg font-bold text-gray-800">
            Settlement Suggestions
          </h2>

          <p className="text-sm text-gray-500 mt-1 mb-5">
            Suggested payments to settle group balances.
          </p>


          <div className="space-y-4">
            {settlementSuggestions.length > 0 ? (
              settlementSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 rounded-lg p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {suggestion.from}
                    </p>

                    <p className="text-xs text-gray-500">
                      Pays {suggestion.to}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      ₹{suggestion.amount.toLocaleString("en-IN")}
                    </p>

                    <ArrowRight
                      className="text-green-600 ml-auto"
                      size={17}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center">
                No pending settlements.
              </p>
            )}
          </div>

        </div>

      </div>


      {/* Add Expense Popup */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-800">
                Add New Expense
              </h2>

              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={addExpense} className="space-y-4">

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Expense Name
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Monthly Groceries"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-green-600"
                >
                  <option>Groceries</option>
                  <option>Utilities</option>
                  <option>Household</option>
                  <option>Rent</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Expense Date
                </label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Paid By
                </label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-gray-700">
                  You (Logged-in User)
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Split Between
                </label>

                <div className="border border-gray-300 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                  {groupMembers.map((member) => {
                    const memberId = Number(member.user_id);

                    return (
                      <label
                        key={memberId}
                        className="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(memberId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMembers((prev) => [...prev, memberId]);
                            } else {
                              setSelectedMembers((prev) =>
                                prev.filter((id) => id !== memberId)
                              );
                            }
                          }}
                          className="accent-green-600"
                        />

                        {member.name || member.full_name || member.user_name || "Member"}
                      </label>
                    );
                  })}
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  The expense will be divided equally among selected members.
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700"
                >
                  Save Expense
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default Expenses
