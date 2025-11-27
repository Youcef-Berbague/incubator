// src/stores/useAuthStore.js
import { defineStore } from "pinia";
import api from "../api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    isLoading: false,
    error: null,
    isInitialized: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    userRole: (state) => state.user?.role || null,
    userName: (state) => {
      if (!state.user) return null;
      const firstName = state.user.first_name || "";
      const lastName = state.user.last_name || "";
      return `${firstName} ${lastName}`.trim() || null;
    },
    userEmail: (state) => state.user?.email || null,
  },

  actions: {
    // Login action
    async login(email, password, rememberMe = false) {
      this.isLoading = true;
      this.error = null;

      try {
        await api.post("/api/auth/login", { email, password, rememberMe });
        const userRes = await api.get("/api/users/me");
        this.user = userRes.data;
        return true;
      } catch (err) {
        const response = err.response;
        console.log(response);
        if (!response) {
          this.error =
            "No response from server. Check your connection or try again later.";
        } else {
          // Use the message from the server
          this.error =
            response.data?.message || response.data?.error || "Login failed";
        }
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    // Check authentication status
    async checkAuth() {
      if (this.isInitialized) return;

      this.isLoading = true;
      try {
        const status = await api.get("/api/auth/status");
        if (status.data.authenticated) {
          const userRes = await api.get("/api/users/me");
          this.user = userRes.data;
        } else {
          this.user = null;
        }
      } catch (err) {
        this.user = null;
      } finally {
        this.isInitialized = true;
        this.isLoading = false;
      }
    },

    // Logout action
    async logout() {
      try {
        await api.post("/api/auth/logout");
      } catch (err) {
        console.warn("Logout failed");
      } finally {
        this.user = null;
        this.error = null;
        return true;
      }
    },

    // Clear error
    clearError() {
      this.error = null;
    },
  },
});
