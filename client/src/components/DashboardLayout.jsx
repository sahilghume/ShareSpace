import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function DashboardLayout() {
  return (
    <div className="h-screen overflow-hidden bg-gray-50">

      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="h-screen md:ml-64 flex flex-col min-w-0">

        {/* Navbar */}
        <Navbar />

        {/* Scrollable Page Content */}
        <main className="flex-1 min-h-0 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>

      </div>
    </div>
  );
}

export default DashboardLayout;