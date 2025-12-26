import { Link } from "react-router-dom";
import { useState } from "react";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-8">
        
        {/* LOGO */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">
              grid_view
            </span>
          </div>
        </div>

        {/* TITLE */}
        <h2 className="text-2xl font-semibold text-center">
          Employee Manager
        </h2>
        <p className="text-gray-500 text-center mt-1 mb-6">
          Tạo tài khoản mới
        </p>

        {/* FORM */}
        <form className="space-y-4">
          <div>
            <label className="text-sm font-medium">Tên đăng nhập</label>
            <input
              type="text"
              placeholder="username"
              className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              placeholder="user@company.com"
              className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Mật khẩu</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full border rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500"
              >
                <span className="material-symbols-outlined">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Nhập lại mật khẩu</label>
            <input
              type="password"
              placeholder="••••••••"
              className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg rounded-lg font-medium transition"
          >
            Đăng ký
          </button>
        </form>

        {/* FOOTER */}
        <p className="text-sm text-center text-gray-500 mt-6">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}