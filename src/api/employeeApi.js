import axiosClient from './axiosClient';

const BASE_URL = "/employees";

// Helper to extract data from response
const extractData = (response) => {
  const body = response.data;
  return body && typeof body === "object" && "data" in body ? body.data : body;
};

export async function getEmployees() {
  const response = await axiosClient.get(BASE_URL);
  const data = extractData(response);
  if (!Array.isArray(data)) {
    // nếu không phải array, ném lỗi thay vì trả []
    throw new Error("Expected employees array but got: " + typeof data);
  }
  return data;
}

export async function getEmployee(id) {
  if (id === undefined || id === null) throw new Error("id is required");
  const response = await axiosClient.get(`${BASE_URL}/${id}`);
  return extractData(response);
}

export async function createEmployee(dto) {
  if (!dto) throw new Error("dto is required");
  const response = await axiosClient.post(BASE_URL, dto);
  return extractData(response);
}

export async function updateEmployeeBasicInfo(id, employee) {
  if (id === undefined || id === null) throw new Error("id is required");
  if (!employee) throw new Error("employee is required");
  const response = await axiosClient.put(`${BASE_URL}/${id}/basic-info`, employee);
  return extractData(response);
}

export async function deleteEmployee(id) {
  if (id === undefined || id === null) throw new Error("id is required");
  await axiosClient.delete(`${BASE_URL}/${id}`);
}

/**
 * Lấy danh sách nhân viên đang làm (active)
 * GET /api/v1/employees/active
 * @returns {Promise<Array>} Danh sách nhân viên active
 */
export async function getActiveEmployees() {
  const response = await axiosClient.get(`${BASE_URL}/active`);
  const data = extractData(response);
  return Array.isArray(data) ? data : [];
}
