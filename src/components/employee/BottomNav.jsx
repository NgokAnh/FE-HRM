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
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around py-2 shadow-md">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/employee"} // để /employee match đúng khi index
          className={({ isActive }) =>
            `flex flex-col items-center text-xs transition-colors px-2 py-1 rounded ${
              isActive
                ? "text-blue-600 bg-blue-50 font-semibold"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
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
        className="flex flex-col items-center text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors"
      >
        <span className="material-symbols-outlined text-2xl">logout</span>
        Đăng xuất
      </button>
    </div>
  );
}