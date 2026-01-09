import axiosClient, { axiosV2 } from "./axiosClient";

const BASE_URL = "/attendances";

/* ===================== Helpers ===================== */
const extractData = (response) => {
  const body = response.data;
  return body && typeof body === "object" && "data" in body
    ? body.data
    : body;
};

const extractErrorMessage = (error) => {
  const data = error?.response?.data;
  if (!data) return error?.message || "Request failed";
  if (typeof data === "string") return data;
  if (typeof data.message === "string") return data.message;
  if (typeof data.error === "string") return data.error;
  return error?.message || "Request failed";
};

/* ===================== API v1 (GIỮ NGUYÊN) ===================== */
/**
 * Lấy attendance của nhân viên theo workSchedule
 * GET /api/v1/attendances/my/{workScheduleId}?employeeId={employeeId}
 */
export async function getAttendanceByWorkSchedule(
  workScheduleId,
  employeeId
) {
  if (!workScheduleId) {
    throw new Error("workScheduleId is required");
  }

  if (!employeeId) {
    throw new Error("employeeId is required");
  }

  try {
    const response = await axiosClient.get(
      `${BASE_URL}/my/${workScheduleId}`,
      { params: { employeeId } }
    );
    return extractData(response);
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/* ===================== API v2 (CŨ – GIỮ NGUYÊN) ===================== */
/**
 * Tóm tắt chấm công TOÀN CÔNG TY
 * GET /api/v2/attendances/weekly-summary
 */
export async function getAttendanceSummaryCompanyV2(
  startDate,
  endDate
) {
  if (!startDate || !endDate) {
    return {
      totalDays: 0,
      overtime: 0,
      late: 0,
      earlyLeave: 0,
    };
  }

  const response = await axiosV2.get(
    "/attendances/weekly-summary",
    { params: { startDate, endDate } }
  );

  const employees = response.data?.data?.employees ?? [];

  return employees.reduce(
    (acc, { statistics }) => {
      if (!statistics) return acc;

      acc.totalDays += statistics.worked?.count ?? 0;
      acc.overtime +=
        (statistics.overtime?.totalMinutes ?? 0) / 60;
      acc.late += statistics.late?.count ?? 0;
      acc.earlyLeave +=
        statistics.earlyLeave?.count ?? 0;

      return acc;
    },
    {
      totalDays: 0,
      overtime: 0,
      late: 0,
      earlyLeave: 0,
    }
  );
}

/* ===================== API v2 (MỚI – TỪ FILE 2) ===================== */
/**
 * 🆕 API V2: Lấy raw weekly summary (không tính toán)
 * GET /api/v2/attendances/weekly-summary
 */
export async function getWeeklyAttendanceSummary(
  startDate,
  endDate
) {
  if (!startDate) throw new Error("startDate is required");
  if (!endDate) throw new Error("endDate is required");

  const response = await axiosV2.get(
    "/attendances/weekly-summary",
    { params: { startDate, endDate } }
  );

  return extractData(response);
}

/* ===================== API v1 – CHECK IN / OUT (BỔ SUNG) ===================== */
export async function checkIn(
  employeeId,
  workScheduleId,
  lat,
  lng,
  accuracyMeters
) {
  if (!employeeId) throw new Error("employeeId is required");
  if (!workScheduleId) throw new Error("workScheduleId is required");
  if (lat == null) throw new Error("lat is required");
  if (lng == null) throw new Error("lng is required");
  if (accuracyMeters == null)
    throw new Error("accuracyMeters is required");

  try {
    const response = await axiosClient.post(
      `${BASE_URL}/check-in`,
      { workScheduleId, lat, lng, accuracyMeters },
      { params: { employeeId } }
    );
    return extractData(response);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function checkOut(
  employeeId,
  workScheduleId,
  lat,
  lng,
  accuracyMeters
) {
  if (!employeeId) throw new Error("employeeId is required");
  if (!workScheduleId) throw new Error("workScheduleId is required");
  if (lat == null) throw new Error("lat is required");
  if (lng == null) throw new Error("lng is required");
  if (accuracyMeters == null)
    throw new Error("accuracyMeters is required");

  try {
    const response = await axiosClient.post(
      `${BASE_URL}/check-out`,
      { workScheduleId, lat, lng, accuracyMeters },
      { params: { employeeId } }
    );
    return extractData(response);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

/* ===================== API v1 – MY ATTENDANCES ===================== */
export async function getMyAttendances(
  employeeId,
  from,
  to
) {
  if (!employeeId) throw new Error("employeeId is required");
  if (!from) throw new Error("from date is required");
  if (!to) throw new Error("to date is required");

  const response = await axiosClient.get(
    `${BASE_URL}/my`,
    { params: { employeeId, from, to } }
  );

  const data = extractData(response);
  return Array.isArray(data) ? data : [];
}