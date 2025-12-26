import { useState, useEffect } from "react";
import AddEmployeeModal from "../components/employees/AddEmployeeModal";
import EmployeeModal from "../components/employees/EmployeeModal";

const employees = [
  {
    id: "NV001",
    name: "Nguyễn Văn An",
    email: "nguyenvana@company.com",
    department: "Kinh doanh",
    position: "Trưởng phòng",
    status: "active",
  },
  {
    id: "NV002",
    name: "Trần Thị Bình",
    email: "tranthib@company.com",
    department: "Nhân sự",
    position: "Chuyên viên",
    status: "active",
  },
  {
    id: "NV003",
    name: "Lê Văn Cường",
    email: "levanc@company.com",
    department: "Kỹ thuật",
    position: "Lập trình viên",
    status: "inactive",
  },
];

export default function Employees() {
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  useEffect(() => {
    if (openAdd || selectedEmployee) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openAdd, selectedEmployee]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Danh sách nhân viên</h1>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">
            <span className="material-symbols-outlined">download</span>
            Xuất file
          </button>

          <button
            onClick={() => setOpenAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            <span className="material-symbols-outlined">add</span>
            Thêm nhân viên
          </button>
        </div>
      </div>

      {/* FILTER */}
      <div className="bg-white rounded-xl p-6 border space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
            <span className="material-symbols-outlined text-gray-500">
              search
            </span>
            <input
              className="bg-transparent outline-none flex-1"
              placeholder="Tìm theo tên, mã nhân viên..."
            />
          </div>

          <button className="px-4 py-2 rounded-lg bg-gray-100">
            Xóa bộ lọc
          </button>

          <button className="px-4 py-2 rounded-lg bg-blue-600 text-white">
            Áp dụng
          </button>
        </div>

        <div className="flex gap-3">
          <FilterSelect label="Phòng ban" />
          <FilterSelect label="Chức vụ" />
          <FilterSelect label="Trạng thái" />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="p-4">
                <input type="checkbox" />
              </th>
              <th className="p-4 text-left">Mã NV</th>
              <th className="p-4 text-left">Họ và tên</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Phòng ban</th>
              <th className="p-4 text-left">Chức vụ</th>
              <th className="p-4 text-left">Trạng thái</th>
              <th className="p-4 text-center">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((emp) => (
              <tr
                key={emp.id}
                className="border-t cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedEmployee(emp)}
              >
                <td className="p-4">
                  <input type="checkbox" onClick={(e) => e.stopPropagation()} />
                </td>

                <td className="p-4 font-medium">{emp.id}</td>

                <td className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  {emp.name}
                </td>

                <td className="p-4 text-gray-600">{emp.email}</td>
                <td className="p-4">{emp.department}</td>
                <td className="p-4">{emp.position}</td>

                <td className="p-4">
                  {emp.status === "active" ? (
                    <span className="px-3 py-1 text-green-700 bg-green-100 rounded-full">
                      Đang làm việc
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-red-700 bg-red-100 rounded-full">
                      Đã nghỉ việc
                    </span>
                  )}
                </td>

                <td className="p-4">
                  <div
                    className="flex justify-center gap-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ActionIcon
                      icon="visibility"
                      onClick={() => setSelectedEmployee(emp)}
                    />
                    <ActionIcon
                      icon="edit"
                      onClick={() => setSelectedEmployee(emp)}
                    />
                    <ActionIcon icon="delete" danger />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="flex items-center justify-between p-4 text-sm text-gray-600">
          Hiển thị <b>1-3</b> trên <b>100</b>

          <div className="flex items-center gap-1">
            <PaginationBtn icon="chevron_left" />
            <PaginationBtn label="1" />
            <PaginationBtn label="2" />
            <PaginationBtn label="3" active />
            <PaginationBtn icon="chevron_right" />
          </div>
        </div>
      </div>

      {/* MODALS */}
      {openAdd && (
        <EmployeeModal
          mode="add"
          onClose={() => setOpenAdd(false)}
        />
      )}

      {selectedEmployee && (
        <EmployeeModal
          mode="edit"
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </div>
  );
}

/* -------- COMPONENT PHỤ -------- */

function FilterSelect({ label }) {
  return (
    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
      {label}
      <span className="material-symbols-outlined text-[18px]">
        expand_more
      </span>
    </button>
  );
}

function ActionIcon({ icon, danger, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg hover:bg-gray-100 ${
        danger ? "text-red-600" : "text-gray-600"
      }`}
    >
      <span className="material-symbols-outlined text-[20px]">
        {icon}
      </span>
    </button>
  );
}

function PaginationBtn({ label, icon, active }) {
  return (
    <button
      className={`w-8 h-8 rounded border flex items-center justify-center
        ${
          active
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white"
        }`}
    >
      {icon ? (
        <span className="material-symbols-outlined text-[18px]">
          {icon}
        </span>
      ) : (
        label
      )}
    </button>
  );
}