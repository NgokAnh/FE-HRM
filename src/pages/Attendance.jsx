import axios from "axios";

import React, { useState, useEffect } from "react";
import AttendanceSetting from "./AttendanceSetting";
import { updateCheckIn, updateCheckOut } from "../api/attendanceApi";
import { getActiveShifts } from "../api/shiftApi";
import { getWorkSchedulesByDate, getWorkSchedulesByShiftAndDateRange, getWorkSchedulesByEmployeeAndDateRange, getWeeklySchedulesByShift } from "../api/workScheduleApi";
import { getAttendanceByWorkSchedule, getWeeklyAttendanceSummary } from "../api/attendanceApi";
import { getActiveEmployees } from "../api/employeeApi";



/* ================= PAGE ================= */

// Helper functions for week calculation
function getWeekDates(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(d.setDate(diff));

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
}

function getWeekInfo(date) {
  const d = new Date(date);
  const firstDayOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
  const firstMonday = new Date(firstDayOfMonth);
  const dayOfWeek = firstDayOfMonth.getDay();
  firstMonday.setDate(firstDayOfMonth.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  const weekNumber = Math.ceil((d - firstMonday) / (7 * 24 * 60 * 60 * 1000)) + 1;
  return {
    weekNumber,
    month: d.getMonth() + 1,
    year: d.getFullYear()
  };
}

// Helper functions for month calculation
function getMonthRange(year, month) {
  // month is 0-indexed (0 = January, 11 = December)
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  return {
    startDate: firstDay.toISOString().split('T')[0],
    endDate: lastDay.toISOString().split('T')[0],
    month: month + 1,
    year
  };
}

function getMonthInfo(dateString) {
  const d = new Date(dateString);
  return {
    month: d.getMonth() + 1,
    year: d.getFullYear()
  };
}

export default function Attendance() {
  const [view, setView] = useState("day"); // day | week | month
  const [weekViewMode, setWeekViewMode] = useState("byEmployee"); // byEmployee | byShift
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  });
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const today = new Date();
    return getWeekDates(today.toISOString().split('T')[0]);
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return getMonthRange(today.getFullYear(), today.getMonth());
  });

  const navigateWeek = (direction) => {
    const currentMonday = new Date(selectedWeek[0]);
    currentMonday.setDate(currentMonday.getDate() + (direction * 7));
    setSelectedWeek(getWeekDates(currentMonday.toISOString().split('T')[0]));
  };

  const selectWeekByDate = (dateString) => {
    setSelectedWeek(getWeekDates(dateString));
  };

  const navigateMonth = (direction) => {
    const currentDate = new Date(selectedMonth.year, selectedMonth.month - 1, 1);
    currentDate.setMonth(currentDate.getMonth() + direction);
    setSelectedMonth(getMonthRange(currentDate.getFullYear(), currentDate.getMonth()));
  };

  const selectMonthByDate = (dateString) => {
    const d = new Date(dateString);
    setSelectedMonth(getMonthRange(d.getFullYear(), d.getMonth()));
  };

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
            Theo ngày
          </FilterButton>
          <FilterButton active={view === "week"} icon="date_range" onClick={() => setView("week")}>
            Tuần này
          </FilterButton>
          <FilterButton active={view === "month"} icon="calendar_month" onClick={() => setView("month")}>
            Tháng này
          </FilterButton>

          {/* Date Picker - chỉ hiện khi view === "day" */}
          {view === "day" && (
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg border">
              <span className="material-symbols-outlined text-gray-500 text-[18px]">calendar_today</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent outline-none text-sm"
              />
            </div>
          )}

          {/* Week View Mode Toggle - chỉ hiện khi view === "week" */}
          {view === "week" && (
            <>
              <WeekPicker
                selectedWeek={selectedWeek}
                onNavigate={navigateWeek}
                onSelectDate={selectWeekByDate}
              />
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setWeekViewMode("byEmployee")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${weekViewMode === "byEmployee"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  Xem theo nhân viên
                </button>
                <button
                  onClick={() => setWeekViewMode("byShift")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${weekViewMode === "byShift"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  Xem theo ca
                </button>
              </div>
            </>
          )}

          {/* Month Picker - chỉ hiện khi view === "month" */}
          {view === "month" && (
            <MonthPicker
              selectedMonth={selectedMonth}
              onNavigate={navigateMonth}
              onSelectDate={selectMonthByDate}
            />
          )}
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
      {view === "day" && <DailyAttendanceTable selectedDate={selectedDate} />}
      {view === "week" && weekViewMode === "byEmployee" && <SummaryAttendanceTable selectedWeek={selectedWeek} />}
      {view === "week" && weekViewMode === "byShift" && <WeekByShiftTable selectedWeek={selectedWeek} />}
      {view === "month" && <MonthAttendanceTable selectedMonth={selectedMonth} />}

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

function MonthPicker({ selectedMonth, onNavigate, onSelectDate }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];

  return (
    <div className="relative flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg border">
      <button
        onClick={() => onNavigate(-1)}
        className="hover:bg-gray-200 rounded p-1"
      >
        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
      </button>

      <button
        onClick={() => setShowCalendar(!showCalendar)}
        className="text-sm font-medium hover:text-blue-600 px-2 min-w-[120px]"
      >
        {monthNames[selectedMonth.month - 1]} {selectedMonth.year}
      </button>

      <button
        onClick={() => onNavigate(1)}
        className="hover:bg-gray-200 rounded p-1"
      >
        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
      </button>

      {showCalendar && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowCalendar(false)}
          />
          <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg p-4 z-20">
            <input
              type="month"
              value={`${selectedMonth.year}-${String(selectedMonth.month).padStart(2, '0')}`}
              onChange={(e) => {
                onSelectDate(e.target.value + '-01');
                setShowCalendar(false);
              }}
              className="border rounded px-3 py-2 text-sm"
            />
          </div>
        </>
      )}
    </div>
  );
}

