import axiosClient from "./axiosClient";

const BASE_URL = "/attendances";

// Helper extract data
const extractData = (response) => {
  const body = response.data;
  return body && typeof body === "object" && "data" in body ? body.data : body;
};

const extractErrorMessage = (error) => {
  const data = error?.response?.data;
  if (!data) return error?.message || "Request failed";
  if (typeof data === "string") return data;
  if (typeof data.message === "string") return data.message;
  if (typeof data.error === "string") return data.error;
  return error?.message || "Request failed";
};

/**
 * 🆕 API V2: Lấy thống kê chấm công tuần cho tất cả nhân viên (1 API call thay vì 751 calls)
 * GET /api/v2/attendances/weekly-summary?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * @param {string} startDate - Ngày bắt đầu (YYYY-MM-DD)
 * @param {string} endDate - Ngày kết thúc (YYYY-MM-DD)
 * @returns {Promise<Object>} { startDate, endDate, employees: [{ employee, statistics }] }
 */
export async function getWeeklyAttendanceSummary(startDate, endDate) {
    if (!startDate) throw new Error("startDate is required");
    if (!endDate) throw new Error("endDate is required");

    console.log("📡 [API V2] Calling weekly-summary:", { startDate, endDate });

    // Override baseURL to use v2 endpoint
    const response = await axiosClient.get(`/v2${BASE_URL}/weekly-summary`, {
        baseURL: 'http://localhost:8080/api',
        params: { startDate, endDate }
    });

    const data = extractData(response);
    console.log("📦 [API V2] Weekly summary response:", {
        employeeCount: data?.employees?.length || 0,
        dateRange: `${data?.startDate} ~ ${data?.endDate}`
    });

    return data;
}

/**
 * Lấy thông tin chấm công của một nhân viên cho work schedule cụ thể
 * GET /api/attendances/my/{workScheduleId}?employeeId={employeeId}
 * @param {number} workScheduleId - ID của work schedule
 * @param {number} employeeId - ID của nhân viên
 * @returns {Promise<Object|null>} Thông tin attendance hoặc null nếu chưa chấm công
 */
export async function getAttendanceByWorkSchedule(workScheduleId, employeeId) {
  if (!workScheduleId) throw new Error("workScheduleId is required");
  if (!employeeId) throw new Error("employeeId is required");

  try {
    const response = await axiosClient.get(
      `${BASE_URL}/my/${workScheduleId}?employeeId=${employeeId}`
    );
    return extractData(response);
  } catch (error) {
    if (error.response?.status === 404) return null;
    throw error;
  }
}

/**
 * Check-in
 * POST /api/v1/attendances/check-in?employeeId={employeeId}
 * Body: { workScheduleId, lat, lng, accuracyMeters }
 */
export async function checkIn(
  employeeId,
  workScheduleId,
  lat,
  lng,
  accuracyMeters
) {
  if (!employeeId) throw new Error("employeeId is required");
  if (!workScheduleId) throw new Error("workScheduleId is required");
  if (lat === undefined || lat === null) throw new Error("lat is required");
  if (lng === undefined || lng === null) throw new Error("lng is required");
  if (accuracyMeters === undefined || accuracyMeters === null)
    throw new Error("accuracyMeters is required");

  try {
    const response = await axiosClient.post(
      `${BASE_URL}/check-in?employeeId=${employeeId}`,
      {
        workScheduleId,
        lat,
        lng,
        accuracyMeters,
      }
    );
    return extractData(response);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

/**
 * Check-out
 * POST /api/v1/attendances/check-out?employeeId={employeeId}
 * Body: { workScheduleId, lat, lng, accuracyMeters }
 */
export async function checkOut(
  employeeId,
  workScheduleId,
  lat,
  lng,
  accuracyMeters
) {
  if (!employeeId) throw new Error("employeeId is required");
  if (!workScheduleId) throw new Error("workScheduleId is required");
  if (lat === undefined || lat === null) throw new Error("lat is required");
  if (lng === undefined || lng === null) throw new Error("lng is required");
  if (accuracyMeters === undefined || accuracyMeters === null)
    throw new Error("accuracyMeters is required");

  try {
    const response = await axiosClient.post(
      `${BASE_URL}/check-out?employeeId=${employeeId}`,
      {
        workScheduleId,
        lat,
        lng,
        accuracyMeters,
      }
    );
    return extractData(response);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

/**
 * Lấy danh sách chấm công của bản thân theo khoảng ngày
 * GET /api/v1/attendances/my?employeeId={employeeId}&from={date}&to={date}
 */
export async function getMyAttendances(employeeId, from, to) {
  if (!employeeId) throw new Error("employeeId is required");
  if (!from) throw new Error("from date is required");
  if (!to) throw new Error("to date is required");

  const response = await axiosClient.get(`${BASE_URL}/my`, {
    params: {
      employeeId,
      from,
      to,
    },
  });
  const data = extractData(response);
  return Array.isArray(data) ? data : [];
}

/**
 * Tóm tắt chấm công TOÀN CÔNG TY (v2 – backend summary)
 * GET /api/v2/attendances/weekly-summary
 */
export async function getAttendanceSummaryCompanyV2(startDate, endDate) {
  const response = await axiosClient.get(`${BASE_URL}/weekly-summary`, {
    baseURL: "/api/v2", // 👈 override baseURL CHỈ cho request này
    params: { startDate, endDate },
  });

  const employees = response.data?.employees ?? [];

  const summary = {
    totalDays: 0,
    overtime: 0, // hours
    late: 0, // count
    earlyLeave: 0, // count
  };

  employees.forEach(({ statistics }) => {
    if (!statistics) return;

    summary.totalDays += statistics.worked?.count || 0;
    summary.overtime += (statistics.overtime?.totalMinutes || 0) / 60;
    summary.late += statistics.late?.count || 0;
    summary.earlyLeave += statistics.earlyLeave?.count || 0;
  });

  console.log("📊 COMPANY attendance summary (v2):", summary);
  return summary;
}
