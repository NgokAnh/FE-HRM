// Utils xử lý thời gian/date dùng chung

export const formatTimeHHmm = (input) => {
  if (!input) return "--:--";

  // "HH:mm" hoặc "HH:mm:ss" => lấy HH:mm
  if (typeof input === "string") {
    const m = input.match(/^(\d{2}):(\d{2})/);
    if (m) return `${m[1]}:${m[2]}`;
  }

  // ISO string / Date => lấy HH:mm theo local time
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "--:--";

  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

export const toLocalDateOnlyString = (dateInput = new Date()) => {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const formatDateLabelVi = (dateInput) => {
  if (!dateInput) return "";
  try {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (Number.isNaN(date.getTime())) return "";

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Hôm nay, ${date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}`;
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return `Hôm qua, ${date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}`;
    }

    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
};