function WeekPicker({ selectedWeek, onNavigate, onSelectDate }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const weekInfo = getWeekInfo(selectedWeek[0]);
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="relative flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg border">
      <button
        onClick={() => onNavigate(-1)}
        className="hover:bg-gray-200 rounded p-1"
      >
        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
      </button>

      <button
        onClick={() => setShowCalendar(!showCalendar)}
        className="text-sm font-medium hover:text-blue-600 px-2"
      >
        Tuần {weekInfo.weekNumber} - Th. {weekInfo.month}/{weekInfo.year}
      </button>

      <button
        onClick={() => onNavigate(1)}
        className="hover:bg-gray-200 rounded p-1"
      >
        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
      </button>

      {showCalendar && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowCalendar(false)}
          />
          <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg p-4 z-20">
            <input
              type="date"
              value={today}
              onChange={(e) => {
                onSelectDate(e.target.value);
                setShowCalendar(false);
              }}
              className="border rounded px-3 py-2 text-sm"
            />
          </div>
        </>
      )}
    </div>
  );
}

function WeekByShiftTable({ selectedWeek }) {
  const [shifts, setShifts] = useState([]);
  const [shiftSchedules, setShiftSchedules] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const today = new Date().toISOString().split('T')[0];

  const dayNames = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const startDate = selectedWeek[0];
        const endDate = selectedWeek[6];

        console.log('📅 [API V2] Fetching weekly shift schedules:', { startDate, endDate });

        // 🆕 USE NEW API V2: Single call instead of 206 calls
        const data = await getWeeklySchedulesByShift(startDate, endDate);

        console.log('✅ [API V2] Shift schedules received:', {
          shiftCount: data?.shifts?.length || 0,
          dateRange: `${data?.startDate} ~ ${data?.endDate}`
        });

        // Transform API v2 response to match UI format
        const shiftsData = data.shifts.map(item => item.shift);
        setShifts(shiftsData);

        // Convert to shiftSchedules map: { [shiftId]: { shift, dailySchedules } }
        const shiftSchedulesMap = {};
        data.shifts.forEach(item => {
          shiftSchedulesMap[item.shift.id] = {
            shift: item.shift,
            dailySchedules: item.dailySchedules
          };
        });
        setShiftSchedules(shiftSchedulesMap);

      } catch (err) {
        console.error("❌ Error fetching weekly shift schedules:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedWeek]);


  if (loading) {
    return (
      <div className="bg-white rounded-xl border p-8 text-center">
        <div className="text-gray-500">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border p-8 text-center">
        <div className="text-red-500">Lỗi: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-4 text-left border-r">Ca làm việc</th>
            {selectedWeek.map((date, index) => {
              const dayNum = new Date(date).getDate();
              const isToday = date === today;
              return (
                <th
                  key={date}
                  className={`p-4 text-center ${isToday ? 'bg-blue-50' : ''}`}
                >
                  <div className="space-y-1">
                    <div className={`font-medium ${isToday ? 'text-blue-600' : ''}`}>
                      {dayNames[index]}
                    </div>
                    <div className={`text-xs ${isToday ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                      {dayNum}
                    </div>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {shifts.map((shift) => (
            <tr key={shift.id} className="border-t align-top">
              {/* Column 1: Shift Info */}
              <td className="p-4 border-r bg-gray-50">
                <div className="space-y-1">
                  <div className="font-semibold text-base">{shift.name}</div>
                  <div className="text-gray-600 text-xs">
                    {shift.startTime} - {shift.endTime}
                  </div>
                </div>
              </td>

              {/* Columns 2-8: Daily schedules */}
              {selectedWeek.map((date) => {
                const shiftData = shiftSchedules[shift.id];
                const dailySchedule = shiftData?.dailySchedules?.find(
                  (ds) => ds.date === date
                );

                return (
                  <td key={date} className="p-2 align-top">
                    <div className="flex flex-col gap-2">
                      {dailySchedule?.schedules?.length > 0 ? (
                        dailySchedule.schedules.map((schedule) => (
                          <WeekEmployeeBox
                            key={schedule.id}
                            schedule={schedule}
                            shift={shift}
                          />
                        ))
                      ) : (
                        <div className="text-gray-300 text-xs text-center py-2">-</div>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


function WeekEmployeeBox({ schedule, shift, onSave }) {
  const { employee, attendance } = schedule;
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({
    checkIn: attendance?.checkIn || "",
    checkOut: attendance?.checkOut || "",
    status: attendance?.status || "valid",
  });

  const handleChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  // Chuyển datetime-local sang ISO UTC
  const localToUTC = (localStr) => localStr ? new Date(localStr).toISOString() : null;

  const handleSave = async () => {
    setLoading(true);
    try {
      const scheduleId = schedule.id;
      let updatedAttendance = { ...attendance };

      if (editData.checkIn) {
        updatedAttendance = await updateCheckIn(
          scheduleId,
          localToUTC(editData.checkIn),
          !!attendance?.checkIn // PUT nếu đã có check-in
        );
      }

      if (editData.checkOut) {
        updatedAttendance = await updateCheckOut(
          scheduleId,
          localToUTC(editData.checkOut),
          !!attendance?.checkOut // PUT nếu đã có check-out
        );
      }

      setEditData({
        checkIn: updatedAttendance.checkIn,
        checkOut: updatedAttendance.checkOut,
        status: updatedAttendance.status,
      });
      setIsEditing(false);

      // Callback cho component cha cập nhật state
      if (onSave) onSave(employee.id, updatedAttendance);

    } catch (err) {
      console.error("❌ Lỗi khi cập nhật check-in/out:", err);
      alert(err.response?.data?.message || "Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      checkIn: attendance?.checkIn || "",
      checkOut: attendance?.checkOut || "",
      status: attendance?.status || "valid",
    });
    setIsEditing(false);
  };

  const formatTimeForInput = (instant) => {
    if (!instant) return "";
    const d = new Date(instant);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  };

  const formatTimeDisplay = (instant) => {
    if (!instant) return "--";
    return new Date(instant).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className="border rounded-lg p-3 min-w-[200px] bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
      style={{ borderLeftWidth: '4px', borderLeftColor: shift.colorCode || '#3B82F6' }}
      onClick={() => !isEditing && setIsEditing(true)}
    >
      <div className="font-medium text-sm mb-2">{employee.fullname}</div>

      {isEditing ? (
        <div className="space-y-2 text-xs">
          <div className="flex flex-col">
            <label>Check-in:</label>
            <input
              type="datetime-local"
              value={formatTimeForInput(editData.checkIn)}
              onChange={e => handleChange('checkIn', e.target.value)}
              className="border px-2 py-1 rounded text-sm"
              disabled={loading}
            />
          </div>
          <div className="flex flex-col">
            <label>Check-out:</label>
            <input
              type="datetime-local"
              value={formatTimeForInput(editData.checkOut)}
              onChange={e => handleChange('checkOut', e.target.value)}
              className="border px-2 py-1 rounded text-sm"
              disabled={loading}
            />
          </div>
          <div className="flex gap-2 mt-1">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-2 py-1 bg-blue-600 text-white rounded text-xs disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs"
            >
              Hủy
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Check-in:</span>
            <span className="font-medium">{formatTimeDisplay(editData.checkIn)}</span>
          </div>
          <div className="flex justify-between">
            <span>Check-out:</span>
            <span className="font-medium">{formatTimeDisplay(editData.checkOut)}</span>
          </div>
          <div className="flex justify-between">
            <span>Trạng thái:</span>
            <span className="text-gray-400 italic">{editData.status || "--"}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function EmployeeAttendanceBox({ schedule, shift }) {
  const { employee, attendance } = schedule;
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    checkIn: attendance?.checkIn || "",
    checkOut: attendance?.checkOut || "",
    status: attendance?.status || "valid",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const localToUTC = (localStr) => localStr ? new Date(localStr).toISOString() : null;

  const handleSave = async () => {
    setLoading(true);
    try {
      const scheduleId = schedule.id;
      let updatedAttendance = { ...attendance };

      if (editData.checkIn) {
        updatedAttendance = await updateCheckIn(
          scheduleId,
          localToUTC(editData.checkIn),
          !!attendance?.checkIn // PUT nếu đã check-in, POST nếu chưa
        );
      }

      if (editData.checkOut) {
        updatedAttendance = await updateCheckOut(
          scheduleId,
          localToUTC(editData.checkOut),
          !!attendance?.checkOut // PUT nếu đã check-out, POST nếu chưa
        );
      }

      setEditData({
        checkIn: updatedAttendance.checkIn,
        checkOut: updatedAttendance.checkOut,
        status: updatedAttendance.status,
      });
      setIsEditing(false);
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật check-in/out:", err);
      alert("Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      checkIn: attendance?.checkIn || "",
      checkOut: attendance?.checkOut || "",
      status: attendance?.status || "valid",
    });
    setIsEditing(false);
  };

  const formatTimeForInput = (instant) => {
    if (!instant) return "";
    const d = new Date(instant);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  };

  const formatTimeDisplay = (instant) => {
    if (!instant) return "--";
    return new Date(instant).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className="border rounded-lg p-3 min-w-[200px] bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
      style={{ borderLeftWidth: '4px', borderLeftColor: shift.colorCode || '#3B82F6' }}
      onClick={() => !isEditing && setIsEditing(true)}
    >
      <div className="font-medium text-sm mb-2">{employee.fullname}</div>

      {isEditing ? (
        <div className="space-y-2 text-xs">
          <div className="flex flex-col">
            <label>Check-in:</label>
            <input
              type="datetime-local"
              value={formatTimeForInput(editData.checkIn)}
              onChange={e => handleChange('checkIn', e.target.value)}
              className="border px-2 py-1 rounded text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label>Check-out:</label>
            <input
              type="datetime-local"
              value={formatTimeForInput(editData.checkOut)}
              onChange={e => handleChange('checkOut', e.target.value)}
              className="border px-2 py-1 rounded text-sm"
            />
          </div>
          <div className="flex gap-2 mt-1">
            <button onClick={handleSave} disabled={loading} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
            <button onClick={handleCancel} className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs">Hủy</button>
          </div>
        </div>
      ) : (
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex justify-between"><span>Check-in:</span><span className="font-medium">{formatTimeDisplay(editData.checkIn)}</span></div>
          <div className="flex justify-between"><span>Check-out:</span><span className="font-medium">{formatTimeDisplay(editData.checkOut)}</span></div>
          <div className="flex justify-between"><span>Trạng thái:</span><span className="text-gray-400 italic">{editData.status || "--"}</span></div>
        </div>
      )}
    </div>
  );
}

function DailyAttendanceTable({ selectedDate }) {
  const [shifts, setShifts] = useState([]);
  const [schedulesByShift, setSchedulesByShift] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        console.log('📅 [API V2] Fetching daily schedules:', { date: selectedDate });

        // 🆕 USE API V2: Single call với startDate = endDate
        const data = await getWeeklySchedulesByShift(selectedDate, selectedDate);

        console.log('✅ [API V2] Daily schedules received:', {
          shiftCount: data?.shifts?.length || 0,
          date: selectedDate
        });

        // Extract shifts
        const shiftsData = data.shifts.map(item => item.shift);
        setShifts(shiftsData);

        // Group schedules by shift ID
        const grouped = {};
        data.shifts.forEach(shiftData => {
          // Get schedules for the selected date only (should be only 1 day)
          const dailySchedule = shiftData.dailySchedules.find(ds => ds.date === selectedDate);
          grouped[shiftData.shift.id] = dailySchedule ? dailySchedule.schedules : [];
        });

        setSchedulesByShift(grouped);

      } catch (err) {
        console.error("❌ Error fetching daily schedules:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedDate]);

  

  if (loading) {
    return (
      <div className="bg-white rounded-xl border p-8 text-center">
        <div className="text-gray-500">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border p-8 text-center">
        <div className="text-red-500">Lỗi: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-4 text-left" style={{ width: '20%' }}>Ca làm việc</th>
            <th className="p-4 text-left" style={{ width: '80%' }}>Ngày làm việc</th>
          </tr>
        </thead>

        <tbody>
          {shifts.map((shift) => (
            <tr key={shift.id} className="border-t align-top">
              {/* Column 1: Shift Info */}
              <td className="p-4">
                <div className="space-y-1">
                  <div className="font-semibold text-base">{shift.name}</div>
                  <div className="text-gray-600">
                    {shift.startTime} - {shift.endTime}
                  </div>
                  {shift.description && (
                    <div className="text-xs text-gray-500">{shift.description}</div>
                  )}
                </div>
              </td>

              {/* Column 2: Employee Attendance Boxes */}
              <td className="p-4">
                <div className="flex flex-wrap gap-3">
                  {schedulesByShift[shift.id]?.length > 0 ? (
                    schedulesByShift[shift.id].map((schedule) => (
                      <EmployeeAttendanceBox
                        key={schedule.id}
                        schedule={schedule}
                        shift={shift}
                      />
                    ))
                  ) : (
                    <div className="text-gray-400 text-sm italic">Chưa có nhân viên được phân công</div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SummaryAttendanceTable({ selectedWeek }) {
  const [employees, setEmployees] = useState([]);
  const [employeeStats, setEmployeeStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const startDate = selectedWeek[0];
        const endDate = selectedWeek[6];

        console.log('📅 [API V2] Fetching weekly summary:', { startDate, endDate });

        // 🆕 USE NEW API V2: Single call instead of 751 calls
        const summaryData = await getWeeklyAttendanceSummary(startDate, endDate);

        console.log('✅ [API V2] Received data:', {
          employeeCount: summaryData?.employees?.length || 0,
          dateRange: `${summaryData?.startDate} ~ ${summaryData?.endDate}`
        });

        // Transform API v2 response to match UI format
        const formatMinutesToHours = (minutes) => {
          if (minutes === 0) return "0h";
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          if (mins === 0) return `${hours}h`;
          return `${hours}h ${mins}m`;
        };

        const stats = summaryData.employees.map(item => ({
          employee: item.employee,
          noData: item.statistics.totalScheduled === 0,
          workShifts: {
            count: item.statistics.worked.count,
            hours: item.statistics.worked.totalHours > 0
              ? `${item.statistics.worked.totalHours.toFixed(0)}h`
              : "0h"
          },
          offShifts: {
            count: item.statistics.absent.count,
            hours: item.statistics.absent.totalHours > 0
              ? `${item.statistics.absent.totalHours.toFixed(0)}h`
              : "0h"
          },
          late: {
            count: item.statistics.late.count,
            hours: formatMinutesToHours(item.statistics.late.totalMinutes)
          },
          early: {
            count: item.statistics.earlyLeave.count,
            hours: formatMinutesToHours(item.statistics.earlyLeave.totalMinutes)
          },
          overtime: {
            count: item.statistics.overtime.count,
            hours: formatMinutesToHours(item.statistics.overtime.totalMinutes)
          }
        }));

        setEmployeeStats(stats);

      } catch (err) {
        console.error("❌ Error fetching weekly summary:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (selectedWeek && selectedWeek.length === 7) {
      fetchData();
    }
  }, [selectedWeek]);


  if (loading) {
    return (
      <div className="bg-white rounded-xl border p-8 text-center">
        <div className="text-gray-500">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border p-8 text-center">
        <div className="text-red-500">Lỗi: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-4 text-left">Nhân viên</th>
            <th className="p-4 text-center">Đi làm</th>
            <th className="p-4 text-center">Nghỉ làm</th>
            <th className="p-4 text-center">Đi muộn / Về sớm</th>
            <th className="p-4 text-center">Làm thêm</th>
          </tr>
        </thead>

        <tbody>
          {employeeStats.map((stat, i) => {
            if (stat.noData) {
              return (
                <tr key={i} className="border-t">
                  <td className="p-4 font-medium">{stat.employee.fullname}</td>
                  <td colSpan="4" className="p-4 text-center text-gray-400 italic">
                    Nhân viên chưa có dữ liệu chấm công
                  </td>
                </tr>
              );
            }

            return (
              <tr key={i} className="border-t">
                <td className="p-4 font-medium">{stat.employee.fullname}</td>
                <SummaryCell days={stat.workShifts.count} hours={stat.workShifts.hours} />
                <SummaryCell days={stat.offShifts.count} hours={stat.offShifts.hours} />
                <SummaryCellCombined
                  late={{ days: stat.late.count, hours: stat.late.hours }}
                  early={{ days: stat.early.count, hours: stat.early.hours }}
                />
                <SummaryCell days={stat.overtime.count} hours={stat.overtime.hours} highlight />
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MonthAttendanceTable({ selectedMonth }) {
  const [employees, setEmployees] = useState([]);
  const [employeeStats, setEmployeeStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const startDate = selectedMonth.startDate;
        const endDate = selectedMonth.endDate;

        console.log('📅 [API V2] Fetching month summary:', { startDate, endDate });

        // 🆕 USE API V2: Single call for entire month
        const summaryData = await getWeeklyAttendanceSummary(startDate, endDate);

        console.log('✅ [API V2] Month data received:', {
          employeeCount: summaryData?.employees?.length || 0,
          dateRange: `${summaryData?.startDate} ~ ${summaryData?.endDate}`
        });

        // Transform API v2 response to match UI format
        const formatMinutesToHours = (minutes) => {
          if (minutes === 0) return "0h";
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          if (mins === 0) return `${hours}h`;
          return `${hours}h ${mins}m`;
        };

        const stats = summaryData.employees.map(item => ({
          employee: item.employee,
          noData: item.statistics.totalScheduled === 0,
          workShifts: {
            count: item.statistics.worked.count,
            hours: item.statistics.worked.totalHours > 0
              ? `${item.statistics.worked.totalHours.toFixed(0)}h`
              : "0h"
          },
          offShifts: {
            count: item.statistics.absent.count,
            hours: item.statistics.absent.totalHours > 0
              ? `${item.statistics.absent.totalHours.toFixed(0)}h`
              : "0h"
          },
          late: {
            count: item.statistics.late.count,
            hours: formatMinutesToHours(item.statistics.late.totalMinutes)
          },
          early: {
            count: item.statistics.earlyLeave.count,
            hours: formatMinutesToHours(item.statistics.earlyLeave.totalMinutes)
          },
          overtime: {
            count: item.statistics.overtime.count,
            hours: formatMinutesToHours(item.statistics.overtime.totalMinutes)
          }
        }));

        setEmployeeStats(stats);

      } catch (err) {
        console.error("❌ Error fetching month summary:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (selectedMonth && selectedMonth.startDate && selectedMonth.endDate) {
      fetchData();
    }
  }, [selectedMonth]);

  

  if (loading) {
    return (
      <div className="bg-white rounded-xl border p-8 text-center">
        <div className="text-gray-500">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border p-8 text-center">
        <div className="text-red-500">Lỗi: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-4 text-left">Nhân viên</th>
            <th className="p-4 text-center">Đi làm</th>
            <th className="p-4 text-center">Nghỉ làm</th>
            <th className="p-4 text-center">Đi muộn / Về sớm</th>
            <th className="p-4 text-center">Làm thêm</th>
          </tr>
        </thead>

        <tbody>
          {employeeStats.map((stat, i) => {
            if (stat.noData) {
              return (
                <tr key={i} className="border-t">
                  <td className="p-4 font-medium">{stat.employee.fullname}</td>
                  <td colSpan="4" className="p-4 text-center text-gray-400 italic">
                    Nhân viên chưa có dữ liệu chấm công
                  </td>
                </tr>
              );
            }

            return (
              <tr key={i} className="border-t">
                <td className="p-4 font-medium">{stat.employee.fullname}</td>
                <SummaryCell days={stat.workShifts.count} hours={stat.workShifts.hours} />
                <SummaryCell days={stat.offShifts.count} hours={stat.offShifts.hours} />
                <SummaryCellCombined
                  late={{ days: stat.late.count, hours: stat.late.hours }}
                  early={{ days: stat.early.count, hours: stat.early.hours }}
                />
                <SummaryCell days={stat.overtime.count} hours={stat.overtime.hours} highlight />
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SummaryCell({ days, hours, highlight }) {
  return (
    <td className="p-4 text-center">
      <div className={`font-medium ${highlight ? "text-blue-600" : ""}`}>
        {days} ca
      </div>
      <div className="text-xs text-gray-500">{hours}</div>
    </td>
  );
}

function SummaryCellCombined({ late, early }) {
  return (
    <td className="p-4 text-center">
      <div className="space-y-1">
        <div className="text-xs text-gray-600">
          <span className="font-medium">{late.days}</span> ca trễ
        </div>
        <div className="text-xs text-gray-600">
          <span className="font-medium">{early.days}</span> ca sớm
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {late.hours} / {early.hours}
      </div>
    </td>
  );
}

/* ================= UI ================= */

function FilterButton({ children, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border
        ${active
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