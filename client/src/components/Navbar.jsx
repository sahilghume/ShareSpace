
import { Bell, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

function Navbar() {

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between gap-3">

      {/* Left Section */}
      <div className="ml-12 md:ml-0 min-w-0">
        <h2 className="text-lg md:text-xl font-bold text-gray-800">
          Welcome to ShareSpace!
        </h2>

        <p className="hidden sm:block text-sm text-gray-500">
          Manage your shared living space easily.
        </p>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4 md:gap-6">

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
        <Link
          to="/profile"
          className="flex items-center gap-2 md:gap-3 hover:bg-gray-50 rounded-lg p-1 sm:p-2 transition-colors"
        >

          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
            RK
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-800">
              Rohit
            </p>

            <p className="text-xs text-gray-500">
              Roommate
            </p>
          </div>

        </Link>

      </div>

    </header>
  );
}

export default Navbar;
