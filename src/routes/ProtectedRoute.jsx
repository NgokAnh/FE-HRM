import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

export default function ProtectedRoute({ children, role }) {
  // Check if user is authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Check role if required
  if (role) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.role !== role) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}