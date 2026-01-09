import { useEffect, useState } from "react";
import EmployeeInfoForm from "./EmployeeInfoForm";
import EmployeeSalaryForm from "./EmployeeSalaryForm";
import AccountTab from "./AccountTab";
import {
  createEmployee,
  updateEmployeeBasicInfo,
} from "../../api/employeeApi";
import { updateSalary } from "../../api/salaryApi";

export default function EmployeeModal({ mode = "add", employee, onClose, onSaved }) {
  const isEdit = mode === "edit";
  const [tab, setTab] = useState("info");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= INIT FORM ================= */
  const buildInitialForm = (emp) => ({
    // Info
    fullname: emp?.fullname || "",
    email: emp?.email || "",
    phone: emp?.phone || "",
    hiredDate: emp?.hiredDate || "",
    status: emp?.status || "ACTIVE",

    // Salary
    salaryType: emp?.salary?.salaryType || "SHIFT",
    baseSalary: emp?.salary?.baseSalary || 0,
    allowance: emp?.salary?.allowance || 0,
    shiftRates: emp?.salary?.shiftRates || [],

    // Account (for new employee)
    password: "",
    confirmPassword: "",
  });

  const [form, setForm] = useState(buildInitialForm(employee));

  useEffect(() => {
    setForm(buildInitialForm(isEdit ? employee : null));
    setTab("info");
    setError("");
  }, [employee, isEdit]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");

      // Password check for new employee
      if (!isEdit && (form.password !== form.confirmPassword || !form.password)) {
        throw new Error("Mật khẩu không khớp hoặc trống");
      }

      if (isEdit) {
        // 1️⃣ Cập nhật thông tin cơ bản
        await updateEmployeeBasicInfo(employee.id, {
          fullname: form.fullname,
          email: form.email,
          phone: form.phone,
          hiredDate: form.hiredDate,
          status: form.status,
        });

        // 2️⃣ Cập nhật bảng lương
        await updateSalary(employee.salary?.id, {
          salaryType: form.salaryType,
          baseSalary: Number(form.baseSalary),
          allowance: Number(form.allowance || 0),
          shiftRates: form.shiftRates,
        });
      } else {
        // Thêm nhân viên mới
        const payload = {
          fullname: form.fullname,
          email: form.email,
          password: form.password,
          phone: form.phone,
          hiredDate: form.hiredDate,
          status: form.status,
          empSalaryType: {
            salaryType: form.salaryType,
            effectiveFrom: form.hiredDate,
          },
        };

        if (form.salaryType === "MONTHLY") {
          payload.empMonthlySalary = {
            baseSalary: Number(form.baseSalary),
            allowance: Number(form.allowance || 0),
            performanceMultiplier: 1,
            effectiveFrom: form.hiredDate,
          };
        } else {
          payload.empShiftRates = form.shiftRates;
        }

        await createEmployee(payload);
      }

      onSaved?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      setError(err?.message || "Lưu thất bại");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-lg flex flex-col max-h-[90vh]">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">
            {isEdit ? "Cập nhật nhân viên" : "Thêm nhân viên"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* TABS */}
        <div className="flex gap-6 px-6 pt-4 border-b">
          <Tab active={tab === "info"} onClick={() => setTab("info")}>Thông tin</Tab>
          <Tab active={tab === "salary"} onClick={() => setTab("salary")}>Thiết lập lương</Tab>
          <Tab active={tab === "account"} onClick={() => setTab("account")}>Tài khoản</Tab>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && <div className="mb-3 text-red-600">{error}</div>}

          {tab === "info" && <EmployeeInfoForm value={form} onChange={setField} />}
          {tab === "salary" && <EmployeeSalaryForm value={form} onChange={setField} />}
          {tab === "account" && <AccountTab mode={mode} employee={employee} form={form} onChange={setField} />}
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100">Hủy</button>
          <button onClick={handleSave} disabled={loading} className="px-4 py-2 rounded-lg bg-blue-600 text-white">
            {loading ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Thêm nhân viên"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= TAB ================= */
function Tab({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`pb-3 border-b-2 font-medium transition ${
        active ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-800"
      }`}
    >
      {children}
    </button>
  );
}