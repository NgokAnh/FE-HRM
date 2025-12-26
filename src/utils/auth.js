export function getUser() {
  return JSON.parse(localStorage.getItem("user"));
}

export function login(role) {
  localStorage.setItem(
    "user",
    JSON.stringify({ role }) // "admin" | "employee"
  );
}

export function logout() {
  localStorage.removeItem("user");
}