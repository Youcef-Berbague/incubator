<script setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/useAuthStore";
import SuperAdminDashboard from "../components/dashboards/SuperAdminDashboard.vue";

const router = useRouter();
const authStore = useAuthStore();

// Role constants (must match backend)
const ROLES = {
  superAdmin: 100,
  admin: 90,
  coach: 70,
  supervisor: 60,
  student: 40,
  guest: 10,
};

// Check if user is authenticated and has appropriate role
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push("/login");
  }
});

// Determine which dashboard component to show based on user role
const dashboardComponent = computed(() => {
  if (!authStore.user?.role) return null;

  const userRole = Array.isArray(authStore.user.role)
    ? Math.max(...authStore.user.role)
    : authStore.user.role;

  if (userRole >= ROLES.superAdmin) {
    return SuperAdminDashboard;
  } else if (userRole >= ROLES.admin) {
    // Future: AdminDashboard
    return null;
  } else if (userRole >= ROLES.coach) {
    // Future: CoachDashboard
    return null;
  } else if (userRole >= ROLES.supervisor) {
    // Future: SupervisorDashboard
    return null;
  } else if (userRole >= ROLES.student) {
    // Future: StudentDashboard
    return null;
  }

  return null;
});

const dashboardTitle = computed(() => {
  if (!authStore.user?.role) return "Dashboard";

  const userRole = Array.isArray(authStore.user.role)
    ? Math.max(...authStore.user.role)
    : authStore.user.role;

  if (userRole >= ROLES.superAdmin) return "Super Admin Dashboard";
  if (userRole >= ROLES.admin) return "Admin Dashboard";
  if (userRole >= ROLES.coach) return "Coach Dashboard";
  if (userRole >= ROLES.supervisor) return "Supervisor Dashboard";
  if (userRole >= ROLES.student) return "Student Dashboard";

  return "Dashboard";
});
</script>

<template>
  <div class="dashboard-page">
    <div v-if="authStore.isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading dashboard...</p>
    </div>

    <div v-else-if="!authStore.isAuthenticated" class="unauthorized-container">
      <h2>Access Denied</h2>
      <p>Please log in to access the dashboard.</p>
      <button @click="router.push('/login')" class="btn-primary">
        Go to Login
      </button>
    </div>

    <div v-else-if="dashboardComponent">
      <component :is="dashboardComponent" />
    </div>

    <div v-else class="no-dashboard-container">
      <h2>Dashboard Not Available</h2>
      <p>Your role does not have a dashboard configured yet.</p>
      <button @click="router.push('/')" class="btn-secondary">
        Go to Home
      </button>
    </div>
  </div>
</template>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.loading-container,
.unauthorized-container,
.no-dashboard-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e6edff;
  border-top: 4px solid #0066ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-container p,
.unauthorized-container p,
.no-dashboard-container p {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}

.unauthorized-container h2,
.no-dashboard-container h2 {
  font-size: 32px;
  color: #1a1a1a;
  margin-bottom: 10px;
}

.btn-primary,
.btn-secondary {
  padding: 14px 32px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  border: none;
}

.btn-primary {
  background: #0066ff;
  color: white;
  box-shadow: 0 4px 14px rgba(0, 102, 255, 0.25);
}

.btn-primary:hover {
  background: #0052cc;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 102, 255, 0.35);
}

.btn-secondary {
  background: white;
  color: #1a1a1a;
  border: 2px solid #e0e0e0;
}

.btn-secondary:hover {
  border-color: #1a1a1a;
  transform: translateY(-2px);
}
</style>
