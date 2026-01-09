import { useEffect, useState } from "react";
import AddEmployeeTabs from "./AddEmployeeTabs";
import EmployeeInfoForm from "./EmployeeInfoForm";
import EmployeeSalaryForm from "./EmployeeSalaryForm";
import AccountTab from "./AccountTab";
import { createEmployee, updateEmployeeBasicInfo } from "../../api/employeeApi";

export default function AddEmployeeModal({ onClose, onSaved, mode = "add", employee = null }) {
  const isEdit = mode === "edit";
  const [tab, setTab] = useState("info");

  /* ================= INIT FORM ================= */
  const buildInitialForm = (emp) => ({
    id: emp?.id ?? null,
    fullname: emp?.fullname ?? "",
    email: emp?.email ?? "",
    phone: emp?.phone ?? "",
    hiredDate: emp?.hiredDate ?? "",
    status: (emp?.status ?? "ACTIVE").toUpperCase(),

    // ===== ACCOUNT =====
    password: "",
    confirmPassword: "",

    // ===== SALARY (Shift only) =====
    salaryType: "SHIFT",
    note: "",
    baseSalaryWeekday: "",
    baseSalarySaturday: "",
    baseSalarySunday: "",
    baseSalaryHoliday: "",
    allowance: 0,
  });

  const [form, setForm] = useState(buildInitialForm(employee));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Log khi modal mount hoặc employee thay đổi
  useEffect(() => {
    console.log("🟢 [AddEmployeeModal] mounted/employee changed", { mode, employee });
    setForm(buildInitialForm(isEdit ? employee : null));
    setTab("info");
    setError("");
  }, [isEdit, employee]);

  // ✅ Log khi field thay đổi
  const setField = (key, value) => {
    console.log("✏️ [AddEmployeeModal] Field changed:", key, value);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ================= SAVE ================= */
  /* ================= SAVE ================= */
const handleSave = async () => {
  console.log("🚀 [AddEmployeeModal] handleSave called", { isEdit, form });
  try {
    setLoading(true);
    setError("");

    if (!isEdit && (!form.password || form.password !== form.confirmPassword)) {
      throw new Error("Mật khẩu không khớp");
    }

    // --- Build shift-only payload with OT ---
    const payload = {
      fullname: form.fullname,
      email: form.email,
      phone: form.phone,
      hiredDate: form.hiredDate,
      status: form.status,
      password: !isEdit ? form.password || "123456" : undefined,

      // Lương theo ca
      employeeSalaryTypes: [
        {
          salaryType: "SHIFT",
          effectiveFrom: form.hiredDate,
          note: form.note || "",
        },
      ],
      shiftRates: [
        { dayType: "WEEKDAY", baseRate: Number(form.baseSalaryWeekday || 0), note: form.note || "" },
        { dayType: "SATURDAY", baseRate: Number(form.baseSalarySaturday || 0), note: form.note || "" },
        { dayType: "SUNDAY", baseRate: Number(form.baseSalarySunday || 0), note: form.note || "" },
        { dayType: "HOLIDAY", baseRate: Number(form.baseSalaryHoliday || 0), note: form.note || "" },
      ],

      // OT chung (AFTER_SHIFT)
      empOtRates: [
        {
          otType: "AFTER_SHIFT",
          dayType: "WEEKDAY", // backend chỉ cần 1 ngày, dùng WEEKDAY làm mặc định
          rateMultiplier: Number(form.otRate || 1.5),
          isActive: true,
          effectiveFrom: form.hiredDate,
          effectiveTo: null,
        },
      ],

      // Phụ cấp
      allowance: Number(form.allowance || 0),
    };

    console.log(isEdit ? "✏️ [UPDATE] Sending payload:" : "✏️ [CREATE] Sending payload:", payload);

    if (isEdit) {
      await updateEmployeeBasicInfo(employee.id, payload);
    } else {
      await createEmployee(payload);
    }

    console.log("✅ [AddEmployeeModal] Submit successful");
    onSaved?.();
  } catch (e) {
    console.error("❌ [AddEmployeeModal] Submit error:", e);
    setError(e?.message || "Lưu thông tin thất bại");
  } finally {
    setLoading(false);
  }
};

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-start overflow-y-auto">
      <div className="bg-white w-full max-w-6xl mt-10 rounded-xl shadow-lg">
        <div className="p-6">
          <h2 className="text-2xl font-semibold">{isEdit ? "Cập nhật Nhân viên" : "Thêm Nhân viên"}</h2>
          {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
        </div>

        <AddEmployeeTabs tab={tab} setTab={setTab} />

        <div className="p-6">
          {tab === "info" && <EmployeeInfoForm value={form} onChange={setField} />}
          {tab === "salary" && <EmployeeSalaryForm value={form} onChange={setField} />}
          {tab === "account" && <AccountTab mode={mode} employee={employee} form={form} onChange={setField} />}
        </div>

        <div className="flex justify-end gap-4 px-6 py-4 border-t">
          <button onClick={onClose} className="text-gray-600">Hủy</button>
          <button
            onClick={() => { console.log("🔥 [AddEmployeeModal] Clicked Lưu"); handleSave(); }}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}