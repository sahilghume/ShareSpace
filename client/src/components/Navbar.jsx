
import { Bell, Search } from 'lucide-react';

function Navbar() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const userName = user.name || user.fullName || "User";

  const initials = userName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">

      <div>
        <h2 className="text-xl font-bold text-gray-800">
          Welcome, {userName}!
        </h2>

        <p className="text-sm text-gray-500">
          Manage your shared living space easily.
        </p>
      </div>

      <div className="flex items-center gap-6">

        <button className="text-gray-500 hover:text-green-600 transition-colors">
          <Search size={21} />
        </button>

        <button className="relative text-gray-500 hover:text-green-600 transition-colors">
          <Bell size={22} />

          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
            {initials}
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800">
              {userName}
            </p>

            <p className="text-xs text-gray-500">
              Roommate
            </p>
          </div>

        </div>

      </div>

    </header>
  );
}

export default Navbar;
