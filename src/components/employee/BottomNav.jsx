import { NavLink, useNavigate } from "react-router-dom";
import { logout as apiLogout } from "../../api/authApi";
import { logout as clearAuth } from "../../utils/auth";

const navItems = [
  { label: "Tổng quan", to: "/employee", icon: "dashboard" },
  { label: "Chấm công", to: "/employee/attendance", icon: "fact_check" },
  { label: "Lịch làm việc", to: "/employee/schedule", icon: "calendar_month" },
  { label: "Bảng lương", to: "/employee/payroll", icon: "payments" },
];

export default function BottomNav() {
  const navigate = useNavigate();

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
    <div className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-700 flex justify-around py-2 shadow-lg z-50">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/employee"} // để /employee match đúng khi index
          className={({ isActive }) =>
            `flex flex-col items-center text-xs transition-colors px-2 py-1 rounded min-w-[60px] ${
              isActive
                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 font-semibold"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`
          }
        >
          <span className="material-symbols-outlined text-2xl">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="flex flex-col items-center text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded transition-colors min-w-[60px]"
      >
        <span className="material-symbols-outlined text-2xl">logout</span>
        Đăng xuất
      </button>
    </div>
  );
}