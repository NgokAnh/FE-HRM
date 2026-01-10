export function getUser() {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
}

export function getAccessToken() {
  return localStorage.getItem("access_token");
}

export function setAuth(user, accessToken) {
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("access_token", accessToken);
}

export function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("access_token");
}

export function isAuthenticated() {
  return !!getAccessToken() && !!getUser();
}

/**
 * Lấy thông tin user từ localStorage
 */
export function getCurrentUser() {
  const userStr = localStorage.getItem("user"); // key lưu user object
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (err) {
    console.error("Failed to parse user from localStorage", err);
    return null;
  }
}

/**
 * Lấy employeeId từ user lưu trong localStorage
 */
export function getCurrentUserId() {
  const user = getCurrentUser();
  return user?.id ?? null;
}