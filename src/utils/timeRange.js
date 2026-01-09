// src/utils/timeRange.js

const DAY_MS = 24 * 60 * 60 * 1000;

// Lấy "YYYY-MM-DD" an toàn từ workDate (có thể là ISO "2026-01-08T..." hoặc Date)
const toDateOnly = (workDate) => {
  if (!workDate) return null;
  if (workDate instanceof Date) {
    const y = workDate.getFullYear();
    const m = String(workDate.getMonth() + 1).padStart(2, "0");
    const d = String(workDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const s = String(workDate);
  // ISO => lấy 10 ký tự đầu
  return s.length >= 10 ? s.substring(0, 10) : null;
};

// Lấy "HH:mm" từ time (có thể "HH:mm:ss")
const toHHmm = (timeStr) => {
  if (!timeStr) return null;
  const s = String(timeStr);
  return s.length >= 5 ? s.substring(0, 5) : null;
};

// Tạo Date local từ dateOnly + HH:mm (local timezone)
const makeLocalDateTime = (dateOnly, hhmm) => {
  if (!dateOnly || !hhmm) return null;
  // new Date("YYYY-MM-DDTHH:mm:00") => parse theo local (đa số browser)
  const dt = new Date(`${dateOnly}T${hhmm}:00`);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

// Trả về khoảng thời gian làm việc (start/end) theo local Date, có xử lý qua đêm
export const getLocalRange = (workDate, startTime, endTime) => {
  const dateOnly = toDateOnly(workDate);
  const startHHmm = toHHmm(startTime);
  const endHHmm = toHHmm(endTime);
  if (!dateOnly || !startHHmm || !endHHmm) return null;

  const start = makeLocalDateTime(dateOnly, startHHmm);
  let end = makeLocalDateTime(dateOnly, endHHmm);
  if (!start || !end) return null;

  // qua đêm: end < start => cộng 1 ngày cho end
  if (end.getTime() < start.getTime()) {
    end = new Date(end.getTime() + DAY_MS);
  }

  return { start, end };
};

// Check if two shifts overlap on the same work date (with overnight handling)
export const checkOverlapByClocks = (
  workDate,
  startTime1,
  endTime1,
  startTime2,
  endTime2
) => {
  const r1 = getLocalRange(workDate, startTime1, endTime1);
  const r2 = getLocalRange(workDate, startTime2, endTime2);
  if (!r1 || !r2) return false;

  return r1.start < r2.end && r2.start < r1.end;
};

// BE: windowStart = shiftStart - 30m ; chỉ cho check-in nếu now >= windowStart && now < shiftEnd
export const isNowWithinCheckInWindow = (
  workDate,
  startTime,
  endTime,
  minutesBefore = 30
) => {
  const r = getLocalRange(workDate, startTime, endTime);
  if (!r) return true; // thiếu dữ liệu thì đừng chặn UI
  const now = new Date();
  const windowStart = new Date(r.start.getTime() - minutesBefore * 60 * 1000);
  return (
    now.getTime() >= windowStart.getTime() && now.getTime() < r.end.getTime()
  );
};

// BE: maxCheckoutTime = shiftEnd + 6h ; quá giờ này thì không cho checkout
export const isNowAfterMaxCheckoutDelay = (
  workDate,
  startTime,
  endTime,
  maxHoursAfter = 6
) => {
  const r = getLocalRange(workDate, startTime, endTime);
  if (!r) return false;
  const now = new Date();
  const maxCheckout = new Date(
    r.end.getTime() + maxHoursAfter * 60 * 60 * 1000
  );
  return now.getTime() > maxCheckout.getTime();
};

// (Optional) dùng cho label UI
export const isNowAfterEnd = (workDate, startTime, endTime) => {
  const r = getLocalRange(workDate, startTime, endTime);
  if (!r) return false;
  return new Date().getTime() >= r.end.getTime();
};

// Lấy trạng thái cửa sổ check-in + lý do để hiển thị UI
export const getCheckInWindowState = (
  workDate,
  startTime,
  endTime,
  minutesBefore = 30
) => {
  const r = getLocalRange(workDate, startTime, endTime);
  if (!r) return { allowed: true, reason: null };
  const now = new Date();
  const windowStart = new Date(r.start.getTime() - minutesBefore * 60 * 1000);
  if (now.getTime() < windowStart.getTime()) {
    return { allowed: false, reason: "Chưa đến giờ check-in" };
  }
  if (now.getTime() >= r.end.getTime()) {
    return { allowed: false, reason: "Đã quá giờ tan ca" };
  }
  return { allowed: true, reason: null };
};

// Lấy trạng thái giới hạn checkout + lý do để hiển thị UI
export const getCheckOutDelayState = (
  workDate,
  startTime,
  endTime,
  maxHoursAfter = 6
) => {
  const r = getLocalRange(workDate, startTime, endTime);
  if (!r) return { allowed: true, reason: null };
  const now = new Date();
  const maxCheckout = new Date(
    r.end.getTime() + maxHoursAfter * 60 * 60 * 1000
  );
  if (now.getTime() > maxCheckout.getTime()) {
    return {
      allowed: false,
      reason: `Đã quá ${maxHoursAfter} tiếng sau giờ tan ca`,
    };
  }
  return { allowed: true, reason: null };
};
