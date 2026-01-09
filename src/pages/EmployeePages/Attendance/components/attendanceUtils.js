// Utils liên quan attendance nhưng vẫn có thể dùng lại ở nhiều page

export const formatDurationFromMinutes = (minutes) => {
  if (minutes === null || minutes === undefined) return null;
  const m = Number(minutes);
  if (Number.isNaN(m) || m < 0) return null;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}h ${String(mm).padStart(2, "0")}p`;
};

export const formatDurationFromTimes = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return null;
  try {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
      return null;

    const diffMs = end - start;
    if (diffMs < 0) return null;

    const h = Math.floor(diffMs / (1000 * 60 * 60));
    const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${h}h ${String(m).padStart(2, "0")}p`;
  } catch {
    return null;
  }
};

export const getAttendanceLabel = (attendance) => {
  if (!attendance) return null;
  if (attendance.status === "AUTO_CLOSED") return "Đã tự đóng";
  if (attendance.checkOut) return "Đã hoàn thành";
  if (attendance.checkIn) return "Đã check-in";
  return "Chưa check-in";
};

export const determineStatusText = (attendance) => {
  if (!attendance) return null;
  if (attendance.lateTime != null && attendance.lateTime > 0) return "Đi muộn";
  if (attendance.earlyLeave != null && attendance.earlyLeave > 0)
    return "Về sớm";
  if (attendance.checkIn && attendance.checkOut) return "Đúng giờ";
  return null;
};

import { getCheckOutDelayState } from "../../../../utils/timeRange";

export const hasUnfinishedPrevious = (
  schedules,
  currentScheduleId,
  attendances
) => {
  if (!Array.isArray(schedules) || schedules.length === 0) return false;

  const sorted = [...schedules].sort((a, b) =>
    (a.shift?.startTime || "").localeCompare(b.shift?.startTime || "")
  );

  const idx = sorted.findIndex((s) => s.id === currentScheduleId);
  if (idx <= 0) return false;

  for (let i = 0; i < idx; i++) {
    const prev = sorted[i];
    const prevAtt = attendances.find((a) => a.workScheduleId === prev.id);

    if (prevAtt?.checkIn && !prevAtt?.checkOut) {
      if (prevAtt.status === "AUTO_CLOSED") continue;

      const checkOutState = getCheckOutDelayState(
        prev.workDate,
        prev.shift?.startTime,
        prev.shift?.endTime,
        6
      );
      if (!checkOutState.allowed) {
        continue; // quá 6h sau giờ tan ca -> cho phép ca sau
      }
      return true;
    }
  }
  return false;
};
