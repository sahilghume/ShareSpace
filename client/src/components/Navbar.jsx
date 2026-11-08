import { Link } from "react-router-dom";

function Navbar() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const userName = user.name || user.fullName || "User";

  const initials = userName
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between gap-3">

      {/* Left Section */}
      <div className="ml-12 md:ml-0 min-w-0">
        <h2 className="text-lg md:text-xl font-bold text-gray-800">
          Welcome, {userName}!
        </h2>

        <p className="hidden sm:block text-sm text-gray-500">
          Manage your shared living space easily.
        </p>
      </div>

      {/* User Profile */}
      <Link
        to="/profile"
        className="flex items-center gap-2 md:gap-3 hover:bg-gray-50 rounded-lg p-1 sm:p-2 transition-colors"
      >
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
          {initials}
        </div>

        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-gray-800">
            {userName}
          </p>

          <p className="text-xs text-gray-500">
            Roommate
          </p>
        </div>
      </Link>

    </header>
  );
}

export default Navbar;