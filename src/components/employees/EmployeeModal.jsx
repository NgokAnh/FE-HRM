import { useState } from "react";
import EmployeeInfoForm from "./EmployeeInfoForm";
import EmployeeSalaryForm from "./EmployeeSalaryForm";
import AccountTab from "./AccountTab";

export default function EmployeeModal({
  mode = "add", // "add" | "edit"
  employee,
  onClose,
}) {
  const [tab, setTab] = useState("info");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-lg flex flex-col max-h-[90vh]">

        {/* HEADER (FIXED) */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <h2 className="text-xl font-semibold">
            {mode === "add" ? "Thêm nhân viên" : "Cập nhật nhân viên"}
          </h2>

          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* TABS (FIXED) */}
        <div className="flex gap-6 px-6 pt-4 border-b shrink-0">
        <Tab active={tab === "info"} onClick={() => setTab("info")}>
            Thông tin
        </Tab>

        <Tab active={tab === "salary"} onClick={() => setTab("salary")}>
            Thiết lập lương
        </Tab>

        <Tab active={tab === "account"} onClick={() => setTab("account")}>
            Tài khoản
        </Tab>
        </div>

        {/* BODY (SCROLL) */}
        <div className="p-6 overflow-y-auto flex-1">
          {tab === "info" && (
            <EmployeeInfoForm
              mode={mode}
              defaultValues={employee}
            />
          )}

          {tab === "salary" && (
            <EmployeeSalaryForm
              defaultValues={employee?.salary}
            />
          )}
          {tab === "account" && (
            <AccountTab employee={employee} />
          )}
        </div>

        {/* FOOTER (FIXED) */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100"
          >
            Hủy
          </button>

          <button className="px-4 py-2 rounded-lg bg-blue-600 text-white">
            {mode === "add" ? "Thêm nhân viên" : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* TAB */
function Tab({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`pb-3 border-b-2 font-medium transition ${
        active
          ? "border-blue-600 text-blue-600"
          : "border-transparent text-gray-500 hover:text-gray-800"
      }`}
    >
      {children}
    </button>
  );
}