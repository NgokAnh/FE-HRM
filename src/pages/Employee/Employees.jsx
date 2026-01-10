import { useEffect, useMemo, useState } from "react";
import EmployeeModal from "../../components/employees/AddEmployeeModal";
import { getEmployees, deleteEmployee } from "../../api/employeeApi";

export default function Employees() {
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // search + filter
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("ALL"); // ALL | ACTIVE | INACTIVE
  const [roleFilter, setRoleFilter] = useState("ALL"); // ALL | ADMIN | EMPLOYEE

  // Map dropdown role -> name hiển thị
  const roleNameMap = {
    ADMIN: "ADMIN",
    EMPLOYEE: "EMPLOYEE",
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Không tải được danh sách nhân viên");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // khóa scroll khi mở modal
  useEffect(() => {
    document.body.style.overflow =
      openAdd || selectedEmployee ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openAdd, selectedEmployee]);

  // filter client-side
  const filteredEmployees = useMemo(() => {
    const k = keyword.trim().toLowerCase();

    return employees.filter((e) => {
      // search
      const matchKeyword =
        !k ||
        String(e.id ?? "").toLowerCase().includes(k) ||
        String(e.fullname ?? "").toLowerCase().includes(k) ||
        String(e.email ?? "").toLowerCase().includes(k) ||
        String(e.phone ?? "").toLowerCase().includes(k);

      // status
      const empStatus = String(e.status ?? "").toUpperCase();
      const matchStatus = status === "ALL" || empStatus === status;

      // role by name
      const empRoleName = e.role?.name ?? "";
      const matchRole =
        roleFilter === "ALL" || empRoleName === roleNameMap[roleFilter];

      return matchKeyword && matchStatus && matchRole;
    });
  }, [employees, keyword, status, roleFilter]);

  const handleDelete = async (emp) => {
    const ok = window.confirm(
      `Xóa nhân viên "${emp.fullname || emp.email || emp.id}"?`
    );
    if (!ok) return;

    try {
      setLoading(true);
      setError("");
      await deleteEmployee(emp.id);
      setEmployees((prev) => prev.filter((x) => x.id !== emp.id));
    } catch (e) {
      setError(e?.message || "Xóa nhân viên thất bại");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setKeyword("");
    setStatus("ALL");
    setRoleFilter("ALL");
  };

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
          {/* SEARCH */}
          <div className="flex-1 flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
            <span className="material-symbols-outlined text-gray-500">search</span>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="bg-transparent outline-none flex-1"
              placeholder="Tìm theo tên, email, SĐT, ID..."
            />
          </div>

          {/* CLEAR */}
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-lg bg-gray-100"
          >
            Xóa bộ lọc
          </button>

          {/* APPLY */}
          {/* <button className="px-4 py-2 rounded-lg bg-blue-600 text-white">
            Áp dụng
          </button> */}
        </div>

        <div className="flex gap-3">
          {/* STATUS */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-100 outline-none"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang làm việc</option>
            <option value="INACTIVE">Đã nghỉ việc</option>
          </select>

          {/* ROLE */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-100 outline-none"
          >
            <option value="ALL">Tất cả chức vụ</option>
            <option value="ADMIN">ADMIN</option>
            <option value="EMPLOYEE">EMPLOYEE</option>
          </select>
        </div>
      </div>

      {loading && <div className="text-gray-600">Đang tải...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {/* TABLE */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="p-4">
                <input type="checkbox" />
              </th>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Họ và tên</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">SĐT</th>
              <th className="p-4 text-left">Chức vụ</th>
              <th className="p-4 text-left">Trạng thái</th>
              <th className="p-4 text-center">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.map((emp) => (
              <tr
                key={emp.id}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedEmployee(emp)}
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>

                <td className="p-4 font-medium">{emp.id}</td>
                <td className="p-4">{emp.fullname || "—"}</td>
                <td className="p-4 text-gray-600">{emp.email || "—"}</td>
                <td className="p-4">{emp.phone || "—"}</td>
                <td className="p-4">{emp.role?.name ?? "—"}</td>
                <td className="p-4">
                  {String(emp.status).toUpperCase() === "ACTIVE" ? (
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
                      icon="edit"
                      onClick={() => setSelectedEmployee(emp)}
                    />
                    <ActionIcon
                      icon="delete"
                      danger
                      onClick={() => handleDelete(emp)}
                    />
                  </div>
                </td>
              </tr>
            ))}

            {!loading && filteredEmployees.length === 0 && (
              <tr>
                <td
                  className="p-6 text-center text-gray-500"
                  colSpan={8}
                >
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODALS */}
      {openAdd && (
        <EmployeeModal
          mode="add"
          onClose={() => setOpenAdd(false)}
          onSaved={() => {
            setOpenAdd(false);
            fetchEmployees();
          }}
        />
      )}

      {selectedEmployee && (
        <EmployeeModal
          mode="edit"
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onSaved={() => {
            setSelectedEmployee(null);
            fetchEmployees();
          }}
        />
      )}
    </div>
  );
}

/* -------- COMPONENT PHỤ -------- */
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