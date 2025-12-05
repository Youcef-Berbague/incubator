// src/api-client.js
import axios from "axios";
import { useAuthStore } from "./stores/useAuthStore";
import { loadFingerprint } from "./utils/getFingerprint";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASEURL,
  withCredentials: true,
});

// ✅ كاش للـ fingerprint لتفادي التحميل كل مرة
let cachedFingerprint = null;

// لمنع تكرار refresh
let isRefreshing = false;
let refreshPromise = null;

// ✅ Request Interceptor → قبل الإرسال
api.interceptors.request.use(
  async (config) => {
    try {
      // تحميل fingerprint مرة واحدة فقط في الجلسة
      if (!cachedFingerprint) {
        cachedFingerprint = await loadFingerprint();
      }

      // إضافة الـ fingerprint للهيدر
      if (cachedFingerprint) {
        // نحوله لنص JSON قبل الإرسال
        config.headers["x-fingerprint"] = JSON.stringify(cachedFingerprint);
      }

      return config;
    } catch (err) {
      console.error("Fingerprint failed to load:", err);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // لو ما فيه status (خطأ شبكة مثلاً)
    if (!status) return Promise.reject(error);

    // تجاهل /auth/refresh نفسه و /auth/login و /auth/register
    const authEndpoints = ["/auth/refresh", "/auth/login", "/auth/register"];
    if (
      authEndpoints.some((endpoint) => originalRequest.url?.includes(endpoint))
    ) {
      const authStore = useAuthStore();
      if (originalRequest.url?.includes("/auth/refresh")) {
        authStore.user = null;
        authStore.isInitialized = true;
      }
      return Promise.reject(error);
    }

    // Handle 401 errors - attempt to refresh token
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // إذا ما فيه refresh جارٍ → نبدأه
      if (!isRefreshing) {
        isRefreshing = true;
        const authStore = useAuthStore();

        refreshPromise = api
          .get("/auth/refresh")
          .then(() => {
            // Successfully refreshed
            console.log("[API] Token refreshed successfully");
          })
          .catch((err) => {
            // إذا فشل refresh → امسح المستخدم
            console.error("[API] Refresh failed:", err);
            authStore.user = null;
            authStore.isInitialized = true;
            throw new Error("Session expired");
          })
          .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
      }

      try {
        await refreshPromise;
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login if needed
        const authStore = useAuthStore();
        authStore.user = null;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
