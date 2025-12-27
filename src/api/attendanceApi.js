const BASE_URL = "http://localhost:8080/api/attendances";

async function fetchJson(url, options = {}) {
    const res = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
        ...options,
    });

    if (res.status === 204) return null;

    let body;
    try {
        body = await res.json();
    } catch (e) {
        console.error("Failed to parse JSON response:", e);
    }

    if (!res.ok) {
        const msg = body?.message || body?.error || body?.msg || `Request failed (${res.status})`;
        const err = new Error(msg);
        err.status = res.status;
        err.data = body;
        throw err;
    }

    return body && typeof body === "object" && "data" in body ? body.data : body;
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
        const data = await fetchJson(`${BASE_URL}/my/${workScheduleId}?employeeId=${employeeId}`);
        return data;
    } catch (error) {
        // Nếu chưa có attendance record, API có thể trả 404
        if (error.status === 404) {
            return null;
        }
        throw error;
    }
}
