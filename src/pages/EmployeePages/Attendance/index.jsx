import React, { useState, useEffect } from "react";
import {
  checkIn,
  checkOut,
  getMyAttendances,
  getAttendanceByWorkSchedule,
} from "../../../api/attendanceApi";
import { getWorkSchedulesByEmployeeAndDate } from "../../../api/workScheduleApi";
import { getCurrentLocation } from "../../../utils/gps";
import { getUser } from "../../../utils/auth";
import {
  isValidVietnamLocation,
  getGoogleMapsUrl,
  // openInGoogleMaps, // chỉ dùng nếu bạn muốn thêm nút mở map
} from "../../../utils/gpsHelper";

import TodaySchedulesList from "./components/TodaySchedulesList";
import HistoryItem from "./components/HistoryItem";
import AttendanceSetting from "../../AttendanceSetting";

import {
  formatTimeHHmm,
  formatDateLabelVi,
  toLocalDateOnlyString,
} from "../../../utils/dateTime";

import {
  formatDurationFromMinutes,
  formatDurationFromTimes,
  determineStatusText,
  hasUnfinishedPrevious,
} from "./components/attendanceUtils";

import {
  getCheckInWindowState,
  getCheckOutDelayState,
  isNowWithinCheckInWindow,
  isNowAfterMaxCheckoutDelay,
} from "../../../utils/timeRange";

const CheckInPulse = ({
  actionLabel,
  buttonLabel,
  subtitle,
  onAction,
  disabled,
  locationText,
}) => (
  <div className="flex flex-col items-center justify-center relative py-6">
    <div className="absolute w-64 h-64 bg-primary/20 rounded-full animate-pulse-ring"></div>
    <div className="absolute w-56 h-56 bg-primary/10 rounded-full"></div>
    <button
      onClick={onAction}
      disabled={disabled}
      className="relative z-10 w-48 h-48 rounded-full bg-gradient-to-b from-primary to-blue-700 shadow-xl shadow-primary/30 flex flex-col items-center justify-center text-white border-4 border-white dark:border-surface-dark active:scale-95 transition-transform duration-200 group disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <span className="material-symbols-outlined text-6xl mb-2 group-hover:scale-110 transition-transform">
        fingerprint
      </span>
      <span className="text-xl font-bold uppercase tracking-widest">
        {buttonLabel}
      </span>
      <span className="text-xs font-medium opacity-90 mt-1">{actionLabel}</span>
    </button>
    <div className="mt-8 flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-surface-dark px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
      <span className="material-symbols-outlined text-green-500 text-base">
        location_on
      </span>
      <span>{locationText || subtitle}</span>
    </div>
  </div>
);

