import { useEffect, useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import DashboardLayout from "./components/DashboardLayout";

import Login from "./pages/login";
import Register from "./pages/Register";
import GroupSetup from "./pages/GroupSetup";

import Dashboard from "./pages/Dashboard";
import Group from "./pages/Group";
import Expenses from "./pages/Expenses";
import Chores from "./pages/Chores";
import ShoppingList from "./pages/ShoppingList";
import Profile from "./pages/Profile";

import { getMyGroups } from "./services/groupService";

// Check whether the user is logged in
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Check group membership before opening dashboard pages
function GroupRequiredRoute({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const checkGroup = async () => {
      try {
        const groups = await getMyGroups();

        setStatus(groups && groups.length > 0 ? "allowed" : "no-group");
      } catch (error) {
        console.error("Group Check Error:", error);
        setStatus("error");
      }
    };

    checkGroup();
  }, []);

  if (status === "checking") {
    return <div className="min-h-screen flex items-center justify-center">Checking group membership...</div>;
  }

  if (status === "no-group") {
    return <Navigate to="/group-setup" replace />;
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p>Unable to verify your group membership.</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return children;
}

// Prevent existing group members from opening Group Setup
function GroupSetupRoute() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const checkGroup = async () => {
      try {
        const groups = await getMyGroups();

        setStatus(groups && groups.length > 0 ? "has-group" : "no-group");
      } catch (error) {
        console.error("Group Check Error:", error);
        setStatus("error");
      }
    };

    checkGroup();
  }, []);

  if (status === "checking") {
    return <div className="min-h-screen flex items-center justify-center">Checking group membership...</div>;
  }

  if (status === "has-group") {
    return <Navigate to="/dashboard" replace />;
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p>Unable to verify your group membership.</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return <GroupSetup />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/group-setup"
          element={
            <ProtectedRoute>
              <GroupSetupRoute />
            </ProtectedRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <GroupRequiredRoute>
                <DashboardLayout />
              </GroupRequiredRoute>
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/group" element={<Group />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/chores" element={<Chores />} />
          <Route path="/shopping-list" element={<ShoppingList />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;