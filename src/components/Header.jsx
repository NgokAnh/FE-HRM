import { useLocation } from "react-router-dom";
import pageTitles from "../constants/pageTitles";

export default function Header() {
  const { pathname } = useLocation();

  const title = pageTitles[pathname] || "HRM System";

  return (
    <header className="flex items-center justify-between px-8 py-4 border-b bg-white">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-300" />
        <div className="text-sm">
          <p className="font-semibold">Admin</p>
          <p className="text-gray-500">Quản lý</p>
        </div>
      </div>
    </header>
  );
}