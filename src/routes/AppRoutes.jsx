import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/Login";
import Signup from "../pages/Signup";

import Dashboard from "../pages/Dashboard";
import Employees from "../pages/Employee/Employees";
import Attendance from "../pages/Attendance";
import Payroll from "../pages/Payroll";
import Reports from "../pages/Reports";
import WorkSchedule from "../pages/WorkSchedule";
import PayrollDetail from "../pages/PayrollDetail";
import Shift from "../pages/Shift/Shift";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ROOT - Redirect to admin */}
      <Route path="/" element={<Navigate to="/admin" replace />} />

      {/* PUBLIC */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="employees" element={<Employees />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="schedule" element={<WorkSchedule />} />
        <Route path="payroll" element={<Payroll />} />
        <Route path="payroll/:month" element={<PayrollDetail />} />
        <Route path="reports" element={<Reports />} />
        <Route path="shift" element={<Shift />} />

      </Route>
    </Routes>
  );
}