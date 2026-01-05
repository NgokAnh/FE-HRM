import axiosClient from './axiosClient';

const BASE_URL = "/attendances";

// Helper to extract data from response
const extractData = (response) => {
    const body = response.data;
    return body && typeof body === "object" && "data" in body ? body.data : body;
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
        const response = await axiosClient.get(`${BASE_URL}/my/${workScheduleId}?employeeId=${employeeId}`);
        return extractData(response);
    } catch (error) {
        // Nếu chưa có attendance record, API có thể trả 404
        if (error.response?.status === 404) {
            return null;
        }
        throw error;
    }
}
