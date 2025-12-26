import { useState } from "react";
import { Link } from "react-router-dom";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* LOGO */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-600 text-[28px]">
              grid_view
            </span>
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-center">
          QUẢN LÝ NHÂN SỰ
        </h1>
        <p className="text-center text-gray-500 mt-1 mb-6">
          Đăng nhập để tiếp tục quản lý công việc.
        </p>

        {/* FORM */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">
              Email hoặc Tên đăng nhập
            </label>
            <input
              className="w-full mt-1 px-4 py-2.5 rounded-lg border"
              placeholder="user@company.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Mật khẩu</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-2.5 pr-10 rounded-lg border"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <span className="material-symbols-outlined">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <button className="w-full py-3 rounded-lg bg-blue-600 text-white">
            Đăng nhập
          </button>
        </div>

        {/* FOOTER */}
        <div className="mt-6 pt-4 border-t text-center text-sm text-gray-500">
          Chưa có tài khoản?{" "}
          <Link to="/signup" className="text-blue-600 font-medium">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}