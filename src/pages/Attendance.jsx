import { useState } from "react";
import AttendanceSetting from "./AttendanceSetting";

/* ================= MOCK DATA ================= */

const summaryData = [
  {
    name: "Lê Thị Bích",
    workDays: { days: 20, hours: "160h" },
    offDays: { days: 2, hours: "0h" },
    late: { days: 3, hours: "1h 20m" },
    early: { days: 1, hours: "45m" },
    overtime: { days: 4, hours: "12h" },
  },
  {
    name: "Trần Minh Hoàng",
    workDays: { days: 18, hours: "144h" },
    offDays: { days: 4, hours: "0h" },
    late: { days: 0, hours: "-" },
    early: { days: 2, hours: "1h" },
    overtime: { days: 3, hours: "8h" },
  },
];

const records = [
  {
    id: 1,
    name: "Lê Thị Bích",
    date: "2024-07-26",
    checkIn: "08:00",
    checkOut: "17:05",
    total: "8h 05m",
    status: "valid",
  },
  {
    id: 2,
    name: "Trần Minh Hoàng",
    date: "2024-07-26",
    checkIn: "08:15",
    checkOut: "17:00",
    total: "7h 45m",
    status: "late",
  },
  {
    id: 3,
    name: "Phạm Thùy Dung",
    date: "2024-07-26",
    checkIn: "07:55",
    checkOut: "16:45",
    total: "7h 50m",
    status: "early",
  },
  {
    id: 4,
    name: "Vũ Tiến Dũng",
    date: "2024-07-26",
    checkIn: "-",
    checkOut: "-",
    total: "0h 0m",
    status: "absent",
  },
  {
    id: 5,
    name: "Đặng Mai Anh",
    date: "2024-07-26",
    checkIn: "08:02",
    checkOut: "17:01",
    total: "7h 59m",
    status: "pending",
  },
];

/* ================= PAGE ================= */

export default function Attendance() {
  const [view, setView] = useState("day"); // day | week | month

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Bảng Chấm Công</h1>
        </div>

        <AttendanceSetting />
      </div>

      {/* FILTER */}
      <div className="bg-white p-6 rounded-xl border space-y-4">
        <div className="flex flex-wrap gap-3">
          <FilterButton active={view === "day"} icon="today" onClick={() => setView("day")}>
            Hôm nay
          </FilterButton>
          <FilterButton active={view === "week"} icon="date_range" onClick={() => setView("week")}>
            Tuần này
          </FilterButton>
          <FilterButton active={view === "month"} icon="calendar_month" onClick={() => setView("month")}>
            Tháng này
          </FilterButton>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg flex-1">
            <span className="material-symbols-outlined text-gray-500">search</span>
            <input
              className="bg-transparent outline-none flex-1"
              placeholder="Tìm nhân viên..."
            />
          </div>

          <button className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2">
            <span className="material-symbols-outlined">check</span>
            Duyệt mục đã chọn
          </button>
        </div>
      </div>

      {/* TABLE */}
      {view === "day" && <DailyAttendanceTable />}
      {view !== "day" && <SummaryAttendanceTable data={summaryData} />}

      {/* PAGINATION */}
      <div className="flex items-center justify-between p-4 text-sm text-gray-600 bg-white border rounded-xl">
        Hiển thị <b>1-5</b> trên <b>20</b> kết quả
        <div className="flex gap-2">
          <PaginationBtn icon="chevron_left" />
          <PaginationBtn icon="chevron_right" />
        </div>
      </div>
    </div>
  );
}

/* ================= TABLES ================= */

function DailyAttendanceTable() {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-4 text-left">Nhân viên</th>
            <th className="p-4 text-left">Ngày</th>
            <th className="p-4 text-center">Giờ vào</th>
            <th className="p-4 text-center">Giờ ra</th>
            <th className="p-4 text-center">Tổng giờ</th>
            <th className="p-4 text-center">Trạng thái</th>
            <th className="p-4 text-center"></th>
          </tr>
        </thead>

        <tbody>
          {records.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-4 font-medium">{r.name}</td>
              <td className="p-4">{r.date}</td>
              <td className="p-4 text-center">{r.checkIn}</td>
              <td className="p-4 text-center">{r.checkOut}</td>
              <td className="p-4 text-center">{r.total}</td>
              <td className="p-4 text-center">
                <StatusBadge status={r.status} />
              </td>
              <td className="p-4 text-center">
                <ActionIcon icon="edit" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SummaryAttendanceTable({ data }) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-4 text-left">Nhân viên</th>
            <th className="p-4 text-center">Đi làm</th>
            <th className="p-4 text-center">Nghỉ làm</th>
            <th className="p-4 text-center">Đi muộn</th>
            <th className="p-4 text-center">Về sớm</th>
            <th className="p-4 text-center">Làm thêm</th>
          </tr>
        </thead>

        <tbody>
          {data.map((emp, i) => (
            <tr key={i} className="border-t">
              <td className="p-4 font-medium">{emp.name}</td>
              <SummaryCell {...emp.workDays} />
              <SummaryCell {...emp.offDays} />
              <SummaryCell {...emp.late} />
              <SummaryCell {...emp.early} />
              <SummaryCell {...emp.overtime} highlight />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SummaryCell({ days, hours, highlight }) {
  return (
    <td className="p-4 text-center">
      <div className={`font-medium ${highlight ? "text-blue-600" : ""}`}>
        {days} ngày
      </div>
      <div className="text-xs text-gray-500">{hours}</div>
    </td>
  );
}

/* ================= UI ================= */

function FilterButton({ children, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border
        ${
          active
            ? "bg-blue-50 border-blue-600 text-blue-600"
            : "bg-gray-50 hover:bg-gray-100"
        }`}
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      {children}
    </button>
  );
}

function StatusBadge({ status }) {
  const map = {
    valid: "bg-green-100 text-green-700",
    late: "bg-yellow-100 text-yellow-700",
    early: "bg-yellow-100 text-yellow-700",
    absent: "bg-red-100 text-red-700",
    pending: "bg-blue-100 text-blue-700",
  };

  const label = {
    valid: "Đúng giờ",
    late: "Đi trễ",
    early: "Về sớm",
    absent: "Vắng mặt",
    pending: "Chờ duyệt",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${map[status]}`}>
      {label[status]}
    </span>
  );
}

function ActionIcon({ icon }) {
  return (
    <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </button>
  );
}

function PaginationBtn({ icon }) {
  return (
    <button className="w-9 h-9 border rounded-lg flex items-center justify-center hover:bg-gray-100">
      <span className="material-symbols-outlined">{icon}</span>
    </button>
  );
}