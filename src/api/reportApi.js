import axiosClient from "./axiosClient";

const BASE_URL = "/reports";

/**
 * Báo cáo tổng quan
 * GET /api/v1/reports/overview
 * permission: REPORT
 */
export async function getReportOverview() {
  const res = await axiosClient.get(`${BASE_URL}/overview`);
  return res.data.data;
}

/**
 * Báo cáo chấm công
 * GET /api/v1/reports/attendance
 */
export async function getAttendanceReport({ month, year } = {}) {
  const params = { month, year };
  const res = await axiosClient.get(`${BASE_URL}/attendance`, { params });
  return res.data.data;
}

/**
 * Báo cáo lương
 * GET /api/v1/reports/salary
 */
export async function getSalaryReport({ month, year } = {}) {
  const params = { month, year };
  const res = await axiosClient.get(`${BASE_URL}/salary`, { params });
  return res.data.data;
}

/**
 * Xuất Excel báo cáo
 * GET /api/v1/reports/export
 */
export async function exportReport(type, { month, year } = {}) {
  const params = { type, month, year };

  const res = await axiosClient.get(`${BASE_URL}/export`, {
    params,
    responseType: "blob",
  });

  return res.data;
}