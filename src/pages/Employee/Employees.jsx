import { useEffect, useMemo, useState } from "react";
import EmployeeModal from "../../components/employees/AddEmployeeModal"
import { getEmployees, deleteEmployee } from "../../api/employeeApi";

export default function Employees() {
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // search
  const [keyword, setKeyword] = useState("");

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Không tải được danh sách nhân viên");
      setEmployees([]);
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // khóa scroll khi mở modal
  useEffect(() => {
    document.body.style.overflow = openAdd || selectedEmployee ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openAdd, selectedEmployee]);

  // lọc client-side
  const filteredEmployees = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return employees;

    return employees.filter((e) => {
      const id = String(e.id ?? "").toLowerCase();
      const name = String(e.fullname ?? "").toLowerCase();
      const email = String(e.email ?? "").toLowerCase();
      const phone = String(e.phone ?? "").toLowerCase();
      return id.includes(k) || name.includes(k) || email.includes(k) || phone.includes(k);
    });
  }, [employees, keyword]);

  const handleDelete = async (emp) => {
    const ok = window.confirm(`Xóa nhân viên "${emp.fullname || emp.email || emp.id}"?`);
    if (!ok) return;

    try {
      setLoading(true);
      setError("");
      await deleteEmployee(emp.id);
      // cập nhật UI ngay (không cần reload)
      setEmployees((prev) => prev.filter((x) => x.id !== emp.id));
    } catch (e) {
      setError(e?.message || "Xóa nhân viên thất bại");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setKeyword("");
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
          <div className="flex-1 flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
            <span className="material-symbols-outlined text-gray-500">search</span>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="bg-transparent outline-none flex-1"
              placeholder="Tìm theo tên, email, SĐT, ID..."
            />
          </div>

          <button onClick={clearFilters} className="px-4 py-2 rounded-lg bg-gray-100">
            Xóa bộ lọc
          </button>

          <button
            onClick={() => {}}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white"
            title="Hiện đang lọc realtime; nút này để sau nối filter server-side"
          >
            Áp dụng
          </button>
        </div>

        <div className="flex gap-3">
          <FilterSelect label="Phòng ban" />
          <FilterSelect label="Chức vụ" />
          <FilterSelect label="Trạng thái" />
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
              <th className="p-4 text-left">Chức vụ (Role)</th>
              <th className="p-4 text-left">Trạng thái</th>
              <th className="p-4 text-center">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.map((emp) => (
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
                  {emp.fullname || "—"}
                </td>

                <td className="p-4 text-gray-600">{emp.email || "—"}</td>
                <td className="p-4">{emp.phone || "—"}</td>
                <td className="p-4">{emp.role?.name ?? emp.role?.code ?? "—"}</td>

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
                    <ActionIcon icon="visibility" onClick={() => setSelectedEmployee(emp)} />
                    <ActionIcon icon="edit" onClick={() => setSelectedEmployee(emp)} />
                    <ActionIcon icon="delete" danger onClick={() => handleDelete(emp)} />
                  </div>
                </td>
              </tr>
            ))}

            {!loading && filteredEmployees.length === 0 && (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={8}>
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION (fake UI giữ nguyên, chưa nối API) */}
        <div className="flex items-center justify-between p-4 text-sm text-gray-600">
          Hiển thị <b>1-{Math.min(3, filteredEmployees.length)}</b> trên{" "}
          <b>{filteredEmployees.length}</b>

          <div className="flex items-center gap-1">
            <PaginationBtn icon="chevron_left" />
            <PaginationBtn label="1" active />
            <PaginationBtn icon="chevron_right" />
          </div>
        </div>
      </div>

      {/* MODALS */}
      {openAdd && (
        <EmployeeModal
          mode="add"
          onClose={() => setOpenAdd(false)}
          onSaved={() => {
            setOpenAdd(false);
            fetchEmployees(); // ✅ reload list sau khi thêm
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
            fetchEmployees(); // ✅ reload list sau khi sửa
          }}
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
      <span className="material-symbols-outlined text-[18px]">expand_more</span>
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
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </button>
  );
}

function PaginationBtn({ label, icon, active }) {
  return (
    <button
      className={`w-8 h-8 rounded border flex items-center justify-center ${
        active ? "bg-blue-600 text-white border-blue-600" : "bg-white"
      }`}
    >
      {icon ? (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      ) : (
        label
      )}
    </button>
  );
}
