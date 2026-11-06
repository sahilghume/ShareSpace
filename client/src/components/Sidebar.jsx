
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Wallet,
  ClipboardCheck,
  ShoppingBasket,
  LogOut,
  House,
  Menu,
  X
} from 'lucide-react'

import { logoutUser, getCurrentUser } from '../services/api'

function Sidebar() {

  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  // Get current logged-in user
  const currentUser = getCurrentUser()

  // Generate user initials
  const userName = currentUser?.name || 'User'
  const userInitials = userName
    .trim()
    .split(/\s+/)
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  // Handle logout
  const handleLogout = () => {
    logoutUser()
    navigate('/login', { replace: true })
  }

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'My Group',
      path: '/group',
      icon: Users
    },
    {
      name: 'Expenses',
      path: '/expenses',
      icon: Wallet
    },
    {
      name: 'Chores',
      path: '/chores',
      icon: ClipboardCheck
    },
    {
      name: 'Shopping List',
      path: '/shopping-list',
      icon: ShoppingBasket
    }
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-green-600 text-white rounded-lg shadow-md"
      >
        <Menu size={23} />
      </button>

      {/* Mobile Background Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black/40 z-40"
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static top-0 left-0 z-50
          w-64 min-h-screen bg-white border-r border-gray-200
          flex flex-col
          transform transition-transform duration-300
          md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >

        {/* Logo Section */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100">

          <div className="flex items-center gap-3">

            <div className="bg-green-600 p-2 rounded-lg">
              <House size={25} className="text-white" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-green-700">
                ShareSpace
              </h1>
              <p className="text-xs text-gray-500">
                Live better together
              </p>
            </div>

          </div>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-gray-500 hover:text-red-600"
          >
            <X size={23} />
          </button>

        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6">

          <p className="text-xs font-semibold text-gray-400 uppercase mb-4 px-3">
            Main Menu
          </p>

          <div className="space-y-2">

            {menuItems.map((item) => {

              const Icon = item.icon

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-green-100 text-green-700 font-semibold'
                        : 'text-gray-600 hover:bg-green-50 hover:text-green-700'
                    }`
                  }
                >

                  <Icon size={20} />

                  <span>{item.name}</span>

                </NavLink>
              )
            })}

          </div>

        </nav>

        {/* User Profile Section */}
        <div className="border-t border-gray-100 p-4">

          <div className="flex items-center gap-3 mb-4">

            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
              {userInitials}
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {userName}
              </p>
              <p className="text-xs text-gray-500">
                Roommate
              </p>
            </div>

          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-gray-600 hover:text-red-600 px-3 py-2 w-full rounded-lg hover:bg-red-50 transition-colors"
          >

            <LogOut size={19} />

            <span className="text-sm">Logout</span>

          </button>

        </div>

      </aside>
    </>
  )
}

export default Sidebar
