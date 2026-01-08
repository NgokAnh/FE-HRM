import { Outlet } from "react-router-dom";
import Sidebar from "../components/Employee/Sidebar";
import BottomNav from "../components/Employee/BottomNav";

export default function EmployeeLayout() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-background-dark">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-64 h-screen flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark overflow-y-auto">
        <Sidebar />
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-y-auto relative">
        {/* Outlet */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </div>

        {/* Bottom navigation */}
        <BottomNav />
      </main>
    </div>
  );
}