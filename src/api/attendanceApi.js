import axiosClient from './axiosClient';

const BASE_URL = "/attendances";

// Helper to extract data from response
const extractData = (response) => {
    const body = response.data;
    return body && typeof body === "object" && "data" in body ? body.data : body;
};

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