export default function Attendance() {
  const user = getUser();
  const employeeId = user?.id;

  const [currentTime, setCurrentTime] = useState(new Date());
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);

  const [history, setHistory] = useState([]);
  const [historyFilter, setHistoryFilter] = useState("week");

  const [loading, setLoading] = useState(false);
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  const [error, setError] = useState("");
  const [locationInfo, setLocationInfo] = useState("Đang lấy vị trí...");

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load schedules hôm nay + attendance từng ca
  useEffect(() => {
    if (!employeeId) return;

    const loadTodaySchedules = async () => {
      setLoadingSchedules(true);
      try {
        const todayStr = toLocalDateOnlyString(new Date());

        const schedules = await getWorkSchedulesByEmployeeAndDate(
          employeeId,
          todayStr
        );

        const todayList = (schedules || []).filter((s) => {
          if (!s.workDate) return false;
          const d =
            typeof s.workDate === "string" && s.workDate.includes("T")
              ? s.workDate.split("T")[0]
              : String(s.workDate).substring(0, 10);
          return d === todayStr;
        });

        setTodaySchedules(todayList);

        if (todayList.length > 0) {
          const attendanceResults = await Promise.all(
            todayList.map((sch) =>
              getAttendanceByWorkSchedule(sch.id, employeeId).catch(() => null)
            )
          );
          const valid = attendanceResults.filter(Boolean);

          setAttendances(valid);

          // Auto-select ca đầu tiên nếu chưa chọn gì
          setSelectedScheduleId((prevSelected) => {
            if (prevSelected) return prevSelected;

            const sorted = [...todayList].sort((a, b) =>
              (a.shift?.startTime || "").localeCompare(b.shift?.startTime || "")
            );
            const unfinished = sorted.find((s) => {
              const att = valid.find((a) => a.workScheduleId === s.id);
              return att?.checkIn && !att?.checkOut; // ưu tiên ca đang mở
            });
            return unfinished?.id || sorted[0]?.id || null;
          });
        } else {
          setAttendances([]);
          setSelectedScheduleId(null);
        }

        setError("");
      } catch (e) {
        setError(e?.message || "Không thể tải lịch làm việc");
        setTodaySchedules([]);
        setAttendances([]);
      } finally {
        setLoadingSchedules(false);
      }
    };

    loadTodaySchedules();
  }, [employeeId]); // ✅ không phụ thuộc selectedScheduleId

  // Load history
  useEffect(() => {
    if (!employeeId) return;

    const loadHistory = async () => {
      try {
        const today = new Date();
        const from = new Date(today);

        if (historyFilter === "month") {
          from.setDate(1);
        } else {
          from.setDate(from.getDate() - 7);
        }

        const fromStr = toLocalDateOnlyString(from);
        const toStr = toLocalDateOnlyString(today);

        const historyData = await getMyAttendances(employeeId, fromStr, toStr);
        if (!Array.isArray(historyData)) {
          setHistory([]);
          return;
        }

        const formatted = historyData
          .map((item) => {
            const dateLabel = item.workDate
              ? formatDateLabelVi(item.workDate)
              : "";

            const total =
              formatDurationFromMinutes(item.totalWorkTime) ||
              formatDurationFromTimes(item.checkIn, item.checkOut) ||
              "--:--";

            return {
              id: item.id,
              date: dateLabel,
              inTime: formatTimeHHmm(item.checkIn),
              outTime: formatTimeHHmm(item.checkOut),
              total,
              status: determineStatusText(item),
              raw: item,
            };
          })
          .sort((a, b) => {
            const da = a.raw?.workDate ? new Date(a.raw.workDate) : new Date(0);
            const db = b.raw?.workDate ? new Date(b.raw.workDate) : new Date(0);
            return db - da;
          });

        setHistory(formatted);
      } catch {
        setHistory([]);
      }
    };

    loadHistory();
  }, [employeeId, historyFilter]);

  // GPS retry helper
  const getLocationWithRetry = async () => {
    const maxRetries = 3;
    const maxAccuracyValues = [60, 50, 40, 30]; // retry càng về sau càng chặt

    let lastErr = null;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        const loc = await getCurrentLocation({
          maxAccuracy: maxAccuracyValues[i] ?? 30,
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        });

        if (!loc) throw new Error("Không thể lấy vị trí GPS");

        // Nếu accuracy quá lớn thì retry (trừ lần cuối)
        if (loc.accuracy > 80 && i < maxRetries) {
          await new Promise((r) => setTimeout(r, 800));
          continue;
        }

        return loc;
      } catch (e) {
        lastErr = e;
        if (i < maxRetries) {
          await new Promise((r) => setTimeout(r, 800));
          continue;
        }
      }
    }

    throw lastErr || new Error("Không thể lấy vị trí GPS");
  };

  const handleCheckInOut = async (schedule, action) => {
    if (!employeeId) return setError("Không có thông tin nhân viên");
    if (!schedule?.id) return setError("Ca làm việc không hợp lệ");
    if (loading || loadingGPS) return;

    setLoadingGPS(true);
    setError("");

    try {
      const location = await getLocationWithRetry();

      // ✅ validate VN (dùng gpsHelper để hết import thừa)
      if (!isValidVietnamLocation(location.lat, location.lng)) {
        throw new Error(
          "Vị trí GPS không hợp lệ (ngoài phạm vi Việt Nam). Vui lòng bật GPS và thử lại."
        );
      }

      console.log(
        "🗺️ Google Maps:",
        getGoogleMapsUrl(location.lat, location.lng)
      );

      setLocationInfo(
        `Vị trí: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)} (Độ chính xác: ${location.accuracy}m)`
      );

      setLoadingGPS(false);
      setLoading(true);

      let result;
      if (action === "checkout") {
        result = await checkOut(
          employeeId,
          schedule.id,
          location.lat,
          location.lng,
          location.accuracy
        );
      } else {
        result = await checkIn(
          employeeId,
          schedule.id,
          location.lat,
          location.lng,
          location.accuracy
        );
      }

      // ✅ reload attendance của schedule này từ server để state chắc chắn đúng
      const refreshedAttendance = await getAttendanceByWorkSchedule(
        schedule.id,
        employeeId
      ).catch(() => result);

      setAttendances((prev) => {
        const next = prev.filter((a) => a.workScheduleId !== schedule.id);
        next.push(refreshedAttendance);
        return next;
      });

      // Reload history
      const today = new Date();
      const from = new Date(today);
      if (historyFilter === "month") from.setDate(1);
      else from.setDate(from.getDate() - 7);

      const historyData = await getMyAttendances(
        employeeId,
        toLocalDateOnlyString(from),
        toLocalDateOnlyString(today)
      );

      if (Array.isArray(historyData)) {
        const formatted = historyData
          .map((item) => ({
            id: item.id,
            date: item.workDate ? formatDateLabelVi(item.workDate) : "",
            inTime: formatTimeHHmm(item.checkIn),
            outTime: formatTimeHHmm(item.checkOut),
            total:
              formatDurationFromMinutes(item.totalWorkTime) ||
              formatDurationFromTimes(item.checkIn, item.checkOut) ||
              "--:--",
            status: determineStatusText(item),
            raw: item,
          }))
          .sort(
            (a, b) =>
              new Date(b.raw?.workDate || 0) - new Date(a.raw?.workDate || 0)
          );

        setHistory(formatted);
      }

      setLocationInfo("Đang lấy vị trí...");
      setError("");
    } catch (err) {
      const msg = err?.message || "Chấm công thất bại. Vui lòng thử lại.";
      setError(msg);
      setLocationInfo("Chưa lấy được vị trí");
    } finally {
      setLoading(false);
      setLoadingGPS(false);
    }
  };

  const timeString = currentTime.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateString = currentTime.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const sortedSchedules = [...todaySchedules].sort((a, b) =>
    (a.shift?.startTime || "").localeCompare(b.shift?.startTime || "")
  );

  const focusSchedule = (() => {
    if (sortedSchedules.length === 0) return null;

    const checkoutTarget = sortedSchedules.find((schedule) => {
      const attendance = attendances.find(
        (a) => a.workScheduleId === schedule.id
      );

      if (
        !attendance?.checkIn ||
        attendance?.checkOut ||
        attendance?.status === "AUTO_CLOSED"
      ) {
        return false;
      }

      const checkOutState = getCheckOutDelayState(
        schedule.workDate,
        schedule.shift?.startTime,
        schedule.shift?.endTime,
        6
      );

      return (
        checkOutState.allowed &&
        !isNowAfterMaxCheckoutDelay(
          schedule.workDate,
          schedule.shift?.startTime,
          schedule.shift?.endTime,
          6
        )
      );
    });

    if (checkoutTarget) {
      return { schedule: checkoutTarget, action: "checkout" };
    }

    const checkinTarget = sortedSchedules.find((schedule) => {
      const attendance = attendances.find(
        (a) => a.workScheduleId === schedule.id
      );

      if (attendance?.checkIn || attendance?.checkOut) return false;

      const checkInState = getCheckInWindowState(
        schedule.workDate,
        schedule.shift?.startTime,
        schedule.shift?.endTime,
        30
      );

      if (
        !checkInState.allowed ||
        !isNowWithinCheckInWindow(
          schedule.workDate,
          schedule.shift?.startTime,
          schedule.shift?.endTime,
          30
        )
      ) {
        return false;
      }

      return !hasUnfinishedPrevious(
        sortedSchedules,
        schedule.id,
        attendances
      );
    });

    if (checkinTarget) {
      return { schedule: checkinTarget, action: "checkin" };
    }

    return null;
  })();

  return (
    <div className="flex-1 flex flex-col relative overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 min-h-0">
      <div className="flex justify-end mb-2">
        <AttendanceSetting />
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm whitespace-pre-line flex items-start gap-2">
          <span className="material-symbols-outlined text-red-500 flex-shrink-0 mt-0.5">
            error
          </span>
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col items-center justify-center pt-2 mb-4">
        <h3 className="text-4xl font-bold text-gray-900 dark:text-white">
          {timeString}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
          {dateString}
        </p>
      </div>

      {loadingSchedules && (
        <div className="mb-6 p-4 bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
            <span className="material-symbols-outlined animate-spin">sync</span>
            <span>Đang tải lịch làm việc...</span>
          </div>
        </div>
      )}

      {!loadingSchedules && (
        <>
          {focusSchedule && (
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    bolt
                  </span>
                  {focusSchedule.action === "checkout"
                    ? "Cần check-out ngay"
                    : "Sắp vào ca"}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {focusSchedule.schedule.shift?.name || "Ca làm việc"} •{" "}
                  {formatTimeHHmm(
                    focusSchedule.schedule.shift?.startTime
                  )}{" "}
                  -{" "}
                  {formatTimeHHmm(
                    focusSchedule.schedule.shift?.endTime
                  )}
                </p>
              </div>
              <div className="p-4">
                <CheckInPulse
                  actionLabel={
                    focusSchedule.action === "checkout"
                      ? "Kết thúc ca"
                      : "Vào ca"
                  }
                  buttonLabel={
                    focusSchedule.action === "checkout"
                      ? "Check Out"
                      : "Check In"
                  }
                  subtitle={
                    focusSchedule.action === "checkout"
                      ? "Vui lòng check-out để hoàn tất ca"
                      : "Bạn có thể check-in ngay bây giờ"
                  }
                  onAction={() =>
                    handleCheckInOut(
                      focusSchedule.schedule,
                      focusSchedule.action
                    )
                  }
                  disabled={loading || loadingGPS}
                  locationText={locationInfo}
                />
              </div>
            </div>
          )}

          <TodaySchedulesList
            schedules={todaySchedules}
            attendances={attendances}
            onCheckInOut={handleCheckInOut}
            loading={loading}
            loadingGPS={loadingGPS}
            locationInfo={locationInfo}
          error={error}
          />
        </>
      )}

      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              history
            </span>
            Lịch sử chấm công
          </h4>

          <div className="flex gap-2">
            <button
              onClick={() => setHistoryFilter("week")}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                historyFilter === "week"
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              7 ngày
            </button>
            <button
              onClick={() => setHistoryFilter("month")}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                historyFilter === "month"
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Tháng này
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
          {history.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">
                history
              </span>
              <p className="text-sm">Chưa có lịch sử chấm công</p>
            </div>
          ) : (
            history.map((item) => (
              <HistoryItem key={item.id || item.date} {...item} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
