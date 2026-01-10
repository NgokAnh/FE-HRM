import axiosClient from "./axiosClient";

const BASE_URL = "/employees";

/**
 * Chuẩn hoá response backend
 * - data
 * - data.data
 * - data.items
 */
const extractData = (response) => {
  const body = response?.data;

  if (!body) return body;

  // case: body itself is array
  if (Array.isArray(body)) return body;

  // case: { data: [...] } array
  if (Array.isArray(body.data)) return body.data;

  // case: { data: { items: [...] } }
  if (Array.isArray(body.data?.items)) return body.data.items;

  // case: { data: { ... } } single object
  if (body.data && typeof body.data === 'object') return body.data;

  // fallback
  return body;
};

// ===================== GET LIST =====================
export async function getEmployees() {
  const response = await axiosClient.get(BASE_URL);
  const data = extractData(response);

  if (!Array.isArray(data)) {
    console.error("getEmployees unexpected response:", response.data);
    throw new Error("Expected employees array");
  }

  return data;
}

// ===================== GET ACTIVE =====================
export async function getActiveEmployees() {
  const response = await axiosClient.get(`${BASE_URL}/active`);
  const data = extractData(response);
  return Array.isArray(data) ? data : [];
}

// ===================== GET DETAIL =====================
export async function getEmployee(id) {
  if (id === undefined || id === null) {
    throw new Error("id is required");
  }
  const response = await axiosClient.get(`${BASE_URL}/${id}`);
  return extractData(response);
}

// ===================== CREATE =====================
export async function createEmployee(dto) {
  if (!dto) throw new Error("dto is required");
  const response = await axiosClient.post(BASE_URL, dto);
  return extractData(response);
}

// ===================== UPDATE =====================
export async function updateEmployeeBasicInfo(id, employee) {
  if (id === undefined || id === null) throw new Error("id is required");
  if (!employee) throw new Error("employee is required");

  const response = await axiosClient.put(
    `${BASE_URL}/${id}`,
    employee
  );
  return extractData(response);
}

// ===================== DELETE =====================
export async function deleteEmployee(id) {
  if (id === undefined || id === null) throw new Error("id is required");
  await axiosClient.delete(`${BASE_URL}/${id}`);
}

// ===================== ACCOUNT =====================
export async function resetEmployeePassword(id, payload) {
  if (!id) throw new Error("id is required");
  if (!payload?.newPassword) {
    throw new Error("newPassword is required");
  }

  const response = await axiosClient.put(
    `${BASE_URL}/${id}/reset-password`,
    payload
  );

  return extractData(response);
}