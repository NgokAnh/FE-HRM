import { useEffect, useMemo, useState } from "react";
import { createEmployee, updateEmployeeBasicInfo } from "../../api/employeeApi";

export default function EmployeeModal({ mode = "add", employee, onClose, onSaved }) {
  const isEdit = mode === "edit";

  // --- Placeholder cho các field ---
  const placeholders = useMemo(() => {
    const e = employee || {};
    return {
      fullname: e.fullname ? "" : "Chưa có họ tên",
      email: e.email ? "" : "Chưa có email",
      phone: e.phone ? "" : "Chưa có SĐT",
      hiredDate: e.hiredDate ? "" : "Chưa có ngày vào làm (YYYY-MM-DD)",
    };
  }, [employee]);

  const [form, setForm] = useState({
    fullname: "",
    email: "",
    phone: "",
    hiredDate: "",
    status: "ACTIVE",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Log khi modal mount
  useEffect(() => {
    console.log("🟢 EmployeeModal mounted", { mode, employee });

    if (!isEdit) {
      setForm({
        fullname: "",
        email: "",
        phone: "",
        hiredDate: "",
        status: "ACTIVE",
      });
      setError("");
      return;
    }

    setForm({
      fullname: employee?.fullname ?? "",
      email: employee?.email ?? "",
      phone: employee?.phone ?? "",
      hiredDate: employee?.hiredDate ?? "",
      status: (employee?.status ?? "ACTIVE").toString().toUpperCase(),
    });
    setError("");
  }, [isEdit, employee]);

  const onChange = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    console.log("✏️ Field changed:", key, value);
  };

  const handleSubmit = async () => {
    console.log("🚀 handleSubmit called", { isEdit, form });
    try {
      setLoading(true);
      setError("");

      if (isEdit) {
        const payload = {
          ...employee,
          fullname: form.fullname || null,
          email: form.email || null,
          phone: form.phone || null,
          hiredDate: form.hiredDate || null,
          status: form.status || "ACTIVE",
        };
        console.log("✏️ [UPDATE] Sending payload:", payload);
        await updateEmployeeBasicInfo(employee.id, payload);
      } else {
        const payload = {
          fullname: form.fullname,
          email: form.email,
          phone: form.phone,
          hiredDate: form.hiredDate || null,
          status: form.status || "ACTIVE",
        };
        console.log("✏️ [CREATE] Sending payload:", payload);
        await createEmployee(payload);
      }

      console.log("✅ Submit successful");
      onSaved?.();
    } catch (e) {
      console.error("❌ [EmployeeModal] Submit error:", e);
      setError(e?.message || "Lưu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Cập nhật nhân viên" : "Thêm nhân viên"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {error && <div className="text-red-600 text-sm">{error}</div>}

          <Field label="Họ và tên">
            <input
              value={form.fullname}
              onChange={onChange("fullname")}
              placeholder={placeholders.fullname || "Nhập họ và tên"}
              className="w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-blue-200"
            />
          </Field>

          <Field label="Email">
            <input
              value={form.email}
              onChange={onChange("email")}
              placeholder={placeholders.email || "Nhập email"}
              className="w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-blue-200"
            />
          </Field>

          <Field label="Số điện thoại">
            <input
              value={form.phone}
              onChange={onChange("phone")}
              placeholder={placeholders.phone || "Nhập số điện thoại"}
              className="w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-blue-200"
            />
          </Field>

          <Field label="Ngày vào làm">
            <input
              type="date"
              value={form.hiredDate}
              onChange={onChange("hiredDate")}
              placeholder={placeholders.hiredDate}
              className="w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-blue-200"
            />
            {!form.hiredDate && (
              <div className="text-xs text-gray-500 mt-1">{placeholders.hiredDate}</div>
            )}
          </Field>

          <Field label="Trạng thái">
            <select
              value={form.status}
              onChange={onChange("status")}
              className="w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="ACTIVE">Đang làm việc</option>
              <option value="INACTIVE">Đã nghỉ việc</option>
            </select>
          </Field>

          <Field label="Chức vụ (Role)">
            <input
              value={employee?.role?.name ?? employee?.role?.code ?? ""}
              placeholder="Chưa có chức vụ"
              disabled
              className="w-full px-4 py-2 rounded-lg border bg-gray-50 text-gray-600"
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="p-5 border-t flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            disabled={loading}
          >
            Hủy
          </button>

          <button
            onClick={() => { console.log("🔥 Clicked Lưu"); handleSubmit(); }}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-sm font-medium mb-1">{label}</div>
      {children}
    </div>
  );
}