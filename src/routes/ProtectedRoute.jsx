import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

export default function ProtectedRoute({ children, allowedRoles }) {
  // 1. Chưa login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // 2. Kiểm tra role nếu có yêu cầu
  if (allowedRoles && allowedRoles.length > 0) {
    const user = JSON.parse(localStorage.getItem("user"));
    const roleName = user?.role?.name;

    if (!roleName || !allowedRoles.includes(roleName)) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}