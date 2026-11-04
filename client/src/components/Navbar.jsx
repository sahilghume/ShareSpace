
import { Bell, Search } from 'lucide-react'

function Navbar() {

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">

      {/* Left Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">
          Welcome to ShareSpace!
        </h2>

        <p className="text-sm text-gray-500">
          Manage your shared living space easily.
        </p>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">

        {/* Search Icon */}
        <button className="text-gray-500 hover:text-green-600 transition-colors">
          <Search size={21} />
        </button>

        {/* Notification Icon */}
        <button className="relative text-gray-500 hover:text-green-600 transition-colors">
          <Bell size={22} />

          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3">

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

      </div>

    </header>
  )
}

export default Navbar
