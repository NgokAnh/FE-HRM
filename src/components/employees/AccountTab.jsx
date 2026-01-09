import { useState } from "react";
import { resetEmployeePassword } from "../../api/employeeApi";

const ROLE_OPTIONS = [
  { id: 1, name: "ADMIN" },
  { id: 2, name: "EMPLOYEE" },
];

export default function AccountTab({ mode = "add", employee, form, onChange }) {
  const isEdit = mode === "edit";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleResetPassword = async () => {
    if (!employee?.id) return;

    try {
      setLoading(true);
      setError("");

      await resetEmployeePassword(employee.id, { newPassword: "123456" });
      alert("Mật khẩu đã được reset về 123456");
    } catch (e) {
      setError("Reset mật khẩu thất bại");
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

      {/* ROLE */}
      <Field label="Chức vụ">
        <select
          value={isEdit ? employee?.role?.name || "" : form.role || ""}
          onChange={(e) => onChange("role", e.target.value)}
          className="w-full px-4 py-2 rounded-lg border"
        >
          <option value="">
            {isEdit && employee?.role?.name ? employee.role.name : "Chọn chức vụ"}
          </option>
          {ROLE_OPTIONS.map((role) => (
            <option key={role.id} value={role.name}>
              {role.name}
            </option>
          ))}
        </select>
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
            Reset mật khẩu về 123456
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
              className="w-full px-4 py-2 rounded-lg border"
            />
          </Field>

          <Field label="Nhập lại mật khẩu">
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => onChange("confirmPassword", e.target.value)}
              className="w-full px-4 py-2 rounded-lg border"
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