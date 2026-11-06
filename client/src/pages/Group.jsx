
import { useState } from 'react'
import {
  Users,
  MapPin,
  CalendarDays,
  Copy,
  Home,
  Crown,
  Mail,
  LogOut,
  AlertTriangle,
  X
} from 'lucide-react'

function Group() {

  const [copied, setCopied] = useState(false)
  const [showLeavePopup, setShowLeavePopup] = useState(false)

  // Sample group details
  const group = {
    name: 'Happy Home',
    description: 'A place where roommates live better together.',
    address: 'Kharghar, Navi Mumbai',
    createdOn: '15 September 2026',
    inviteCode: 'SHARE123'
  }

  // Sample group members
  const members = [
    {
      id: 1,
      name: 'Rohit Katkar',
      email: 'rohit@example.com',
      role: 'Admin',
      initials: 'RK'
    },
    {
      id: 2,
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      role: 'Member',
      initials: 'RS'
    },
    {
      id: 3,
      name: 'Amit Patil',
      email: 'amit@example.com',
      role: 'Member',
      initials: 'AP'
    },
    {
      id: 4,
      name: 'Priya Deshmukh',
      email: 'priya@example.com',
      role: 'Member',
      initials: 'PD'
    },
    {
      id: 5,
      name: 'Sahil Ghume',
      email: 'sahil@example.com',
      role: 'Member',
      initials: 'SG'
    },
    {
      id: 6,
      name: 'Arya Tamore',
      email: 'arya@example.com',
      role: 'Member',
      initials: 'AT'
    }
  ]

  // Copy invite code
  const copyInviteCode = () => {
    navigator.clipboard.writeText(group.inviteCode)
    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  // Confirm leave group
  const confirmLeaveGroup = () => {
    setShowLeavePopup(false)
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
                {group.name}
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {group.description}
              </p>
            </div>

          </div>

          <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold w-fit">
            Active Group
          </span>

        </div>


        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6 pt-6 border-t border-gray-100">

          <div className="flex items-center gap-3">
            <MapPin className="text-green-600" size={20} />

            <div>
              <p className="text-xs text-gray-500">Location</p>
              <p className="text-sm font-semibold text-gray-800">
                {group.address}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CalendarDays className="text-green-600" size={20} />

            <div>
              <p className="text-xs text-gray-500">Created On</p>
              <p className="text-sm font-semibold text-gray-800">
                {group.createdOn}
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

            {members.map((member) => (

              <div
                key={member.id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50"
              >

                <div className="flex items-center gap-3">

                  <div className="w-11 h-11 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold shrink-0">
                    {member.initials}
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


                {member.role === 'Admin' ? (

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

            ))}

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
              {group.inviteCode}
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
            {copied ? 'Copied!' : 'Copy Invite Code'}
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
                Are you sure you want to leave <span className="font-semibold text-gray-800">{group.name}</span>?
                You will lose access to this group's expenses, chores and shared shopping list.
              </p>

              <p className="text-sm text-red-600 font-medium mt-3">
                You will need to join another group to access group features again.
              </p>

            </div>


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
                className="flex-1 bg-red-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700"
              >
                Yes, Leave Group
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}

export default Group
