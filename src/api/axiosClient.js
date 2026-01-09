import axios from "axios";
import { getAccessToken, logout } from "../utils/auth";
import { refreshToken } from "./authApi";

/* =======================
   AXIOS V1 (GIỮ NGUYÊN)
   ======================= */
const axiosClient = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/* =======================
   AXIOS V2 (THÊM MỚI)
   ======================= */
const axiosV2 = axios.create({
  baseURL: "http://localhost:8080/api/v2",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/* =======================
   INTERCEPTOR DÙNG CHUNG
   ======================= */
const attachInterceptors = (instance) => {
  // Request
  instance.interceptors.request.use(
    (config) => {
      const isAuthEndpoint =
        config.url?.includes("/auth/login") ||
        config.url?.includes("/auth/refresh");

      if (!isAuthEndpoint) {
        const token = getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          console.log("🔄 Access token expired, refreshing...");
          const result = await refreshToken();
          const newToken = result?.accessToken;

          if (newToken) {
            console.log("✅ Token refreshed successfully");
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return instance(originalRequest);
          }
        } catch (refreshError) {
          console.error("❌ Token refresh failed:", refreshError);
          logout();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

/* =======================
   GẮN INTERCEPTOR
   ======================= */
attachInterceptors(axiosClient);
attachInterceptors(axiosV2);

/* =======================
   EXPORT
   ======================= */
export { axiosV2 };
export default axiosClient;