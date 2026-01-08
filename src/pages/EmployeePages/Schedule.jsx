import React, { useState } from "react";
import { createPortal } from "react-dom";

// Modal chi tiết ca
function ShiftModal({ isOpen, onClose, shift }) {
  if (!isOpen || !shift) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl max-w-sm w-full shadow-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-500 dark:text-gray-400 hover:text-gray-700"
          onClick={onClose}
        >
          ✕
        </button>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{shift.title}</h3>
        <div className="flex gap-3 mb-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              shift.type === "office"
                ? "bg-green-100 text-green-700"
                : shift.type === "ot"
                ? "bg-purple-100 text-purple-700"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {shift.type === "office"
              ? "Hành Chính"
              : shift.type === "ot"
              ? "Tăng ca"
              : "Nghỉ"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <div>
            <div className="font-medium">Bắt đầu</div>
            <div className="text-gray-900 dark:text-white">{shift.start}</div>
          </div>
          <div>
            <div className="font-medium">Kết thúc</div>
            <div className="text-gray-900 dark:text-white">{shift.end}</div>
          </div>
          <div>
            <div className="font-medium">Tổng thời gian</div>
            <div className="text-gray-900 dark:text-white">{shift.total || "8h"}</div>
          </div>
          <div>
            <div className="font-medium">Check-in</div>
            <div className="text-gray-900 dark:text-white">{shift.checkIn || "Chưa check-in"}</div>
          </div>
          <div className="col-span-2">
            <div className="font-medium">Địa điểm</div>
            <div className="text-gray-900 dark:text-white">{shift.location}</div>
          </div>
          {shift.note && (
            <div className="col-span-2">
              <div className="font-medium">Ghi chú</div>
              <div className="text-gray-900 dark:text-white">{shift.note}</div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

// Sample data
const shiftsToday = [
  {
    id: 1,
    title: "Ca Hành Chính",
    start: "08:00",
    end: "17:00",
    total: "8h",
    location: "Văn phòng chính",
    type: "office",
    checkIn: "08:05",
    note: "Đang họp với team marketing",
  },
  {
    id: 2,
    title: "Họp Team Online",
    start: "17:30",
    end: "18:30",
    total: "1h",
    location: "Google Meet",
    type: "ot",
    checkIn: null,
    note: "",
  },
];

const weekShifts = [
  {
    name: "Hành Chính",
    slots: [
      { day: "T2", type: "office" },
      { day: "T3", type: "office" },
      { day: "T4", type: "office" },
      { day: "T5", type: "office" },
      { day: "T6", type: "off" },
      { day: "T7", type: "off" },
      { day: "CN", type: "off" },
    ],
  },
  {
    name: "Ca Sáng",
    slots: [
      { day: "T2", type: "off" },
      { day: "T3", type: "off" },
      { day: "T4", type: "ot" },
      { day: "T5", type: "office" },
      { day: "T6", type: "off" },
      { day: "T7", type: "office" },
      { day: "CN", type: "off" },
    ],
  },
  {
    name: "Tăng ca",
    slots: [
      { day: "T2", type: "off" },
      { day: "T3", type: "ot" },
      { day: "T4", type: "off" },
      { day: "T5", type: "office" },
      { day: "T6", type: "off" },
      { day: "T7", type: "off" },
      { day: "CN", type: "off" },
    ],
  },
];

const dayColors = {
  office: "text-green-500",
  ot: "text-purple-500",
  off: "text-gray-300",
};

export default function Schedule() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);

  const handleDotClick = (shift) => {
    setSelectedShift({
      ...shift,
      total: shift.total || "8h",
      note: shift.note || "",
    });
    setModalOpen(true);
  };

  return (
    <div className="p-4 flex flex-col gap-6">
      {/* Daily Schedule */}
      <div>
        <h2 className="text-lg font-bold mb-2">Hôm nay, 05/10</h2>
        {shiftsToday.map((shift) => (
          <div key={shift.id} className="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-soft mb-4 relative">
            <div className="absolute top-4 right-4">
              <span className={`flex h-3 w-3 relative`}>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </div>
            <div className="flex flex-col mb-3">
              <span className="text-xs font-bold tracking-wide text-gray-400 uppercase">Ca làm việc</span>
              <h3 className="text-xl font-bold">{shift.title}</h3>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
                <span>{shift.location}</span>
              </div>
            </div>
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-4">
              <div className="text-center px-2">
                <div className="text-xs text-gray-400 font-medium mb-0.5">Bắt đầu</div>
                <div className="text-lg font-bold">{shift.start}</div>
              </div>
              <div className="h-8 w-px bg-gray-200 dark:bg-gray-600"></div>
              <div className="text-center px-2">
                <div className="text-xs text-gray-400 font-medium mb-0.5">Kết thúc</div>
                <div className="text-lg font-bold">{shift.end}</div>
              </div>
              <div className="h-8 w-px bg-gray-200 dark:bg-gray-600"></div>
              <div className="text-center px-2">
                <div className="text-xs text-gray-400 font-medium mb-0.5">Tổng</div>
                <div className="text-lg font-bold text-primary">{shift.total}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">fingerprint</span>
                Check-in
              </button>
              <button
                className="w-12 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-600 text-gray-500"
                onClick={() => handleDotClick(shift)}
              >
                <span className="material-symbols-outlined">more_vert</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Schedule */}
      <div>
        <h2 className="text-lg font-bold mb-2">Lịch theo tuần</h2>
        <div className="overflow-x-auto">
          <div className="min-w-[600px] bg-white dark:bg-surface-dark rounded-2xl shadow-soft">
            {/* Header */}
            <div className="grid grid-cols-[120px_repeat(7,1fr)] bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              <div className="p-2 flex items-center justify-center border-r border-gray-100 dark:border-gray-800">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Ca</span>
              </div>
              {["T2","T3","T4","T5","T6","T7","CN"].map((d, i) => (
                <div key={d} className="py-2 flex flex-col items-center justify-center gap-0.5 relative">
                  <span className="text-[10px] font-medium text-gray-400">{d}</span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {("0"+(i+2)).slice(-2)}
                  </span>
                  {i === 3 && (
                    <span className="absolute top-0 w-full h-0.5 bg-primary"></span>
                  )}
                </div>
              ))}
            </div>

            {/* Rows */}
            {weekShifts.map((shiftRow) => (
              <div
                key={shiftRow.name}
                className="grid grid-cols-[120px_repeat(7,1fr)] border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50/50 transition-colors"
              >
                <div className="p-2 flex items-center border-r border-gray-100 dark:border-gray-800">
                  <span className="text-[11px] font-bold text-gray-700 dark:text-gray-200 leading-tight">{shiftRow.name}</span>
                </div>
                {shiftRow.slots.map((slot, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-center border-r border-gray-50 dark:border-gray-800/50 relative cursor-pointer group"
                    onClick={() =>
                      handleDotClick({
                        title: shiftRow.name,
                        start: "08:00",
                        end: "17:00",
                        total: "8h",
                        location: "Văn phòng",
                        type: slot.type,
                        note: slot.note || "",
                      })
                    }
                  >
                    {slot.type !== "off" ? (
                      <span
                        className={`material-symbols-outlined ${dayColors[slot.type]} text-[18px]`}
                      >
                        check_circle
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-gray-300 text-[18px]">
                        radio_button_unchecked
                      </span>
                    )}
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:flex bg-gray-900 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                      {slot.type === "office"
                        ? "Hành Chính"
                        : slot.type === "ot"
                        ? "Tăng ca"
                        : "Nghỉ"}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 justify-center">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-green-500 text-[16px]">check_circle</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Đi làm</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-[16px]">radio_button_unchecked</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Nghỉ</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-orange-400 text-[16px]">check_circle</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Làm bù</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-purple-500 text-[16px]">check_circle</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">OT</span>
        </div>
      </div>

      <ShiftModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        shift={selectedShift}
      />
    </div>
  );
}