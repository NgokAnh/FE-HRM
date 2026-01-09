import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as apiLogin } from "../api/authApi";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const { user } = await apiLogin({ username, password });

    const roleName = user?.role?.name;

    if (!roleName) {
      throw new Error("Không xác định được quyền người dùng");
    }

    if (roleName === "ADMIN") {
      navigate("/admin", { replace: true });
    } else if (roleName === "EMPLOYEE") {
      navigate("/employee", { replace: true });
    } else {
      throw new Error("Role không hợp lệ");
    }
  } catch (err) {
    console.error("❌ Login error:", err);
    setError(
      err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin."
    );
  } finally {
    setLoading(false);
  }
};

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
          Đăng nhập để tiếp tục
        </p>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">          <div>
          <label className="text-sm font-medium">
            Email hoặc Tên đăng nhập
          </label>
          <input
            className="w-full mt-1 px-4 py-2.5 rounded-lg border"
            placeholder="user@company.com"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />
        </div>

          <div>
            <label className="text-sm font-medium">Mật khẩu</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-2.5 pr-10 rounded-lg border"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                disabled={loading}
              >
                <span className="material-symbols-outlined">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-blue-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

      </div>
    </div>
  );
}
