import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";

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
      {/* PUBLIC */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* ADMIN */}
      <Route path="/admin" element={<DashboardLayout />}>
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