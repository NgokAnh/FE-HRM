import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
  <main className="ml-64 min-h-screen w-[calc(100%-16rem)] p-6">
          <Outlet />
        </main>
      </div>
  );
}