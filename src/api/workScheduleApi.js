import axiosClient from './axiosClient';

const BASE_URL = "/work-schedules";

// Helper to extract data from response
const extractData = (response) => {
  const body = response.data;
  return body && typeof body === "object" && "data" in body ? body.data : body;
};

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
  const response = await axiosClient.get(BASE_URL);
  const data = extractData(response);
  if (!Array.isArray(data)) {
    throw new Error("Expected work schedules array but got: " + typeof data);
  }
  return data;
}

/** GET /api/v1/work-schedules/{id} */
export async function getWorkSchedule(id) {
  assertId(id, "id");
  const response = await axiosClient.get(`${BASE_URL}/${id}`);
  return extractData(response);
}

/** GET /api/v1/work-schedules/employee/{employeeId} */
export async function getWorkSchedulesByEmployee(employeeId) {
  assertId(employeeId, "employeeId");
  const response = await axiosClient.get(`${BASE_URL}/employee/${employeeId}`);
  const data = extractData(response);
  if (!Array.isArray(data)) throw new Error("Expected array but got: " + typeof data);
  return data;
}

/** GET /api/v1/work-schedules/shift/{shiftId} */
export async function getWorkSchedulesByShift(shiftId) {
  assertId(shiftId, "shiftId");
  const response = await axiosClient.get(`${BASE_URL}/shift/${shiftId}`);
  const data = extractData(response);
  if (!Array.isArray(data)) throw new Error("Expected array but got: " + typeof data);
  return data;
}

/** GET /api/v1/work-schedules/date/{workDate} */
export async function getWorkSchedulesByDate(workDate) {
  assertDate(workDate, "workDate");
  const response = await axiosClient.get(`${BASE_URL}/date/${workDate}`);
  const data = extractData(response);
  if (!Array.isArray(data)) throw new Error("Expected array but got: " + typeof data);
  return data;
}

/** GET /api/v1/work-schedules/employee/{employeeId}/date/{workDate} */
export async function getWorkSchedulesByEmployeeAndDate(employeeId, workDate) {
  assertId(employeeId, "employeeId");
  assertDate(workDate, "workDate");
  const response = await axiosClient.get(`${BASE_URL}/employee/${employeeId}/date/${workDate}`);
  const data = extractData(response);
  if (!Array.isArray(data)) throw new Error("Expected array but got: " + typeof data);
  return data;
}

/**
 * GET /api/v1/work-schedules/employee/{employeeId}/date-range?startDate=...&endDate=...
 * trả về ResEmpListWorkSchedule (object)
 */
export async function getWorkSchedulesByEmployeeDateRange(employeeId, startDate, endDate) {
  assertId(employeeId, "employeeId");
  assertDate(startDate, "startDate");
  assertDate(endDate, "endDate");
  const qs = new URLSearchParams({ startDate, endDate }).toString();
  const response = await axiosClient.get(`${BASE_URL}/employee/${employeeId}/date-range?${qs}`);
  return extractData(response);
}

/** POST /api/v1/work-schedules  (body: WorkSchedule) */
export async function createWorkSchedule(workSchedule) {
  if (!workSchedule) throw new Error("workSchedule is required");
  const response = await axiosClient.post(BASE_URL, workSchedule);
  return extractData(response);
}

/** PUT /api/v1/work-schedules/{id} (body: WorkSchedule) */
export async function updateWorkSchedule(id, workSchedule) {
  assertId(id, "id");
  if (!workSchedule) throw new Error("workSchedule is required");
  const response = await axiosClient.patch(`${BASE_URL}/${id}`, workSchedule);
  return extractData(response);
}

/** DELETE /api/v1/work-schedules/{id} */
export async function deleteWorkSchedule(id) {
  assertId(id, "id");
  await axiosClient.delete(`${BASE_URL}/${id}`);
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

  const response = await axiosClient.get(`${BASE_URL}/exists?${qs}`);
  const data = extractData(response);
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

  const response = await axiosClient.get(
    `${BASE_URL}/shift/${shiftId}/date-range?startDate=${startDate}&endDate=${endDate}`
  );
  return extractData(response);
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

  const response = await axiosClient.get(
    `${BASE_URL}/employee/${employeeId}/date-range?startDate=${startDate}&endDate=${endDate}`
  );
  return extractData(response);
}