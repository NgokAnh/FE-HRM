import { useEffect, useMemo, useState } from "react";
import AddEmployeeTabs from "./AddEmployeeTabs";
import EmployeeInfoForm from "./EmployeeInfoForm";
import EmployeeSalaryForm from "./EmployeeSalaryForm";
import AccountTab from "./AccountTab";
import {
  createEmployee,
  updateEmployeeBasicInfo,
} from "../../api/employeeApi";

export default function AddEmployeeModal({
  onClose,
  onSaved,
  mode = "add",
  employee = null,
}) {
  const isEdit = mode === "edit";
  const [tab, setTab] = useState("info");

  /* ================= INIT FORM ================= */
  const buildInitialForm = (emp) => ({
    id: emp?.id ?? null, // <-- thêm dòng này
    fullname: emp?.fullname ?? "",
    email: emp?.email ?? "",
    phone: emp?.phone ?? "",
    hiredDate: emp?.hiredDate ?? "",
    status: (emp?.status ?? "ACTIVE").toUpperCase(),

    // ===== ACCOUNT =====
    password: "",
    confirmPassword: "",

    // ===== SALARY =====
    salaryType: "SHIFT", // SHIFT | MONTHLY

    // MONTHLY
    baseSalary: 0,
    allowance: 0,

    // SHIFT
    shiftRates: [],
  });

  const [form, setForm] = useState(buildInitialForm(employee));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(buildInitialForm(isEdit ? employee : null));
    setTab("info");
    setError("");
  }, [isEdit, employee]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");

      if (!isEdit) {
        if (!form.password || form.password !== form.confirmPassword) {
          throw new Error("Mật khẩu không khớp");
        }
      }

      if (isEdit) {
        await updateEmployeeBasicInfo(employee.id, {
          fullname: form.fullname,
          email: form.email,
          phone: form.phone,
          hiredDate: form.hiredDate,
          status: form.status,
        });
      } else {
        const payload = {
          fullname: form.fullname,
          email: form.email,
          password: form.password || "123456",
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

        console.log("CREATE EMPLOYEE PAYLOAD", payload);
        await createEmployee(payload);
      }

      onSaved?.();
    } catch (e) {
      console.error(e);
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
          <h2 className="text-2xl font-semibold">
            {isEdit ? "Cập nhật Nhân viên" : "Thêm Nhân viên"}
          </h2>
          {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
        </div>

        <AddEmployeeTabs tab={tab} setTab={setTab} />

        <div className="p-6">
          {tab === "info" && (
            <EmployeeInfoForm value={form} onChange={setField} />
          )}

          {tab === "salary" && (
            <EmployeeSalaryForm value={form} onChange={setField} />
          )}

          {tab === "account" && (
            <AccountTab
              mode={mode}
              employee={employee}
              form={form}
              onChange={setField}
            />
          )}
        </div>

        <div className="flex justify-end gap-4 px-6 py-4 border-t">
          <button onClick={onClose} className="text-gray-600">
            Hủy
          </button>
          <button
            onClick={handleSave}
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