const BASE_URL = "http://localhost:8080/api/v1/shifts";

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
 * Lấy danh sách ca làm việc đang active
 * GET /api/v1/shifts/active
 * @returns {Promise<Array>} Danh sách shifts
 */
export async function getActiveShifts() {
    const data = await fetchJson(`${BASE_URL}/active`);
    return Array.isArray(data) ? data : [];
}
