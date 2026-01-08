// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// Admin layouts & pages
import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/Dashboard";
import Employees from "../pages/Employee/Employees";
import Attendance from "../pages/Attendance";
import WorkSchedule from "../pages/WorkSchedule";
import Payroll from "../pages/Payroll";
import PayrollDetail from "../pages/PayrollDetail";
import Reports from "../pages/Reports";
import Shift from "../pages/Shift/Shift";

// Employee layouts & pages
import EmployeeLayout from "../layouts/EmployeeLayout";
import Overview from "../pages/EmployeePages/Overview";
import EmpAttendance from "../pages/EmployeePages/Attendance";
import Schedule from "../pages/EmployeePages/Schedule";
import EmpPayroll from "../pages/EmployeePages/Payroll";

// Auth pages
import Login from "../pages/Login";
import Signup from "../pages/Signup";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ROOT */}
      <Route path="/" element={<Navigate to="/admin" replace />} />

      {/* PUBLIC */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
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

      {/* EMPLOYEE */}
      <Route
        path="/employee"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <EmployeeLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Overview />} />
        <Route path="attendance" element={<EmpAttendance />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="payroll" element={<EmpPayroll />} />
      </Route>

      {/* 404 fallback */}
      <Route path="*" element={<div className="p-6 text-center">Page Not Found</div>} />
    </Routes>
  );
}