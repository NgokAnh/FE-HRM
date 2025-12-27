import { useEffect, useMemo, useState } from "react";
import ShiftModal from "./ShiftModal";
import { getShifts, deleteShift } from "../../api/shiftApi";

export default function Shifts() {
  const [openAdd, setOpenAdd] = useState(false);
  const [modal, setModal] = useState({ open: false, mode: "view", shift: null });

  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ client-side filters
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive

  const fetchShifts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getShifts();
      setShifts(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Không tải được danh sách ca làm việc");
      setShifts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  useEffect(() => {
    document.body.style.overflow = openAdd || modal.open ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [openAdd, modal.open]);

  const clearFilters = () => {
    setKeyword("");
    setStatusFilter("all");
  };

  const filteredShifts = useMemo(() => {
    const k = keyword.trim().toLowerCase();

    return shifts.filter((s) => {
      // status filter
      if (statusFilter === "active" && !s.isActive) return false;
      if (statusFilter === "inactive" && s.isActive) return false;

      // keyword filter
      if (!k) return true;

      const id = String(s.id ?? "").toLowerCase();
      const name = String(s.name ?? "").toLowerCase();
      const desc = String(s.description ?? "").toLowerCase();
      const start = String(normalizeTime(s.startTime) ?? "").toLowerCase();
      const end = String(normalizeTime(s.endTime) ?? "").toLowerCase();
      const color = String(s.colorCode ?? "").toLowerCase();

      return (
        id.includes(k) ||
        name.includes(k) ||
        desc.includes(k) ||
        start.includes(k) ||
        end.includes(k) ||
        color.includes(k)
      );
    });
  }, [shifts, keyword, statusFilter]);

  const handleDelete = async (shift) => {
    const ok = window.confirm(`Xóa ca "${shift.name || shift.id}"?`);
    if (!ok) return;

    try {
      setLoading(true);
      setError("");
      await deleteShift(shift.id);
      setShifts((prev) => prev.filter((x) => x.id !== shift.id));
    } catch (e) {
      setError(e?.message || "Xóa ca thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Ca làm việc</h1>

        <button
          onClick={() => setOpenAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          <span className="material-symbols-outlined">add</span>
          Thêm ca
        </button>
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
              placeholder="Tìm theo tên ca, mô tả, giờ, mã màu, ID..."
            />
          </div>

          <button onClick={clearFilters} className="px-4 py-2 rounded-lg bg-gray-100">
            Xóa bộ lọc
          </button>

          <button
            onClick={() => {}}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white"
            title="Đang lọc realtime (client-side)"
          >
            Áp dụng
          </button>
        </div>

        <div className="flex gap-3">
          <FilterSelect
            label="Trạng thái"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "Tất cả" },
              { value: "active", label: "Đang áp dụng" },
              { value: "inactive", label: "Tạm ngưng" },
            ]}
          />
        </div>
      </div>

      {loading && <div className="text-gray-600">Đang tải...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {/* TABLE */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Tên ca</th>
              <th className="p-4 text-left">Thời gian</th>
              <th className="p-4 text-left">Trạng thái</th>
              <th className="p-4 text-center">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {filteredShifts.map((shift) => (
              <tr
                key={shift.id}
                className="border-t cursor-pointer hover:bg-gray-50"
                onClick={() => setModal({ open: true, mode: "view", shift })}
              >
                <td className="p-4 font-medium">{shift.id}</td>
                <td className="p-4">{shift.name || "—"}</td>
                <td className="p-4">
                  {normalizeTime(shift.startTime)} - {normalizeTime(shift.endTime)}
                </td>
                <td className="p-4">
                  {shift.isActive ? (
                    <span className="px-3 py-1 text-green-700 bg-green-100 rounded-full">
                      Đang áp dụng
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-red-700 bg-red-100 rounded-full">
                      Tạm ngưng
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
                      onClick={() => setModal({ open: true, mode: "view", shift })}
                    />
                    <ActionIcon
                      icon="edit"
                      onClick={() => setModal({ open: true, mode: "edit", shift })}
                    />
                    <ActionIcon icon="delete" danger onClick={() => handleDelete(shift)} />
                  </div>
                </td>
              </tr>
            ))}

            {!loading && filteredShifts.length === 0 && (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={5}>
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* (optional) summary nhỏ */}
        <div className="flex items-center justify-between p-4 text-sm text-gray-600 border-t">
          Hiển thị <b>{filteredShifts.length}</b> / <b>{shifts.length}</b> ca
        </div>
      </div>

      {/* ADD MODAL */}
      {openAdd && (
        <ShiftModal
          mode="add"
          onClose={() => setOpenAdd(false)}
          onSaved={() => {
            setOpenAdd(false);
            fetchShifts();
          }}
        />
      )}

      {/* VIEW/EDIT MODAL */}
      {modal.open && (
        <ShiftModal
          mode={modal.mode}
          shift={modal.shift}
          onClose={() => setModal({ open: false, mode: "view", shift: null })}
          onSaved={() => {
            setModal({ open: false, mode: "view", shift: null });
            fetchShifts();
          }}
          onRequestEdit={() => setModal((m) => ({ ...m, mode: "edit" }))}
        />
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
      <span className="text-sm text-gray-700 font-medium">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="bg-transparent outline-none text-sm"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
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

function normalizeTime(t) {
  if (!t) return "—";
  const s = String(t);
  if (/^\d{2}:\d{2}:\d{2}$/.test(s)) return s.slice(0, 5);
  if (/^\d{2}:\d{2}$/.test(s)) return s;
  return s;
}
