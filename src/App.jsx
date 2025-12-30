import { useEffect, useState } from "react";
import AppRoutes from "./routes/AppRoutes";
import { getAccount } from "./api/authApi";
import { isAuthenticated, logout } from "./utils/auth";

export default function App() {
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Verify token on app load
    const verifyAuth = async () => {
      if (!isAuthenticated()) {
        setIsVerifying(false);
        return;
      }

      try {
        console.log("🔍 Verifying existing token...");
        // Call /account to verify token is still valid
        await getAccount();
        console.log("✅ Token is valid");
      } catch (error) {
        console.error("❌ Token verification failed:", error);
        // Token invalid or expired, clear auth data
        logout();
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAuth();
  }, []);

  // Show loading while verifying
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra phiên đăng nhập...</p>
        </div>
      </div>
    );
  }

  return <AppRoutes />;
}