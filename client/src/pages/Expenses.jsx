
import { useState } from 'react'
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

  const [expenses, setExpenses] = useState([
    {
      id: 1,
      title: 'Monthly Groceries',
      category: 'Groceries',
      amount: 4500,
      paidBy: 'Rohit',
      date: '05 Nov 2026',
      status: 'Approved'
    },
    {
      id: 2,
      title: 'Electricity Bill',
      category: 'Utilities',
      amount: 2200,
      paidBy: 'Rahul',
      date: '04 Nov 2026',
      status: 'Approved'
    },
    {
      id: 3,
      title: 'Internet Bill',
      category: 'Utilities',
      amount: 1000,
      paidBy: 'Amit',
      date: '03 Nov 2026',
      status: 'Pending'
    },
    {
      id: 4,
      title: 'Cleaning Supplies',
      category: 'Household',
      amount: 800,
      paidBy: 'Priya',
      date: '02 Nov 2026',
      status: 'Pending'
    }
  ])

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Groceries')
  const [paidBy, setPaidBy] = useState('Rohit')

  const totalExpenses = expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  )

  // Add a new expense
  const addExpense = (e) => {
    e.preventDefault()

    if (title.trim() === '' || amount <= 0) {
      return
    }

    const newExpense = {
      id: Date.now(),
      title: title,
      category: category,
      amount: Number(amount),
      paidBy: paidBy,
      date: new Date().toLocaleDateString('en-IN'),
      status: 'Pending'
    }

    setExpenses([newExpense, ...expenses])

    setTitle('')
    setAmount('')
    setCategory('Groceries')
    setPaidBy('Rohit')
    setShowForm(false)
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
            ₹{totalExpenses.toLocaleString('en-IN')}
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
            ₹4,500
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
            -₹1,250
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

              {expenses.map((expense) => (

                <tr
                  key={expense.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >

                  <td className="p-3 font-semibold text-gray-800">
                    {expense.title}
                  </td>

                  <td className="p-3 text-gray-600">
                    {expense.category}
                  </td>

                  <td className="p-3 text-gray-600">
                    {expense.paidBy}
                  </td>

                  <td className="p-3 text-gray-500">
                    {expense.date}
                  </td>

                  <td className="p-3 font-semibold text-gray-800">
                    ₹{expense.amount.toLocaleString('en-IN')}
                  </td>

                </tr>

              ))}

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

            {[
              { name: 'Rohit Katkar', amount: 2500, type: 'Gets back' },
              { name: 'Rahul Sharma', amount: 1250, type: 'Owes' },
              { name: 'Amit Patil', amount: 750, type: 'Owes' },
              { name: 'Priya Deshmukh', amount: 500, type: 'Owes' }
            ].map((member, index) => (

              <div
                key={index}
                className="flex items-center justify-between border-b border-gray-100 pb-3"
              >

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
                    {member.name.split(' ').map(word => word[0]).join('')}
                  </div>

                  <p className="text-sm font-semibold text-gray-800">
                    {member.name}
                  </p>

                </div>

                <div className="text-right">

                  <p className={`text-sm font-bold ${
                    member.type === 'Owes'
                      ? 'text-red-600'
                      : 'text-green-600'
                  }`}>
                    ₹{member.amount.toLocaleString('en-IN')}
                  </p>

                  <p className="text-xs text-gray-400">
                    {member.type}
                  </p>

                </div>

              </div>

            ))}

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

            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">

              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Rahul Sharma
                </p>

                <p className="text-xs text-gray-500">
                  Pays Rohit Katkar
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold text-green-600">
                  ₹1,250
                </p>
                <ArrowRight className="text-green-600 ml-auto" size={17} />
              </div>

            </div>


            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">

              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Amit Patil
                </p>

                <p className="text-xs text-gray-500">
                  Pays Rohit Katkar
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold text-green-600">
                  ₹750
                </p>
                <ArrowRight className="text-green-600 ml-auto" size={17} />
              </div>

            </div>


            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">

              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Priya Deshmukh
                </p>

                <p className="text-xs text-gray-500">
                  Pays Rohit Katkar
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold text-green-600">
                  ₹500
                </p>
                <ArrowRight className="text-green-600 ml-auto" size={17} />
              </div>

            </div>

          </div>

        </div>

      </div>


      {/* Add Expense Popup */}
      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">

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
                  Paid By
                </label>

                <select
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-green-600"
                >
                  <option>Rohit</option>
                  <option>Rahul</option>
                  <option>Amit</option>
                  <option>Priya</option>
                </select>
              </div>


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
