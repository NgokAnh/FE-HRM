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