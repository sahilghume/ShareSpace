
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Wallet,
  ClipboardCheck,
  ShoppingBasket,
  LogOut,
  House
} from 'lucide-react'

function Sidebar() {

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'My Groups',
      path: '/groups',
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
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">

      {/* Logo Section */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100">

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
            RK
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800">
              User Name
            </p>
            <p className="text-xs text-gray-500">
              Roommate
            </p>
          </div>

        </div>

        <button className="flex items-center gap-3 text-gray-600 hover:text-red-600 px-3 py-2 w-full rounded-lg hover:bg-red-50 transition-colors">

          <LogOut size={19} />

          <span className="text-sm">Logout</span>

        </button>

      </div>

    </aside>
  )
}

export default Sidebar
