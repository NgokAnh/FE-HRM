import { setAuth } from "../utils/auth";
import axiosClient from "./axiosClient";

const BASE_URL = "http://localhost:8080/api/v1/auth";

/**
 * Fetch JSON helper
 */
async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
    ...options,
  });

  if (res.status === 204) return null;

  let body;
  try {
    const text = await res.text();
    body = text ? JSON.parse(text) : null;
  } catch {
    throw new Error("Invalid JSON response from server");
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

  // unwrap { data: {...} } nếu backend bọc
  return body?.data ?? body;
}

/**
 * 🔐 LOGIN
 * POST /api/v1/auth/login
 * @param {Object} credentials { username, password }
 * @returns {Promise<{user, accessToken}>}
 */
export async function login(credentials) {
  if (!credentials?.username) throw new Error("username is required");
  if (!credentials?.password) throw new Error("password is required");

  const data = await fetchJson(`${BASE_URL}/login`, {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  const user = data?.user;
  const accessToken = data?.access_token;

  if (!user || !accessToken) {
    throw new Error("Invalid login response");
  }

  // ⛔️ QUAN TRỌNG: user.role PHẢI là object { id, name }
  setAuth(user, accessToken);

  return { user, accessToken };
}

/**
 * 👤 GET CURRENT ACCOUNT
 * GET /api/v1/auth/account
 */
export async function getAccount() {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) throw new Error("No access token");

  const res = await axiosClient.get("/auth/account");
  const data = res.data?.data ?? res.data;

  if (data?.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  return data;
}

/**
 * 🔁 REFRESH TOKEN
 * GET /api/v1/auth/refresh
 */
export async function refreshToken() {
  const data = await fetchJson(`${BASE_URL}/refresh`);

  const user = data?.user;
  const accessToken = data?.access_token;

  if (user && accessToken) {
    setAuth(user, accessToken);
  }

  return { user, accessToken };
}

/**
 * 🚪 LOGOUT
 * POST /api/v1/auth/logout
 */
export async function logout() {
  const accessToken = localStorage.getItem("access_token");

  await fetchJson(`${BASE_URL}/logout`, {
    method: "POST",
    headers: accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {},
  });

  // clear local
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
}