const BASE_URL = "http://localhost:8080/api/v1/shifts";

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  // DELETE returns 204
  if (res.status === 204) return null;

  let body;
  try {
    body = await res.json();
  } catch (e) {
    console.error("Failed to parse JSON response:", e);
  }

  if (!res.ok) {
    const msg =
      body?.message || body?.error || body?.msg || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = body;
    throw err;
  }

  // Nếu BE bọc { data: ... } thì unwrap
  return body && typeof body === "object" && "data" in body ? body.data : body;
}

/** GET /api/v1/shifts */
export async function getShifts() {
  const data = await fetchJson(BASE_URL);
  if (!Array.isArray(data)) {
    throw new Error("Expected shifts array but got: " + typeof data);
  }
  return data;
}

/** GET /api/v1/shifts/active */
export async function getActiveShifts() {
  const data = await fetchJson(`${BASE_URL}/active`);
  if (!Array.isArray(data)) {
    throw new Error("Expected active shifts array but got: " + typeof data);
  }
  return data;
}

/** GET /api/v1/shifts/{id} */
export function getShift(id) {
  if (id === undefined || id === null) throw new Error("id is required");
  return fetchJson(`${BASE_URL}/${id}`);
}

/** GET /api/v1/shifts/search?name=... */
export async function searchShiftsByName(name) {
  if (name === undefined || name === null) throw new Error("name is required");
  const q = encodeURIComponent(String(name));
  const data = await fetchJson(`${BASE_URL}/search?name=${q}`);
  if (!Array.isArray(data)) {
    throw new Error("Expected shifts array but got: " + typeof data);
  }
  return data;
}

/** POST /api/v1/shifts */
export function createShift(dto) {
  if (!dto) throw new Error("dto is required");
  return fetchJson(BASE_URL, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

/** PATCH /api/v1/shifts/{id} */
export function updateShift(id, dto) {
  if (id === undefined || id === null) throw new Error("id is required");
  if (!dto) throw new Error("dto is required");

  return fetchJson(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

/** DELETE /api/v1/shifts/{id}  (BE trả 204) */
export async function deleteShift(id) {
  if (id === undefined || id === null) throw new Error("id is required");
  await fetchJson(`${BASE_URL}/${id}`, { method: "DELETE" });
}
