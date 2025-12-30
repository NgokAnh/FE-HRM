import { setAuth } from '../utils/auth';
import axiosClient from './axiosClient';

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
        const text = await res.text();
        console.log("🔍 Raw response text:", text.substring(0, 500)); // Log first 500 chars
        body = JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse JSON response:", e);
        throw new Error("Invalid JSON response from server");
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

    // fetchJson already unwrapped { statusCode, data: {...} } -> {...}
    // So data here is already the inner data object
    const accessToken = data?.access_token || data?.accessToken;
    const user = data?.user;

    if (user && accessToken) {
        console.log("💾 Storing auth data:", { user, hasToken: !!accessToken });
        setAuth(user, accessToken);
    } else {
        console.warn("⚠️ Response missing user or access_token:", data);
    }

    return { user, accessToken };
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

    console.log("📡 Calling /account with token:", accessToken.substring(0, 20) + "...");

    // Use axiosClient so interceptor automatically adds Authorization header
    const response = await axiosClient.get('/auth/account');
    const data = response.data?.data || response.data;

    console.log("✅ Account data received:", data);

    // Update user info in localStorage if it changed
    if (data.user) {
        const currentUser = localStorage.getItem('user');
        if (currentUser !== JSON.stringify(data.user)) {
            localStorage.setItem('user', JSON.stringify(data.user));
        }
    }

    return data;
}

/**
 * Refresh access token using refresh token (in cookie)
 * GET /api/v1/auth/refresh
 * @returns {Promise<Object>} { user: { id, email, name, role }, accessToken }
 */
export async function refreshToken() {
    const data = await fetchJson(`${BASE_URL}/refresh`);

    // fetchJson already unwrapped response
    const accessToken = data?.access_token || data?.accessToken;
    const user = data?.user;

    if (user && accessToken) {
        setAuth(user, accessToken);
    }

    return { user, accessToken };
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
