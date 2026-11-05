import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'

import DashboardLayout from './components/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Group from './pages/Group'

function Login() {
  return <h1 className="text-2xl font-bold">Login Page</h1>
}

function Register() {
  return <h1 className="text-2xl font-bold">Register Page</h1>
}

function Expenses() {
  return <h1 className="text-2xl font-bold">Expenses Page</h1>
}

function Chores() {
  return <h1 className="text-2xl font-bold">Chores Page</h1>
}

function ShoppingList() {
  return <h1 className="text-2xl font-bold">Shopping List Page</h1>
}

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
  )
}

export default App
