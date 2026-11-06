
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import DashboardLayout from './components/DashboardLayout';

import Login from './pages/Login';
import Register from './pages/Register';

import Dashboard from './pages/Dashboard';
import Group from './pages/Group';
import Expenses from './pages/Expenses';
import Chores from './pages/Chores';
import ShoppingList from './pages/ShoppingList';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Authentication Routes */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard Layout Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/group" element={<Group />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/chores" element={<Chores />} />
          <Route path="/shopping-list" element={<ShoppingList />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
