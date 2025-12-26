import React, { useState } from "react";
import CreateScheduleModal from "../components/work-schedule/CreateScheduleModal";

/* ================= MOCK DATA ================= */
const EMPLOYEES = [
  { id: 1, name: "Nguyễn Văn A", code: "NV001" },
  { id: 2, name: "Trần Thị B", code: "NV002" },
  { id: 3, name: "Lê Văn C", code: "NV003" },
];

const INITIAL_DATA = {
  "2023-10-09": [{ employee: "Nguyễn Văn A", type: "hour", label: "08:00 - 17:00" }],
  "2023-10-10": [{ employee: "Trần Thị B", type: "shift", label: "Ca sáng" }],
  "2023-10-12": [{ employee: "Lê Văn C", type: "fixed", label: "Cố định" }],
  // "2023-10-12": [{ employee: "Nguyễn Văn A", type: "shift", label: "Ca chiều" }],
};

/* Helper: Định dạng Date thành YYYY-MM-DD */
const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function WorkSchedule() {
  const [mode, setMode] = useState("calendar"); // calendar | employee
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarData] = useState(INITIAL_DATA);

  // Mặc định tuần bắt đầu từ Chủ Nhật 08/10/2023
  const [weekStartDate, setWeekStartDate] = useState(new Date(2023, 9, 8));

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStartDate);
    day.setDate(weekStartDate.getDate() + i);
    return day;
  });

  const changeWeek = (offset) => {
    const newDate = new Date(weekStartDate);
    newDate.setDate(weekStartDate.getDate() + offset);
    setWeekStartDate(newDate);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const formatHeaderDate = (date) => `${String(date.getDate()).padStart(2, '0')}/${date.getMonth() + 1}`;
  const headerTitle = `${formatHeaderDate(weekDays[0])} - ${formatHeaderDate(weekDays[6])}, ${weekDays[6].getFullYear()}`;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Lịch làm việc</h1>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-medium">
          <span className="material-symbols-outlined text-[20px]">download</span>
          Xuất file
        </button>
      </div>

      {/* FILTER SECTION */}
      <div className="bg-white rounded-xl p-6 border shadow-sm flex gap-4 items-center">
        <div className="flex bg-gray-100 p-1 rounded-lg shrink-0">
          <ModeTab active={mode === "calendar"} onClick={() => setMode("calendar")}>Theo lịch</ModeTab>
          <ModeTab active={mode === "employee"} onClick={() => setMode("employee")}>Theo nhân viên</ModeTab>
        </div>
        <div className="flex-1 flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg border border-transparent focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <span className="material-symbols-outlined text-gray-500">search</span>
          <input className="bg-transparent outline-none flex-1 text-sm" placeholder="Tìm theo tên nhân viên..." />
        </div>
        <FilterSelect label="Phòng ban" />
        <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium shadow-sm">Áp dụng</button>
      </div>

      {/* CALENDAR/EMPLOYEE VIEW */}
      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        {/* Navigation Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            <div className="flex border rounded-lg overflow-hidden">
              <button onClick={() => changeWeek(-7)} className="px-3 py-1.5 hover:bg-gray-50 border-r">‹</button>
              <button onClick={() => changeWeek(7)} className="px-3 py-1.5 hover:bg-gray-50">›</button>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">{headerTitle}</h2>
          </div>
          <div className="flex gap-4">
            <LegendItem color="bg-green-500" label="Theo ca" />
            <LegendItem color="bg-orange-400" label="Theo giờ" />
            <LegendItem color="bg-blue-500" label="Cố định" />
          </div>
        </div>

        {mode === "calendar" ? (
          /* CHẾ ĐỘ XEM THEO LỊCH (Grid 7 ngày) */
          <>
            <div className="grid grid-cols-7 text-center py-3 bg-gray-50 border-b text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((d, i) => (
                <div key={d}>{d} ({String(weekDays[i].getDate()).padStart(2, '0')})</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {weekDays.map((date, i) => {
                const dateKey = formatDateKey(date);
                const events = calendarData[dateKey] || [];
                return (
                  <div key={i} onClick={() => handleDateClick(dateKey)} className="min-h-[200px] p-3 border-r border-gray-100 hover:bg-gray-50/50 cursor-pointer last:border-r-0 group">
                    <div className="text-sm font-bold mb-3 text-gray-400 group-hover:text-blue-600 transition-colors">Ngày {date.getDate()}</div>
                    <div className="space-y-1.5">
                      {events.map((ev, idx) => (
                        <div key={idx} className={`text-[10px] px-2 py-1 rounded-md font-bold border flex items-center gap-1 ${getBadgeStyle(ev.type)}`}>
                          <span className="truncate">{ev.employee.split(' ').pop()}: {ev.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* CHẾ ĐỘ XEM THEO NHÂN VIÊN (Dạng hàng ngang) */
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              {/* Header hàng ngang */}
              <div className="grid grid-cols-[220px_repeat(7,1fr)] bg-gray-50 border-b text-[11px] font-bold text-gray-400 uppercase">
                <div className="p-4 border-r">Nhân viên</div>
                {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((d, i) => (
                  <div key={d} className="p-4 text-center border-r last:border-r-0">
                    {d} ({String(weekDays[i].getDate()).padStart(2, '0')})
                  </div>
                ))}
              </div>
              {/* Body hàng ngang */}
              {EMPLOYEES.map((emp) => (
                <div key={emp.id} className="grid grid-cols-[220px_repeat(7,1fr)] border-b last:border-b-0 hover:bg-gray-50/30 transition-colors">
                  <div className="p-4 border-r flex flex-col justify-center">
                    <div className="font-bold text-gray-800 text-sm">{emp.name}</div>
                    <div className="text-[11px] text-gray-400">{emp.code}</div>
                  </div>
                  {weekDays.map((date, i) => {
                    const dateKey = formatDateKey(date);
                    const empEvents = (calendarData[dateKey] || []).filter(ev => ev.employee === emp.name);
                    return (
                      <div key={i} onClick={() => handleDateClick(dateKey)} className="p-2 border-r last:border-r-0 min-h-[80px] flex flex-col gap-1 cursor-pointer hover:bg-blue-50/20">
                        {empEvents.map((ev, idx) => (
                          <div key={idx} className={`text-[10px] px-2 py-1.5 rounded-lg font-bold border text-center ${getBadgeStyle(ev.type)}`}>
                            {ev.label}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <CreateScheduleModal open={isModalOpen} onClose={() => setIsModalOpen(false)} selectedDate={selectedDate} employees={EMPLOYEES} />
    </div>
  );
}

/* ================= COMPONENT PHỤ ================= */
function FilterSelect({ label }) {
  return (
    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
      {label} <span className="material-symbols-outlined text-[18px]">expand_more</span>
    </button>
  );
}

function ModeTab({ active, children, onClick }) {
  return (
    <button onClick={onClick} className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${active ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
      {children}
    </button>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
      <span className={`w-2.5 h-2.5 rounded-full ${color}`} /> {label}
    </div>
  );
}

const getBadgeStyle = (type) => {
  const map = { 
    shift: "bg-green-50 text-green-700 border-green-100", 
    hour: "bg-orange-50 text-orange-700 border-orange-100", 
    fixed: "bg-blue-50 text-blue-700 border-blue-100" 
  };
  return map[type] || "bg-gray-50 text-gray-700 border-gray-100";
};