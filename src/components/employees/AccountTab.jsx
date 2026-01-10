import { useState } from "react";
import { resetEmployeePassword } from "../../api/employeeApi";

export default function AccountTab({ mode = "add", employee, form, onChange }) {
  const isEdit = mode === "edit";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleResetPassword = async () => {
    if (!employee?.id) return;

    try {
      setLoading(true);
      setError("");

      await resetEmployeePassword(employee.id, 123456);
      alert("Mật khẩu đã được reset về 123456");
    } catch (e) {
      const msg = e.response?.data?.message || "Reset mật khẩu thất bại";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-xl">
      <h3 className="font-semibold text-lg">Tài khoản đăng nhập</h3>

      {error && <div className="text-sm text-red-600">{error}</div>}

      {/* USERNAME */}
      <Field label="Tên đăng nhập">
        <input
          value={isEdit ? employee?.email ?? "" : form.email}
          disabled
          className="w-full px-4 py-2 rounded-lg border bg-gray-100"
        />
      </Field>

      {/* ROLE - chỉ hiển thị, không chỉnh sửa */}
      <Field label="Chức vụ">
        <input
          value={isEdit ? employee?.role?.name || "" : form.role || ""}
          disabled
          className="w-full px-4 py-2 rounded-lg border bg-gray-100 text-gray-600"
        />
      </Field>

      {/* ===== EDIT MODE ===== */}
      {isEdit && (
        <>
          <Field label="Trạng thái mật khẩu">
            <input
              value="Đã thiết lập"
              disabled
              className="w-full px-4 py-2 rounded-lg border bg-gray-100 text-gray-600"
            />
          </Field>

          <button
            onClick={handleResetPassword}
            disabled={loading}
            className="bg-orange-600 text-white px-5 py-2 rounded-lg"
          >
            {loading ? "Đang reset..." : "Reset mật khẩu về 123456"}
          </button>
        </>
      )}

      {/* ===== ADD MODE ===== */}
      {!isEdit && (
        <>
          <Field label="Mật khẩu">
            <input
              type="password"
              value={form.password}
              onChange={(e) => onChange("password", e.target.value)}
              placeholder="Mật khẩu mặc định là số điện thoại của nhân viên"
              className="w-full px-4 py-2 rounded-lg border text-gray-600"
            />
          </Field>

          <Field label="Nhập lại mật khẩu">
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => onChange("confirmPassword", e.target.value)}
              placeholder="Nhập lại mật khẩu (không bắt buộc)"
              className="w-full px-4 py-2 rounded-lg border text-gray-600"
            />
          </Field>
        </>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-sm font-medium text-gray-700 mb-1">{label}</div>
      {children}
    </div>
  );
}