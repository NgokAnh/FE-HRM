const BASE_URL = "http://localhost:8080/api/v1/work-schedules";

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
 * Lấy danh sách phân công làm việc theo ngày
 * GET /api/v1/work-schedules/date/{workDate}
 * @param {string} workDate - Ngày làm việc (YYYY-MM-DD)
 * @returns {Promise<Array>} Danh sách work schedules
 */
export async function getWorkSchedulesByDate(workDate) {
    if (!workDate) throw new Error("workDate is required");
    const data = await fetchJson(`${BASE_URL}/date/${workDate}`);
    return Array.isArray(data) ? data : [];
}
