import React, { useEffect, useMemo, useState } from "react";
import CreateScheduleModal from "../components/work-schedule/CreateScheduleModal";
import { getEmployees } from "../api/employeeApi";
import { getWorkSchedulesByDate, deleteWorkSchedule, getWeeklySchedulesByShift } from "../api/workScheduleApi";

/* Helper: YYYY-MM-DD */
const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function WorkSchedule() {
  const [mode, setMode] = useState("calendar"); // calendar | employee

  const [modalState, setModalState] = useState({
    open: false,
    mode: "add", // "add" | "edit"
    dateKey: null,
    schedule: null, // raw ws
  });

  const [employees, setEmployees] = useState([]);
  const [schedules, setSchedules] = useState([]); // raw list ResWorkSchedule
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // search theo nhân viên (client-side)
  const [keyword, setKeyword] = useState("");

  function getStartOfWeek(date = new Date()) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay(); // CN=0 ... T7=6
    d.setDate(d.getDate() - day); // lùi về CN
    return d;
  }

  // week start
  const [weekStartDate, setWeekStartDate] = useState(() => getStartOfWeek(new Date()));

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStartDate);
      day.setDate(weekStartDate.getDate() + i);
      return day;
    });
  }, [weekStartDate]);

  const changeWeek = (offset) => {
    const newDate = new Date(weekStartDate);
    newDate.setDate(weekStartDate.getDate() + offset);
    setWeekStartDate(newDate);
  };

  // ✅ click cell -> ADD
  const openAddModal = (dateKey) => {
    setModalState({ open: true, mode: "add", dateKey, schedule: null });
  };

  // ✅ click badge -> EDIT
  const openEditModal = (dateKey, ws) => {
    setModalState({ open: true, mode: "edit", dateKey, schedule: ws });
  };

  const closeModal = () => {
    setModalState({ open: false, mode: "add", dateKey: null, schedule: null });
  };

  const formatHeaderDate = (date) =>
    `${String(date.getDate()).padStart(2, "0")}/${date.getMonth() + 1}`;
  const headerTitle = `${formatHeaderDate(weekDays[0])} - ${formatHeaderDate(
    weekDays[6]
  )}, ${weekDays[6].getFullYear()}`;

  // fetch employees + schedules of week
  const fetchWeekData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch employees
      const er = await getEmployees();
      const eData = er?.data ?? er;
      setEmployees(Array.isArray(eData) ? eData : []);

      // 🆕 USE API V2: Single call instead of 7 calls
      const startDate = formatDateKey(weekDays[0]);
      const endDate = formatDateKey(weekDays[6]);

      console.log('📅 [API V2] Fetching weekly schedules:', { startDate, endDate });

      const data = await getWeeklySchedulesByShift(startDate, endDate);

      console.log('✅ [API V2] Weekly schedules received:', {
        shiftCount: data?.shifts?.length || 0,
        dateRange: `${data?.startDate} ~ ${data?.endDate}`
      });

      // Transform shift-based data to flat schedule list
      const scheduleList = [];

      data.shifts.forEach(shiftData => {
        shiftData.dailySchedules.forEach(daily => {
          daily.schedules.forEach(schedule => {
            scheduleList.push({
              id: schedule.id,
              workDate: schedule.workDate,
              employee: schedule.employee,
              shift: shiftData.shift,
              // Bỏ attendance vì Work Schedule không cần
            });
          });
        });
      });

      setSchedules(scheduleList);

    } catch (e) {
      setError(e?.message || "Không tải được lịch làm việc");
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  // ============ CODE CŨ (7 API calls) - GIỮ LẠI ĐỂ PHÒNG KHI CẦN ============
  /*
  const fetchWeekData = async () => {
    try {
      setLoading(true);
      setError("");

      const er = await getEmployees();
      const eData = er?.data ?? er;
      setEmployees(Array.isArray(eData) ? eData : []);

      const dateKeys = weekDays.map((d) => formatDateKey(d));
      const results = await Promise.all(
        dateKeys.map((dk) => getWorkSchedulesByDate(dk).catch(() => []))
      );

      const merged = results.flat();
      setSchedules(Array.isArray(merged) ? merged : []);
    } catch (e) {
      setError(e?.message || "Không tải được lịch làm việc");
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };
  */
  // ============ END CODE CŨ ============

  useEffect(() => {
    fetchWeekData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStartDate]);

  // lock scroll khi mở modal
  useEffect(() => {
    document.body.style.overflow = modalState.open ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [modalState.open]);

  /**
   * ✅ map schedules -> calendarData kiểu:
   * { "YYYY-MM-DD": [ { id, employee, label, color, ws } ] }
   */

  const calendarData = useMemo(() => {
    const map = {};
    for (const ws of schedules) {
      const dateKey = ws?.workDate || ws?.date || ws?.work_date;
      if (!dateKey) continue;

      const empName =
        ws?.employee?.fullname ||
        ws?.employee?.name ||
        ws?.employeeName ||
        "—";

      const shiftName = ws?.shift?.name || ws?.shiftName || "Ca";

      const start = normalizeTime(ws?.shift?.startTime || ws?.startTime);
      const end = normalizeTime(ws?.shift?.endTime || ws?.endTime);

      const label =
        start !== "—" && end !== "—"
          ? `${shiftName} (${start}-${end})`
          : shiftName;

      const color = ws?.shift?.colorCode || "#22c55e";

      const ev = {
        id: ws?.id,     // ✅ cần để delete/update
        employee: empName,
        label,
        color,
        ws,             // ✅ giữ raw object để edit
      };

      map[dateKey] = map[dateKey] ? [...map[dateKey], ev] : [ev];
    }
    return map;
  }, [schedules]);

  // employee list filter (client-side)
  const displayedEmployees = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return employees;

    return employees.filter((e) => {
      const name = String(e.fullname ?? e.name ?? "").toLowerCase();
      const email = String(e.email ?? "").toLowerCase();
      const phone = String(e.phone ?? "").toLowerCase();
      const id = String(e.id ?? "").toLowerCase();
      return (
        name.includes(k) || email.includes(k) || phone.includes(k) || id.includes(k)
      );
    });
  }, [employees, keyword]);

  // ✅ delete inline
  const handleDeleteInline = async (ev) => {
    const ok = window.confirm(`Xóa lịch của "${ev.employee}"?`);
    if (!ok) return;

    try {
      setLoading(true);
      setError("");
      await deleteWorkSchedule(ev.id);
      // update UI ngay
      setSchedules((prev) => prev.filter((x) => x.id !== ev.id));
    } catch (e) {
      setError(e?.message || "Xóa lịch thất bại");
    } finally {
      setLoading(false);
    }
  };

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
          <ModeTab active={mode === "calendar"} onClick={() => setMode("calendar")}>
            Theo lịch
          </ModeTab>
          <ModeTab active={mode === "employee"} onClick={() => setMode("employee")}>
            Theo nhân viên
          </ModeTab>
        </div>

        {/*         
        <button
          onClick={() => setKeyword("")}
          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium"
        >
          Xóa lọc
        </button> */}
      </div>

      {loading && <div className="text-gray-600">Đang tải...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {/* CALENDAR/EMPLOYEE VIEW */}
      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        {/* Navigation Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            <div className="flex border rounded-lg overflow-hidden">
              <button onClick={() => changeWeek(-7)} className="px-3 py-1.5 hover:bg-gray-50 border-r">
                ‹
              </button>
              <button onClick={() => changeWeek(7)} className="px-3 py-1.5 hover:bg-gray-50">
                ›
              </button>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">{headerTitle}</h2>
          </div>


        </div>

        {mode === "calendar" ? (
          <>
            <div className="grid grid-cols-7 text-center py-3 bg-gray-50 border-b text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((d, i) => (
                <div key={d}>
                  {d} ({String(weekDays[i].getDate()).padStart(2, "0")})
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {weekDays.map((date, i) => {
                const dateKey = formatDateKey(date);
                const events = calendarData[dateKey] || [];
                const getStartMinutes = (ev) => {
                  const ws = ev.ws;
                  const raw = ws?.shift?.startTime || ws?.startTime; // "HH:mm" hoặc "HH:mm:ss"
                  if (!raw) return 9999;

                  const s = String(raw);
                  const m = s.match(/^(\d{2}):(\d{2})/);
                  if (!m) return 9999;

                  const hh = Number(m[1]);
                  const mm = Number(m[2]);
                  return hh * 60 + mm;
                };

                const sortedEvents = [...events].sort((a, b) => {
                  const ta = getStartMinutes(a);
                  const tb = getStartMinutes(b);
                  if (ta !== tb) return ta - tb;

                  // tie-break: tên NV (hoặc shiftName) để ổn định
                  const na = (a.ws?.employee?.fullname || a.employee || "").toLowerCase();
                  const nb = (b.ws?.employee?.fullname || b.employee || "").toLowerCase();
                  return na.localeCompare(nb);
                });

                return (
                  <div
                    key={i}
                    onClick={() => openAddModal(dateKey)} // ✅ click cell -> add
                    className="min-h-[260px] p-3 border-r border-gray-100 hover:bg-gray-50/50 cursor-pointer last:border-r-0 group relative"
                    title="Click để thêm lịch"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-bold text-gray-400 group-hover:text-blue-600 transition-colors">
                        Ngày {date.getDate()}
                      </div>

                      {!loading && <button
                        className="
                          opacity-0 translate-y-1 scale-95 font-bold
                          group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100
                          transition-all duration-200 ease-out
                          text-xs px-2 py-1 rounded-md
                          bg-blue-400 text-white shadow-sm
                          hover:bg-blue-700 hover:shadow-md
                          active:scale-95
                        "
                        onClick={(e) => {
                          e.stopPropagation();
                          openAddModal(dateKey);
                        }}
                        title="Thêm lịch"
                      >
                        + Thêm
                      </button>}

                    </div>
                    <div className="space-y-2 max-h-[500px] overflow-auto pr-1">

                      {sortedEvents.map((ev, idx) => {
                        const ws = ev.ws;
                        const emp = ws?.employee?.fullname || ws?.employeeName || ev.employee || "—";
                        const shiftName = ws?.shift?.name || ws?.shiftName || "—";
                        const start = normalizeTime(ws?.shift?.startTime || ws?.startTime);
                        const end = normalizeTime(ws?.shift?.endTime || ws?.endTime);
                        const note = ws?.note || ws?.description || ""; // nếu có

                        const textColor = pickTextColor(ev.color);
                        return (
                          <div
                            key={ev.id ?? idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(dateKey, ws); // click item để edit luôn (tuỳ bạn)
                            }}
                            className="
      group relative rounded-xl border px-2 py-2 shadow-sm
      overflow-hidden cursor-pointer
    "
                            style={{
                              backgroundColor: hexToRgba(ev.color, 0.22),
                              borderColor: hexToRgba(ev.color, 0.5),
                              color: textColor,
                            }}
                          >
                            {/* ✅ floating actions: chỉ hiện khi hover, nằm trong item */}
                            <div
                              className="
        absolute right-1 top-1 z-10 flex gap-1
        opacity-0 group-hover:opacity-100 transition-opacity
        pointer-events-none
      "
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditModal(dateKey, ws);
                                }}
                                className="
      pointer-events-auto
      w-5 h-5 rounded-md grid place-items-center
      bg-black/10 hover:bg-black/40 backdrop-blur
    "
                                title="Sửa"
                                aria-label="Sửa"
                              >

                                <span className="material-symbols-outlined text-[16px] leading-none">
                                  edit
                                </span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteInline(ev);
                                }}
                                className="
          pointer-events-auto
          h-5 w-5 rounded-md grid place-items-center
          text-[11px] font-black leading-none
          bg-black/10 hover:bg-black/40
          backdrop-blur
        "
                                title="Xóa lịch"
                              >
                                ×
                              </button>
                            </div>

                            {/* ✅ content */}
                            <div className="min-w-0">
                              {/* emp: chỉ emp bold */}
                              <div className="text-[12px] font-bold leading-snug break-words">
                                {emp}
                              </div>

                              {shiftName ? (
                                <div className="mt-0.5 text-[11px] opacity-95 break-words">
                                  {shiftName}
                                </div>
                              ) : null}
                            </div>

                            {/* details */}
                            <div className="mt-1.5 space-y-1 text-[11px] leading-snug opacity-95">
                              <div className="flex items-center gap-2">
                                <span className="opacity-90">{start}-{end}</span>
                              </div>

                              {!!note && (
                                <div className="flex items-start gap-2">
                                  <span className="opacity-80 shrink-0">📝</span>
                                  <span className="min-w-0 line-clamp-2">{note}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );


                      })}

                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              <div className="grid grid-cols-[220px_repeat(7,1fr)] bg-gray-50 border-b text-[11px] font-bold text-gray-400 uppercase">
                <div className="p-4 border-r">Nhân viên</div>
                {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((d, i) => (
                  <div key={d} className="p-4 text-center border-r last:border-r-0">
                    {d} ({String(weekDays[i].getDate()).padStart(2, "0")})
                  </div>
                ))}
              </div>

              {displayedEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="grid grid-cols-[220px_repeat(7,1fr)] border-b last:border-b-0 hover:bg-gray-50/30 transition-colors"
                >
                  <div className="p-4 border-r flex flex-col justify-center">
                    <div className="font-bold text-gray-800 text-sm">{emp.fullname || emp.name}</div>
                    <div className="text-[11px] text-gray-400">{emp.email || emp.phone || `ID: ${emp.id}`}</div>
                  </div>

                  {weekDays.map((date, i) => {
                    const dateKey = formatDateKey(date);
                    const empName = emp.fullname || emp.name || "";
                    const empEvents = (calendarData[dateKey] || []).filter((ev) => ev.employee === empName);

                    return (
                      <div
                        key={i}
                        onClick={() => openAddModal(dateKey)}
                        className="p-2 border-r last:border-r-0 min-h-[80px] flex flex-col gap-1 cursor-pointer hover:bg-blue-50/20 group"
                        title="Click để thêm lịch"
                      >
                        {empEvents.map((ev, idx) => {
                          const ws = ev.ws;
                          const shiftName = ws?.shift?.name || ws?.shiftName || "—";
                          const start = normalizeTime(ws?.shift?.startTime || ws?.startTime);
                          const end = normalizeTime(ws?.shift?.endTime || ws?.endTime);

                          const textColor = pickTextColor(ev.color);

                          return (
                            <div
                              key={ev.id ?? idx}
                              className="group relative rounded-lg border px-2.5 py-2 shadow-sm"
                              style={{
                                backgroundColor: hexToRgba(ev.color, 0.22),
                                borderColor: hexToRgba(ev.color, 0.5),
                                color: textColor,
                              }}
                            >
                              {/* ✅ floating actions (không ảnh hưởng layout) */}
                              <div
                                className="absolute right-1 top-1 z-10 flex flex-col gap-1
               opacity-0 group-hover:opacity-100 transition-opacity
               pointer-events-none"
                              >

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteInline(ev);
                                  }}
                                  className="pointer-events-auto
                 w-4 h-4 rounded-md grid place-items-center
                 text-[10px] font-bold
                 bg-black/10 hover:bg-black/20 backdrop-blur"
                                  title="Xóa"
                                >
                                  ×

                                </button>
                              </div>

                              {/* ✅ content full width, không bị chừa chỗ */}
                              <div className="min-w-0">
                                <div className="text-[11px] font-bold truncate">{shiftName}</div>
                                <div className="text-[10.5px] opacity-95 mt-0.5">
                                  {start}-{end}
                                </div>
                              </div>
                            </div>

                          );
                        })}

                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ✅ Modal: truyền thêm mode + schedule để edit */}
      <CreateScheduleModal
        open={modalState.open}
        onClose={closeModal}
        selectedDate={modalState.dateKey}
        mode={modalState.mode}              // "add" | "edit"
        schedule={modalState.schedule}      // raw ws
        onSaved={() => {
          closeModal();
          fetchWeekData();
        }}
        onDeleted={() => {
          closeModal();
          fetchWeekData();
        }}
      />
    </div>
  );
}

/* ================= COMPONENT PHỤ ================= */
function ModeTab({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${active ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"
        }`}
    >
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

function normalizeTime(t) {
  if (!t) return "—";
  const s = String(t);
  if (/^\d{2}:\d{2}:\d{2}$/.test(s)) return s.slice(0, 5);
  if (/^\d{2}:\d{2}$/.test(s)) return s;
  return s;
}

function hexToRgba(hex, alpha = 0.1) {
  if (!hex || typeof hex !== "string") return `rgba(34,197,94,${alpha})`;
  const h = hex.replace("#", "");
  if (h.length !== 6) return `rgba(34,197,94,${alpha})`;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function pickTextColor(hex) {
  if (!hex || typeof hex !== "string") return "#0f172a";
  const h = hex.replace("#", "");
  if (h.length !== 6) return "#0f172a";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#0f172a" : "#000";
}
