import axiosClient, { axiosV2 } from "./axiosClient";

const BASE_URL = "/attendances";

/* ===================== Helpers ===================== */
const extractData = (response) => {
  const body = response.data;
  return body && typeof body === "object" && "data" in body
    ? body.data
    : body;
};

/* ===================== API v1 ===================== */
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
      {
        params: { employeeId },
      }
    );

    return extractData(response);
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/* ===================== API v2 ===================== */
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
    {
      params: { startDate, endDate },
    }
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