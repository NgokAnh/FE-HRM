import React, { useEffect, useMemo, useState } from "react";
import { getWorkSchedulesByEmployeeDateRange } from "../../api/workScheduleApi";
import { getUser } from "../../utils/auth"

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function getStartOfWeek(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // CN=0 ... T7=6
  d.setDate(d.getDate() - day); // về CN
  return d;
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

function getStartMinutes(ws) {
  const raw = ws?.shift?.startTime || ws?.startTime;
  if (!raw) return 9999;
  const m = String(raw).match(/^(\d{2}):(\d{2})/);
  if (!m) return 9999;
  return Number(m[1]) * 60 + Number(m[2]);
}

export default function MyWorkSchedule() {
  const user = getUser();
  const employeeId = user?.id;
  const [weekStartDate, setWeekStartDate] = useState(() => getStartOfWeek(new Date()));
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const formatHeaderDate = (date) =>
    `${String(date.getDate()).padStart(2, "0")}/${date.getMonth() + 1}`;

  const headerTitle = `${formatHeaderDate(weekDays[0])} - ${formatHeaderDate(
    weekDays[6]
  )}, ${weekDays[6].getFullYear()}`;

  // ✅ Fetch 1 lần cho cả tuần bằng hàm mới
  const fetchWeekData = async () => {
    if (!employeeId) return;
    console.log("Fetch lịch làm việc");

console.log("employeeId", employeeId);
    try {
      setLoading(true);
      setError("");

      const startDate = formatDateKey(weekDays[0]);
      let endDate = formatDateKey(weekDays[6]);

      // NOTE: Nếu backend hiểu endDate là "exclusive" và bạn bị thiếu ngày cuối,
      // hãy bật đoạn dưới để +1 ngày:
      //
      // const end = new Date(weekDays[6]);
      // end.setDate(end.getDate() + 1);
      // endDate = formatDateKey(end);

      const data = await getWorkSchedulesByEmployeeDateRange(employeeId, startDate, endDate);
      console.log("Lịch làm việc tải về:", data);
      setSchedules(Array.isArray(data.dailySchedules) ? data.dailySchedules : []);
    } catch (e) {
      setError(e?.message || "Không tải được lịch làm việc");
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeekData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStartDate, employeeId]);

  const calendarData = useMemo(() => {
    const map = {};

    for (const daily of schedules) {
      const dateKey = daily?.workDate || daily?.date || daily?.work_date;
      const items = daily?.workSchedules || daily?.schedules || [];
      if (!dateKey || !Array.isArray(items)) continue;

      for (const ws of items) {
        const shiftName = ws?.shift?.name || ws?.shiftName || "Ca";
        const start = normalizeTime(ws?.shift?.startTime || ws?.startTime);
        const end = normalizeTime(ws?.shift?.endTime || ws?.endTime);
        const color = ws?.shift?.colorCode || "#22c55e";
        const note = ws?.note || ws?.description || "";

        const ev = { id: ws?.id, shiftName, start, end, color, note, ws };
        map[dateKey] = map[dateKey] ? [...map[dateKey], ev] : [ev];
      }
    }

    for (const dk of Object.keys(map)) {
      map[dk] = [...map[dk]].sort(
        (a, b) => getStartMinutes(a.ws) - getStartMinutes(b.ws)
      );
    }

    return map;
  }, [schedules]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Lịch làm việc của tôi</h1>
      </div>

      {loading && <div className="text-gray-600">Đang tải...</div>}
      {error && <div className="text-red-600">{error}</div>}

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => changeWeek(-7)}
                className="px-3 py-1.5 hover:bg-gray-50 border-r"
              >
                ‹
              </button>
              <button onClick={() => changeWeek(7)} className="px-3 py-1.5 hover:bg-gray-50">
                ›
              </button>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">{headerTitle}</h2>
          </div>
        </div>

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

            return (
              <div
                key={i}
                className="min-h-[220px] p-3 border-r border-gray-100 last:border-r-0 hover:bg-gray-50/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold text-gray-400">
                    Ngày {date.getDate()}
                  </div>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-auto pr-1">
                  {events.length === 0 ? (
                    <div className="text-xs text-gray-400 italic">
                      Không có lịch
                    </div>
                  ) : (
                    events.map((ev, idx) => {
                      const textColor = pickTextColor(ev.color);
                      return (
                        <div
                          key={ev.id ?? idx}
                          className="rounded-xl border px-2 py-2 shadow-sm overflow-hidden"
                          style={{
                            backgroundColor: hexToRgba(ev.color, 0.22),
                            borderColor: hexToRgba(ev.color, 0.5),
                            color: textColor,
                          }}
                          title={`${ev.shiftName} ${ev.start}-${ev.end}`}
                        >
                          <div className="min-w-0">
                            <div className="text-[12px] font-bold break-words">
                              {ev.shiftName}
                            </div>
                            <div className="mt-0.5 text-[11px] opacity-95">
                              {ev.start}-{ev.end}
                            </div>
                            {!!ev.note && (
                              <div className="mt-1 text-[11px] opacity-90 line-clamp-2">
                                {ev.note}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
