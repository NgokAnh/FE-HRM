import { NavLink, useNavigate } from "react-router-dom";
import { logout as apiLogout } from "../../api/authApi";
import { logout as clearAuth } from "../../utils/auth";

const menus = [
  { label: "Tổng quan", to: "/employee", icon: "dashboard" },
  { label: "Chấm công", to: "/employee/attendance", icon: "fact_check" },
  { label: "Lịch làm việc", to: "/employee/schedule", icon: "calendar_month" },
  { label: "Bảng lương", to: "/employee/payroll", icon: "payments" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.fullname || "Nhân viên";
  const userEmail = user.email || "employee@company.com";
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    try {
      await apiLogout?.();
    } catch (error) {
      console.error(error);
    } finally {
      clearAuth();
      navigate("/login", { replace: true });
    }
  };

  return (
    <aside className="hidden md:flex w-64 bg-white border-r min-h-screen px-4 py-6 flex-col">
      <h2 className="text-xl font-bold text-blue-600 mb-8">EMPLOYEE PORTAL</h2>

      {/* MENU */}
      <nav className="space-y-1 flex-1">
        {menus.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/employee"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg
              transition-all duration-200
              ${isActive
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-100 hover:translate-x-1"
              }`
            }
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t my-4" />

      {/* ACCOUNT */}
      <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-gray-50">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
          {userInitial}
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-800">{userName}</div>
          <div className="text-xs text-gray-500">{userEmail}</div>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="mt-2 flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
      >
        <span className="material-symbols-outlined text-[20px]">logout</span>
        <span className="font-medium">Đăng xuất</span>
      </button>
    </aside>
  );
}