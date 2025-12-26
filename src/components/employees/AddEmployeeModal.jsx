import { useState } from "react";
import AddEmployeeTabs from "./AddEmployeeTabs";
import EmployeeInfoForm from "./EmployeeInfoForm";
import EmployeeSalaryForm from "./EmployeeSalaryForm";

export default function AddEmployeeModal({ onClose }) {
  const [tab, setTab] = useState("info");

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-start overflow-y-auto">
      <div className="bg-white w-full max-w-6xl mt-10 rounded-xl shadow-lg">

        {/* HEADER */}
        <div className="p-6">
          <h2 className="text-2xl font-semibold">Thêm Nhân viên</h2>
          <p className="text-gray-500">
            Nhập thông tin chi tiết để tạo hồ sơ nhân viên mới.
          </p>
        </div>

        {/* TABS */}
        <AddEmployeeTabs tab={tab} setTab={setTab} />

        {/* CONTENT */}
        <div className="p-6">
          {tab === "info" && <EmployeeInfoForm />}
          {tab === "salary" && <EmployeeSalaryForm />}
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-4 px-6 py-4 border-t">
          <button onClick={onClose} className="text-gray-600">
            Hủy bỏ
          </button>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg">
            Lưu thông tin
          </button>
        </div>
      </div>
    </div>
  );
}