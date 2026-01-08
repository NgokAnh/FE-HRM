// src/pages/EmployeePages/Attendance.jsx
import React from "react";

/* ================= StatsCard ================= */
const StatsCard = ({ icon, label, value, progress, goalColor }) => (
  <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
    <div className="flex items-center gap-2 mb-2">
      <span className={`material-symbols-outlined text-xl ${icon.color}`}>{icon.name}</span>
      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</span>
    </div>
    <div className="flex items-end gap-1">
      <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
      {icon.unit && <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{icon.unit}</span>}
    </div>
    {progress && (
      <>
        <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full mt-3 overflow-hidden">
          <div className={`${goalColor} h-full rounded-full`} style={{ width: progress }}></div>
        </div>
        {icon.goal && <p className="text-xs text-gray-500 mt-2">{icon.goal}</p>}
      </>
    )}
  </div>
);

/* ================= CheckInPulse ================= */
const CheckInPulse = () => (
  <div className="flex flex-col items-center justify-center relative py-6">
    <div className="absolute w-64 h-64 bg-primary/20 rounded-full animate-pulse-ring"></div>
    <div className="absolute w-56 h-56 bg-primary/10 rounded-full"></div>
    <button className="relative z-10 w-48 h-48 rounded-full bg-gradient-to-b from-primary to-blue-700 shadow-xl shadow-primary/30 flex flex-col items-center justify-center text-white border-4 border-white dark:border-surface-dark active:scale-95 transition-transform duration-200 group">
      <span className="material-symbols-outlined text-6xl mb-2 group-hover:scale-110 transition-transform">fingerprint</span>
      <span className="text-xl font-bold uppercase tracking-widest">Check In</span>
      <span className="text-xs font-medium opacity-90 mt-1">Vào ca</span>
    </button>
    <div className="mt-8 flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-surface-dark px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
      <span className="material-symbols-outlined text-green-500 text-base">location_on</span>
      <span>Bạn đang ở văn phòng (WiFi: Office_5G)</span>
    </div>
  </div>
);

/* ================= HistoryItem ================= */
const HistoryItem = ({ date, status, inTime, outTime, total }) => {
  const statusColors = {
    "Đúng giờ": "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    "Đi muộn": "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
  };
  return (
    <div className="p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group cursor-default">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-gray-900 dark:text-white">{date}</span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusColors[status]}`}>{status}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Vào</span>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-green-500 text-sm">login</span>
              <span className={`text-base font-semibold ${status === "Đi muộn" ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>{inTime}</span>
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Ra</span>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-orange-500 text-sm">logout</span>
              <span className="text-base font-semibold text-gray-500 dark:text-gray-400">{outTime}</span>
            </div>
          </div>
        </div>
        <div className="text-right flex flex-col gap-0.5">
          <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Tổng</span>
          <p className="text-sm font-semibold text-primary animate-pulse">{total}</p>
        </div>
      </div>
    </div>
  );
};

/* ================= Attendance Page ================= */
export default function Attendance() {
  const today = "08:30";
  const date = "Thứ Sáu, 25 Tháng 10, 2023";

  const historyData = [
    { date: "Hôm nay, 25/10", status: "Đúng giờ", inTime: "08:25", outTime: "--:--", total: "Đang tính..." },
    { date: "Hôm qua, 24/10", status: "Đúng giờ", inTime: "08:30", outTime: "17:30", total: "8h 00p" },
    { date: "Thứ Tư, 23/10", status: "Đi muộn", inTime: "08:45", outTime: "17:45", total: "8h 00p" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden px-4 sm:px-6 lg:px-8 py-6">
      {/* Giờ & ngày */}
      <div className="flex flex-col items-center justify-center pt-2">
        <h3 className="text-4xl font-bold text-gray-900 dark:text-white">{today}</h3>
        <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">{date}</p>
      </div>

      {/* Check-in pulse */}
      <CheckInPulse />

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatsCard
          icon={{ name: "timer", color: "text-orange-500", unit: "giờ", goal: "Mục tiêu: 176 giờ/tháng" }}
          label="Tổng giờ làm"
          value="168.5"
          progress="85%"
          goalColor="bg-primary"
        />
        <StatsCard
          icon={{ name: "calendar_month", color: "text-orange-500" }}
          label="Công tháng"
          value="22 / 24 ngày"
          progress="91%"
          goalColor="bg-orange-500"
        />
      </div>

      {/* Lịch sử chấm công */}
      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">history</span>
            Lịch sử chấm công
          </h4>
          <button className="text-xs font-bold text-primary hover:underline uppercase tracking-wide">Xem tất cả</button>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {historyData.map((item) => (
            <HistoryItem key={item.date} {...item} />
          ))}
        </div>
      </div>

      <div className="h-10"></div> {/* Spacer for mobile BottomNav */}
    </div>
  );
}