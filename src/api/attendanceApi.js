import axiosClient from "./axiosClient";

const BASE_URL = "/attendances";

// Helper extract data
const extractData = (response) => {
  const body = response.data;
  return body && typeof body === "object" && "data" in body ? body.data : body;
};

/**
 * Lấy attendance của nhân viên theo workSchedule
 * GET /api/v1/attendances/my/{workScheduleId}?employeeId={employeeId}
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
 * Tóm tắt chấm công TOÀN CÔNG TY (v2 – backend summary)
 * GET /api/v2/attendances/weekly-summary
 */
export async function getAttendanceSummaryCompanyV2(startDate, endDate) {
  const response = await axiosClient.get(
    `${BASE_URL}/weekly-summary`,
    {
      baseURL: "/api/v2", // 👈 override baseURL CHỈ cho request này
      params: { startDate, endDate },
    }
  );

  const employees = response.data?.employees ?? [];

  const summary = {
    totalDays: 0,
    overtime: 0,     // hours
    late: 0,         // count
    earlyLeave: 0,   // count
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