import { useEffect, useMemo, useState } from "react";
import AddEmployeeTabs from "./AddEmployeeTabs";
import EmployeeInfoForm from "./EmployeeInfoForm";
import EmployeeSalaryForm from "./EmployeeSalaryForm";
import { createEmployee, updateEmployeeBasicInfo } from "../../api/employeeApi";

export default function AddEmployeeModal({
  onClose,
  onSaved,
  mode = "add",     // "add" | "edit"
  employee = null,  // object khi edit
}) {
  const [tab, setTab] = useState("info");
  const isEdit = mode === "edit";

  const buildInitialForm = (emp) => ({
    fullname: emp?.fullname ?? "",
    email: emp?.email ?? "",
    phone: emp?.phone ?? "",
    hiredDate: emp?.hiredDate ?? "",
    status: (emp?.status ?? "ACTIVE").toString().toUpperCase(),

    // TODO: nếu EmployeeInfoForm/SalaryForm có field khác thì thêm vào đây
    // baseSalary: emp?.currentMonthlySalary?.baseSalary ?? "",
  });

  const [form, setForm] = useState(buildInitialForm(employee));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ mỗi lần mở modal edit / đổi selectedEmployee -> fill lại đúng
  useEffect(() => {
    setForm(buildInitialForm(isEdit ? employee : null));
    setError("");
    setTab("info");
  }, [isEdit, employee]);

  // ✅ placeholder: edit -> thiếu mới hiện "Chưa có ..."
  const placeholders = useMemo(() => {
    if (!isEdit) {
      return {
        fullname: "Nhập họ và tên",
        email: "Nhập email",
        phone: "Nhập số điện thoại",
        hiredDate: "Chọn ngày vào làm",
      };
    }
    return {
      fullname: employee?.fullname ? "" : "Chưa có họ tên",
      email: employee?.email ? "" : "Chưa có email",
      phone: employee?.phone ? "" : "Chưa có SĐT",
      hiredDate: employee?.hiredDate ? "" : "Chưa có ngày vào làm",
    };
  }, [isEdit, employee]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");

      // payload cơ bản khớp BE
      const payload = {
        fullname: form.fullname || null,
        email: form.email || null,
        phone: form.phone || null,
        hiredDate: form.hiredDate || null,
        status: (form.status || "ACTIVE").toString().toUpperCase(),
      };

      if (isEdit) {
        await updateEmployeeBasicInfo(employee.id, payload);
      } else {
        await createEmployee(payload);
      }

      onSaved?.();
    } catch (e) {
      setError(e?.message || "Lưu thông tin thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-start overflow-y-auto">
      <div className="bg-white w-full max-w-6xl mt-10 rounded-xl shadow-lg">

        {/* HEADER */}
        <div className="p-6">
          <h2 className="text-2xl font-semibold">
            {isEdit ? "Cập nhật Nhân viên" : "Thêm Nhân viên"}
          </h2>
          <p className="text-gray-500">
            {isEdit
              ? "Chỉnh sửa thông tin chi tiết hồ sơ nhân viên."
              : "Nhập thông tin chi tiết để tạo hồ sơ nhân viên mới."}
          </p>

          {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
        </div>

        {/* TABS */}
        <AddEmployeeTabs tab={tab} setTab={setTab} />

        {/* CONTENT */}
        <div className="p-6">
          {tab === "info" && (
            <EmployeeInfoForm
              value={form}
              onChange={setField}
              placeholders={placeholders}
              mode={mode}
            />
          )}
          {tab === "salary" && (
            <EmployeeSalaryForm
              value={form}
              onChange={setField}
              placeholders={placeholders}
              mode={mode}
            />
          )}
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-4 px-6 py-4 border-t">
          <button onClick={onClose} className="text-gray-600" disabled={loading}>
            Hủy bỏ
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-60"
          >
            {loading ? "Đang lưu..." : "Lưu thông tin"}
          </button>
        </div>
      </div>
    </div>
  );
}
