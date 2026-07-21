import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

import DashboardLayout from "./layout/DashboardLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

import Dashboard from "./pages/Dashboard";
import Services from "./pages/Services";
import Employees from "./pages/Employees";
import Appointments from "./pages/Appointments";
import Customers from "./pages/Customers";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Redirect Home */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Protected Dashboard */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          <Route
            path="/services"
            element={
              <RoleRoute roles={["admin"]}>
                <Services />
              </RoleRoute>
            }
          />

          <Route
            path="/employees"
            element={
              <RoleRoute roles={["admin"]}>
                <Employees />
              </RoleRoute>
            }
          />

          <Route
            path="/appointments"
            element={
              <RoleRoute roles={["admin", "employee"]}>
                <Appointments />
              </RoleRoute>
            }
          />

          <Route
            path="/customers"
            element={
              <RoleRoute roles={["admin", "employee"]}>
                <Customers />
              </RoleRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <RoleRoute roles={["admin"]}>
                <Reports />
              </RoleRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <RoleRoute roles={["admin", "employee"]}>
                <Settings />
              </RoleRoute>
            }
          />
        </Route>

        {/* صفحة غير موجودة */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;