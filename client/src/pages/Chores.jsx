import { useState, useEffect } from 'react'
import {
  ClipboardList,
  CheckCircle,
  Clock,
  Plus,
  CalendarDays,
  User,
  X,
  Check,
  ShieldCheck
} from 'lucide-react'

import {
  CURRENT_USER,
  getChores,
  saveChores
} from '../services/choreStorage'

function Chores() {

  const [chores, setChores] = useState(() => getChores())

  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('All')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignedTo, setAssignedTo] = useState('Rahul')
  const [secondaryVerifier, setSecondaryVerifier] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('Medium')

  const members = ['Rohit', 'Rahul', 'Amit', 'Priya', 'Sahil', 'Arya']

  // Listen for chore updates
  useEffect(() => {
    const updateChores = () => {
      setChores(getChores())
    }

    window.addEventListener('sharespaceChoresUpdated', updateChores)
    window.addEventListener('storage', updateChores)

    return () => {
      window.removeEventListener('sharespaceChoresUpdated', updateChores)
      window.removeEventListener('storage', updateChores)
    }
  }, [])

  // Calculate chore summary
  const totalChores = chores.length

  const completedChores = chores.filter(
    (chore) => chore.status === 'Completed'
  ).length

  const pendingChores = chores.filter(
    (chore) => chore.status !== 'Completed'
  ).length

  // Filter chores
  const filteredChores = chores.filter((chore) => {
    if (filter === 'All') {
      return true
    }

    return chore.status === filter
  })

  // Save updated chores
  const updateChoreList = (updatedChores) => {
    setChores(updatedChores)
    saveChores(updatedChores)
  }

  // Add a new chore
  const addChore = (e) => {
    e.preventDefault()

    const newChore = {
      id: Date.now(),
      title,
      description,
      assignedTo,
      createdBy: CURRENT_USER,
      secondaryVerifier,
      dueDate,
      priority,
      status: 'Pending',
      submittedBy: '',
      submittedAt: '',
      approvedBy: '',
      approvedAt: ''
    }

    updateChoreList([...chores, newChore])

    setTitle('')
    setDescription('')
    setAssignedTo('Rahul')
    setSecondaryVerifier('')
    setDueDate('')
    setPriority('Medium')
    setShowForm(false)
  }

  // Assigned member submits chore for verification
  const submitForVerification = (id) => {
    const updatedChores = chores.map((chore) => {
      if (
        chore.id === id &&
        chore.assignedTo === CURRENT_USER &&
        chore.status === 'Pending'
      ) {
        return {
          ...chore,
          status: 'Awaiting Verification',
          submittedBy: CURRENT_USER,
          submittedAt: new Date().toLocaleString('en-IN')
        }
      }

      return chore
    })

    updateChoreList(updatedChores)
  }

  // Creator or secondary verifier approves chore
  const approveChore = (id) => {
    const updatedChores = chores.map((chore) => {
      const canApprove =
        chore.createdBy === CURRENT_USER ||
        chore.secondaryVerifier === CURRENT_USER

      if (
        chore.id === id &&
        chore.status === 'Awaiting Verification' &&
        canApprove
      ) {
        return {
          ...chore,
          status: 'Completed',
          approvedBy: CURRENT_USER,
          approvedAt: new Date().toLocaleString('en-IN')
        }
      }

      return chore
    })

    updateChoreList(updatedChores)
  }

  // Format date
  const formatDate = (date) => {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">

      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Chores
          </h1>

          <p className="text-gray-500 mt-1">
            Manage household tasks and keep your group organized.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
        >
          <Plus size={18} />
          Add Chore
        </button>

      </div>


      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Chores</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-2">
                {totalChores}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                All household tasks
              </p>
            </div>

            <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
              <ClipboardList size={25} />
            </div>
          </div>
        </div>


        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed Chores</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-2">
                {completedChores}
              </h2>
              <p className="text-xs text-green-600 mt-1">
                Approved tasks
              </p>
            </div>

            <div className="bg-green-100 text-green-600 p-3 rounded-xl">
              <CheckCircle size={25} />
            </div>
          </div>
        </div>


        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Chores</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-2">
                {pendingChores}
              </h2>
              <p className="text-xs text-orange-500 mt-1">
                Tasks not yet approved
              </p>
            </div>

            <div className="bg-orange-100 text-orange-600 p-3 rounded-xl">
              <Clock size={25} />
            </div>
          </div>
        </div>

      </div>


      {/* Chores List */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Household Chores
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              View, complete and verify household tasks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">

            {['All', 'Pending', 'Awaiting Verification', 'Completed'].map((item) => (

              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  filter === item
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {item}
              </button>

            ))}

          </div>

        </div>


        {/* Chore Cards */}
        <div className="space-y-4">

          {filteredChores.length > 0 ? (

            filteredChores.map((chore) => {

              const canSubmit =
                chore.assignedTo === CURRENT_USER &&
                chore.status === 'Pending'

              const canApprove =
                chore.status === 'Awaiting Verification' &&
                (
                  chore.createdBy === CURRENT_USER ||
                  chore.secondaryVerifier === CURRENT_USER
                )

              return (

                <div
                  key={chore.id}
                  className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition"
                >

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                    {/* Chore Details */}
                    <div className="flex items-start gap-3">

                      <div className={`p-3 rounded-lg ${
                        chore.status === 'Completed'
                          ? 'bg-green-100 text-green-600'
                          : chore.status === 'Awaiting Verification'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-orange-100 text-orange-600'
                      }`}>
                        <ClipboardList size={22} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {chore.title}
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                          {chore.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 mt-3">

                          <span className="flex items-center gap-1.5 text-xs text-gray-500">
                            <User size={14} />
                            Assigned to: {chore.assignedTo}
                          </span>

                          <span className="flex items-center gap-1.5 text-xs text-gray-500">
                            <CalendarDays size={14} />
                            {formatDate(chore.dueDate)}
                          </span>

                        </div>

                        <div className="text-xs text-gray-500 mt-2">
                          Created by: {chore.createdBy}
                          {chore.secondaryVerifier && (
                            <span> | Verifier: {chore.secondaryVerifier}</span>
                          )}
                        </div>

                        {chore.status === 'Awaiting Verification' && (
                          <p className="text-xs text-blue-600 mt-2">
                            Submitted by {chore.submittedBy} for verification.
                          </p>
                        )}

                        {chore.status === 'Completed' && (
                          <p className="text-xs text-green-600 mt-2">
                            Approved by {chore.approvedBy}
                          </p>
                        )}

                      </div>

                    </div>


                    {/* Priority, Status and Action */}
                    <div className="flex flex-wrap items-center gap-3 md:justify-end">

                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        chore.priority === 'High'
                          ? 'bg-red-100 text-red-600'
                          : chore.priority === 'Medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {chore.priority} Priority
                      </span>

                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        chore.status === 'Completed'
                          ? 'bg-green-100 text-green-700'
                          : chore.status === 'Awaiting Verification'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-600'
                      }`}>
                        {chore.status}
                      </span>

                      {canSubmit && (
                        <button
                          onClick={() => submitForVerification(chore.id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
                        >
                          <Check size={15} />
                          Submit for Verification
                        </button>
                      )}

                      {canApprove && (
                        <button
                          onClick={() => approveChore(chore.id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700 transition"
                        >
                          <ShieldCheck size={15} />
                          Approve Chore
                        </button>
                      )}

                      {chore.status === 'Awaiting Verification' && !canApprove && chore.assignedTo !== CURRENT_USER && (
                        <span className="text-xs text-gray-400">
                          Waiting for approval
                        </span>
                      )}

                    </div>

                  </div>

                </div>

              )
            })

          ) : (

            <div className="text-center py-12">
              <ClipboardList
                size={40}
                className="mx-auto text-gray-300 mb-3"
              />

              <h3 className="font-semibold text-gray-700">
                No chores found
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                There are no {filter.toLowerCase()} chores to display.
              </p>
            </div>

          )}

        </div>

      </div>


      {/* Add Chore Popup */}
      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">

            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <X size={21} />
            </button>

            <h2 className="text-xl font-bold text-gray-800">
              Add New Chore
            </h2>

            <p className="text-sm text-gray-500 mt-1 mb-6">
              Create a household task and assign it to a member.
            </p>


            <form onSubmit={addChore} className="space-y-4">

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Chore Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter chore name"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
                />
              </div>


              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter chore description"
                  rows="3"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 resize-none"
                />
              </div>


              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Assign To
                </label>

                <select
                  value={assignedTo}
                  onChange={(e) => {
                    setAssignedTo(e.target.value)

                    if (e.target.value === secondaryVerifier) {
                      setSecondaryVerifier('')
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 bg-white"
                >
                  {members
                    .filter((member) => member !== CURRENT_USER)
                    .map((member) => (
                      <option key={member} value={member}>
                        {member}
                      </option>
                    ))}
                </select>
              </div>


              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Secondary Verifier (Optional)
                </label>

                <select
                  value={secondaryVerifier}
                  onChange={(e) => setSecondaryVerifier(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 bg-white"
                >
                  <option value="">No Secondary Verifier</option>

                  {members
                    .filter((member) =>
                      member !== CURRENT_USER && member !== assignedTo
                    )
                    .map((member) => (
                      <option key={member} value={member}>
                        {member}
                      </option>
                    ))}
                </select>

                <p className="text-xs text-gray-400 mt-1">
                  The creator or this roommate can approve the chore.
                </p>
              </div>


              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Due Date
                </label>

                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
                />
              </div>


              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Priority
                </label>

                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 bg-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>


              <div className="flex items-center gap-3 pt-3">

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700"
                >
                  Add Chore
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}

export default Chores
