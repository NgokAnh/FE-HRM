const BASE_URL = "http://localhost:8080/api/v1/employees";

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

export async function getEmployees() {
  const data = await fetchJson(BASE_URL);
  if (!Array.isArray(data)) {
    // nếu không phải array, ném lỗi thay vì trả []
    throw new Error("Expected employees array but got: " + typeof data);
  }
  return data;
}

export function getEmployee(id) {
  if (id === undefined || id === null) throw new Error("id is required");
  return fetchJson(`${BASE_URL}/${id}`);
}

export function createEmployee(dto) {
  if (!dto) throw new Error("dto is required");
  return fetchJson(BASE_URL, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateEmployeeBasicInfo(id, employee) {
  if (id === undefined || id === null) throw new Error("id is required");
  if (!employee) throw new Error("employee is required");
  return fetchJson(`${BASE_URL}/${id}/basic-info`, {
    method: "PUT",
    body: JSON.stringify(employee),
  });
}

export async function deleteEmployee(id) {
  if (id === undefined || id === null) throw new Error("id is required");
  await fetchJson(`${BASE_URL}/${id}`, { method: "DELETE" });
}

/**
 * Lấy danh sách nhân viên đang làm (active)
 * GET /api/v1/employees/active
 * @returns {Promise<Array>} Danh sách nhân viên active
 */
export async function getActiveEmployees() {
  const data = await fetchJson(`${BASE_URL}/active`);
  return Array.isArray(data) ? data : [];
}
