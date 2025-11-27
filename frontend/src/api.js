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

    // تجاهل /auth/refresh نفسه
    if (originalRequest.url === "/api/auth/refresh") {
      const authStore = useAuthStore();
      authStore.user = null; // نمسح المستخدم فقط
      return Promise.reject(error);
    }

    if (status === 401) {
      // إذا ما فيه refresh جارٍ → نبدأه
      if (!isRefreshing) {
        isRefreshing = true;
        const authStore = useAuthStore();

        refreshPromise = api
          .get("/api/auth/refresh")
          .catch(() => {
            // إذا فشل refresh → امسح المستخدم فقط
            authStore.user = null;
            throw new Error("Session expired");
          })
          .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
      }

      try {
        await refreshPromise;
        return api(originalRequest); // أعد الطلب الأصلي بعد نجاح refresh
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
