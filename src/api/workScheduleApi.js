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
    const msg =
      body?.message ||
      body?.error ||
      body?.msg ||
      `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = body;
    throw err;
  }

  // hỗ trợ kiểu response { data: ... } hoặc trả thẳng
  return body && typeof body === "object" && "data" in body ? body.data : body;
}

function assertId(id, name = "id") {
  if (id === undefined || id === null || id === "") {
    throw new Error(`${name} is required`);
  }
}

function assertDate(dateStr, name = "date") {
  if (!dateStr) throw new Error(`${name} is required`);
  // basic check YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateStr))) {
    throw new Error(`${name} must be YYYY-MM-DD`);
  }
}

/** GET /api/v1/work-schedules */
export async function getWorkSchedules() {
  const data = await fetchJson(BASE_URL);
  if (!Array.isArray(data)) {
    throw new Error("Expected work schedules array but got: " + typeof data);
  }
  return data;
}

/** GET /api/v1/work-schedules/{id} */
export function getWorkSchedule(id) {
  assertId(id, "id");
  return fetchJson(`${BASE_URL}/${id}`);
}

/** GET /api/v1/work-schedules/employee/{employeeId} */
export async function getWorkSchedulesByEmployee(employeeId) {
  assertId(employeeId, "employeeId");
  const data = await fetchJson(`${BASE_URL}/employee/${employeeId}`);
  if (!Array.isArray(data)) throw new Error("Expected array but got: " + typeof data);
  return data;
}

/** GET /api/v1/work-schedules/shift/{shiftId} */
export async function getWorkSchedulesByShift(shiftId) {
  assertId(shiftId, "shiftId");
  const data = await fetchJson(`${BASE_URL}/shift/${shiftId}`);
  if (!Array.isArray(data)) throw new Error("Expected array but got: " + typeof data);
  return data;
}

/** GET /api/v1/work-schedules/date/{workDate} */
export async function getWorkSchedulesByDate(workDate) {
  assertDate(workDate, "workDate");
  const data = await fetchJson(`${BASE_URL}/date/${workDate}`);
  if (!Array.isArray(data)) throw new Error("Expected array but got: " + typeof data);
  return data;
}

/** GET /api/v1/work-schedules/employee/{employeeId}/date/{workDate} */
export async function getWorkSchedulesByEmployeeAndDate(employeeId, workDate) {
  assertId(employeeId, "employeeId");
  assertDate(workDate, "workDate");
  const data = await fetchJson(`${BASE_URL}/employee/${employeeId}/date/${workDate}`);
  if (!Array.isArray(data)) throw new Error("Expected array but got: " + typeof data);
  return data;
}

/**
 * GET /api/v1/work-schedules/employee/{employeeId}/date-range?startDate=...&endDate=...
 * trả về ResEmpListWorkSchedule (object)
 */
export function getWorkSchedulesByEmployeeDateRange(employeeId, startDate, endDate) {
  assertId(employeeId, "employeeId");
  assertDate(startDate, "startDate");
  assertDate(endDate, "endDate");
  const qs = new URLSearchParams({ startDate, endDate }).toString();
  return fetchJson(`${BASE_URL}/employee/${employeeId}/date-range?${qs}`);
}

/** POST /api/v1/work-schedules  (body: WorkSchedule) */
export function createWorkSchedule(workSchedule) {
  if (!workSchedule) throw new Error("workSchedule is required");
  return fetchJson(BASE_URL, {
    method: "POST",
    body: JSON.stringify(workSchedule),
  });
}

/** PUT /api/v1/work-schedules/{id} (body: WorkSchedule) */
export function updateWorkSchedule(id, workSchedule) {
  assertId(id, "id");
  if (!workSchedule) throw new Error("workSchedule is required");
  return fetchJson(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(workSchedule),
  });
}

/** DELETE /api/v1/work-schedules/{id} */
export async function deleteWorkSchedule(id) {
  assertId(id, "id");
  await fetchJson(`${BASE_URL}/${id}`, { method: "DELETE" });
}

/**
 * GET /api/v1/work-schedules/exists?employeeId=...&shiftId=...&workDate=...
 * trả về boolean
 */
export async function existsWorkSchedule(employeeId, shiftId, workDate) {
  assertId(employeeId, "employeeId");
  assertId(shiftId, "shiftId");
  assertDate(workDate, "workDate");

  const qs = new URLSearchParams({
    employeeId: String(employeeId),
    shiftId: String(shiftId),
    workDate: String(workDate),
  }).toString();

  const data = await fetchJson(`${BASE_URL}/exists?${qs}`);
  return !!data;
}
/**
 * Lấy danh sách phân công làm việc của một ca trong khoảng thời gian
 * GET /api/v1/work-schedules/shift/{shiftId}/date-range?startDate=...&endDate=...
 * @param {number} shiftId - ID của ca làm việc
 * @param {string} startDate - Ngày bắt đầu (YYYY-MM-DD)
 * @param {string} endDate - Ngày kết thúc (YYYY-MM-DD)
 * @returns {Promise<Object>} ResShiftListWorkSchedule
 */
export async function getWorkSchedulesByShiftAndDateRange(shiftId, startDate, endDate) {
  if (!shiftId) throw new Error("shiftId is required");
  if (!startDate) throw new Error("startDate is required");
  if (!endDate) throw new Error("endDate is required");

  const data = await fetchJson(
    `${BASE_URL}/shift/${shiftId}/date-range?startDate=${startDate}&endDate=${endDate}`
  );
  return data;
}
/**
 * Lấy danh sách phân công làm việc của một nhân viên trong khoảng thời gian
 * GET /api/v1/work-schedules/employee/{employeeId}/date-range?startDate=...&endDate=...
 * @param {number} employeeId - ID của nhân viên
 * @param {string} startDate - Ngày bắt đầu (YYYY-MM-DD)
 * @param {string} endDate - Ngày kết thúc (YYYY-MM-DD)
 * @returns {Promise<Object>} ResEmpListWorkSchedule
 */
export async function getWorkSchedulesByEmployeeAndDateRange(employeeId, startDate, endDate) {
  if (!employeeId) throw new Error("employeeId is required");
  if (!startDate) throw new Error("startDate is required");
  if (!endDate) throw new Error("endDate is required");

  const data = await fetchJson(
    `${BASE_URL}/employee/${employeeId}/date-range?startDate=${startDate}&endDate=${endDate}`
  );
  return data;
}