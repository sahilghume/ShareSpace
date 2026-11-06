
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";




import GroupSetup from "./pages/GroupSetup";


import DashboardLayout from './components/DashboardLayout';

import Login from './pages/login';
import Register from './pages/Register';


import Dashboard from "./pages/Dashboard";
import Group from "./pages/Group";
import Expenses from "./pages/Expenses";
import Chores from "./pages/Chores";
import ShoppingList from "./pages/ShoppingList";
import Profile from "./pages/Profile";

import { getUserGroup } from "./services/groupStorage";

// Get the currently logged-in user
function getCurrentUser() {
  try {
    return JSON.parse(
      localStorage.getItem("sharespace_current_user")
    );
  } catch {
    return null;
  }
}

// Check whether the user is logged in
function ProtectedRoute({ children }) {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Check whether the user belongs to a group
function GroupRequiredRoute({ children }) {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const userGroup = getUserGroup(currentUser.email);

  if (!userGroup) {
    return <Navigate to="/group-setup" replace />;
  }

  return children;
}

// Prevent users who already have a group from opening Group Setup
function GroupSetupRoute() {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const userGroup = getUserGroup(currentUser.email);

  if (userGroup) {
    return <Navigate to="/dashboard" replace />;
  }

  return <GroupSetup />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Authentication Routes */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Group Setup Route */}
        <Route
          path="/group-setup"
          element={
            <ProtectedRoute>
              <GroupSetupRoute />
            </ProtectedRoute>
          }
        />

        {/* Dashboard Layout Routes */}
        <Route
          element={
            <GroupRequiredRoute>
              <DashboardLayout />
            </GroupRequiredRoute>
          }
        >

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/group"
            element={<Group />}
          />

          <Route
            path="/expenses"
            element={<Expenses />}
          />

          <Route
            path="/chores"
            element={<Chores />}
          />

          <Route
            path="/shopping-list"
            element={<ShoppingList />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

        </Route>

        {/* Invalid Routes */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
