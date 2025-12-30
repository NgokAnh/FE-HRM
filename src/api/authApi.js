import { setAuth } from '../utils/auth';

const BASE_URL = "http://localhost:8080/api/v1/auth";

async function fetchJson(url, options = {}) {
    const res = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
        credentials: 'include', // Important for cookies
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
 * Login user
 * POST /api/v1/auth/login
 * @param {Object} credentials - { username, password }
 * @returns {Promise<Object>} { user: { id, email, name, role }, accessToken }
 */
export async function login(credentials) {
    if (!credentials.username) throw new Error("username is required");
    if (!credentials.password) throw new Error("password is required");

    console.log("📡 Calling login API...");
    const data = await fetchJson(`${BASE_URL}/login`, {
        method: "POST",
        body: JSON.stringify(credentials),
    });

    console.log("📦 Raw API response:", data);

    // Backend returns "access_token" (snake_case), not "accessToken"
    const accessToken = data.access_token || data.accessToken;

    if (data.user && accessToken) {
        console.log("💾 Storing auth data:", { user: data.user, hasToken: !!accessToken });
        setAuth(data.user, accessToken);
    } else {
        console.warn("⚠️ Response missing user or access_token:", data);
    }

    return { ...data, accessToken };
}

/**
 * Get current user account info
 * GET /api/v1/auth/account
 * @returns {Promise<Object>} { user: { id, email, name, role } }
 */
export async function getAccount() {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        throw new Error("No access token found");
    }

    const data = await fetchJson(`${BASE_URL}/account`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    return data;
}

/**
 * Refresh access token using refresh token (in cookie)
 * GET /api/v1/auth/refresh
 * @returns {Promise<Object>} { user: { id, email, name, role }, accessToken }
 */
export async function refreshToken() {
    const data = await fetchJson(`${BASE_URL}/refresh`);

    // Backend returns "access_token" (snake_case)
    const accessToken = data.access_token || data.accessToken;

    if (data.user && accessToken) {
        setAuth(data.user, accessToken);
    }

    return { ...data, accessToken };
}

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
export async function logout() {
    const accessToken = localStorage.getItem('access_token');

    await fetchJson(`${BASE_URL}/logout`, {
        method: "POST",
        headers: accessToken ? {
            Authorization: `Bearer ${accessToken}`,
        } : {},
    });
}
