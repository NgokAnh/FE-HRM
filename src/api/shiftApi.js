import axiosClient from './axiosClient';

const BASE_URL = "/shifts";

// Helper to extract data from response
const extractData = (response) => {
  const body = response.data;
  return body && typeof body === "object" && "data" in body ? body.data : body;
};

/** GET /api/v1/shifts */
export async function getShifts() {
  const response = await axiosClient.get(BASE_URL);
  const data = extractData(response);
  if (!Array.isArray(data)) {
    throw new Error("Expected shifts array but got: " + typeof data);
  }
  return data;
}

/** GET /api/v1/shifts/active */
export async function getActiveShifts() {
  const response = await axiosClient.get(`${BASE_URL}/active`);
  const data = extractData(response);
  if (!Array.isArray(data)) {
    throw new Error("Expected active shifts array but got: " + typeof data);
  }
  return data;
}

/** GET /api/v1/shifts/{id} */
export async function getShift(id) {
  if (id === undefined || id === null) throw new Error("id is required");
  const response = await axiosClient.get(`${BASE_URL}/${id}`);
  return extractData(response);
}

/** GET /api/v1/shifts/search?name=... */
export async function searchShiftsByName(name) {
  if (name === undefined || name === null) throw new Error("name is required");
  const q = encodeURIComponent(String(name));
  const response = await axiosClient.get(`${BASE_URL}/search?name=${q}`);
  const data = extractData(response);
  if (!Array.isArray(data)) {
    throw new Error("Expected shifts array but got: " + typeof data);
  }
  return data;
}

/** POST /api/v1/shifts */
export async function createShift(dto) {
  if (!dto) throw new Error("dto is required");
  const response = await axiosClient.post(BASE_URL, dto);
  return extractData(response);
}

/** PATCH /api/v1/shifts/{id} */
export async function updateShift(id, dto) {
  if (id === undefined || id === null) throw new Error("id is required");
  if (!dto) throw new Error("dto is required");
  const response = await axiosClient.put(`${BASE_URL}/${id}`, dto);
  return extractData(response);
}

/** DELETE /api/v1/shifts/{id}  (BE trả 204) */
export async function deleteShift(id) {
  if (id === undefined || id === null) throw new Error("id is required");
  await axiosClient.delete(`${BASE_URL}/${id}`);
}
