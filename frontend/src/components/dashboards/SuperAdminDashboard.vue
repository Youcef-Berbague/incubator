<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/useAuthStore";
import axios from "axios";

const router = useRouter();
const authStore = useAuthStore();
const showUserMenu = ref(false);

// Dashboard data
const stats = ref({
  totalRegistrations: 0,
  pendingRegistrations: 0,
  approvedRegistrations: 0,
  totalUsers: 0,
});

const recentRegistrations = ref([]);
const loading = ref(false);
const error = ref("");

// Fetch dashboard data
const fetchDashboardData = async () => {
  loading.value = true;
  error.value = "";

  try {
    // Fetch registrations statistics
    const registrationsRes = await axios.get(
      "http://localhost:3000/api/registrations?page=1&limit=5",
      { withCredentials: true }
    );

    if (registrationsRes.data.success) {
      const data = registrationsRes.data.data;
      stats.value.totalRegistrations = data.pagination.total;
      recentRegistrations.value = data.registrations;

      // Calculate pending and approved from the registrations list
      stats.value.pendingRegistrations = data.registrations.filter(
        (r) => r.status === "pending"
      ).length;
      stats.value.approvedRegistrations = data.registrations.filter(
        (r) => r.status === "approved"
      ).length;

      // Fetch all registrations for accurate counts
      const allRegistrationsRes = await axios.get(
        "http://localhost:3000/api/registrations?limit=1000",
        { withCredentials: true }
      );

      if (allRegistrationsRes.data.success) {
        const allRegs = allRegistrationsRes.data.data.registrations;
        stats.value.pendingRegistrations = allRegs.filter(
          (r) => r.status === "pending"
        ).length;
        stats.value.approvedRegistrations = allRegs.filter(
          (r) => r.status === "approved"
        ).length;
      }
    }

    // TODO: Fetch users count (when users endpoint is available)
    stats.value.totalUsers = 0;
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    if (err.response?.status === 401 || err.response?.status === 403) {
      error.value = "You don't have permission to access this data.";
    } else {
      error.value = "Failed to load dashboard data. Please try again.";
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDashboardData();
});

const handleLogout = async () => {
  await authStore.logout();
  showUserMenu.value = false;
  router.push("/");
};

const navigateHome = () => {
  router.push("/");
};

const viewAllRegistrations = () => {
  // TODO: Navigate to registrations management page
  console.log("View all registrations");
};

const viewRegistration = (id) => {
  // TODO: Navigate to registration detail page
  console.log("View registration:", id);
};

// Status badge color
const getStatusColor = (status) => {
  const colors = {
    pending: "#ff9800",
    in_review: "#2196f3",
    approved: "#4caf50",
    rejected: "#f44336",
    revision_required: "#ff5722",
    withdrawn: "#9e9e9e",
  };
  return colors[status] || "#666";
};

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<template>
  <div class="super-admin-dashboard">
    <!-- Navigation -->
    <nav class="dashboard-navbar">
      <div class="container">
        <div class="logo" @click="navigateHome">
          <span class="logo-text">Badji Mokhtar University</span>
          <span class="logo-sub">Super Admin Panel</span>
        </div>

        <div class="nav-right">
          <div class="user-menu-wrapper">
            <button class="user-menu-btn" @click="showUserMenu = !showUserMenu">
              <span class="user-avatar">{{
                authStore.userName?.charAt(0) || "U"
              }}</span>
              <span class="user-name">{{ authStore.userName }}</span>
              <span class="dropdown-arrow">▼</span>
            </button>

            <div v-if="showUserMenu" class="user-dropdown">
              <div class="user-info">
                <p class="user-full-name">{{ authStore.userName }}</p>
                <p class="user-email">{{ authStore.userEmail }}</p>
                <p class="user-role">Super Administrator</p>
              </div>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item" @click="router.push('/')">
                View Website
              </button>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item logout-btn" @click="handleLogout">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="dashboard-content">
      <div class="container">
        <!-- Header -->
        <div class="dashboard-header">
          <div>
            <h1>Welcome back, {{ authStore.userName?.split(" ")[0] }}!</h1>
            <p>Here's what's happening with your incubator today.</p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>

        <!-- Stats Cards -->
        <div v-else class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: #e3f2fd">
              <span style="color: #2196f3">📊</span>
            </div>
            <div class="stat-content">
              <h3>Total Registrations</h3>
              <p class="stat-number">{{ stats.totalRegistrations }}</p>
              <span class="stat-label">All time projects</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: #fff3e0">
              <span style="color: #ff9800">⏳</span>
            </div>
            <div class="stat-content">
              <h3>Pending Review</h3>
              <p class="stat-number">{{ stats.pendingRegistrations }}</p>
              <span class="stat-label">Awaiting approval</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: #e8f5e9">
              <span style="color: #4caf50">✅</span>
            </div>
            <div class="stat-content">
              <h3>Approved</h3>
              <p class="stat-number">{{ stats.approvedRegistrations }}</p>
              <span class="stat-label">Active projects</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: #f3e5f5">
              <span style="color: #9c27b0">👥</span>
            </div>
            <div class="stat-content">
              <h3>Total Users</h3>
              <p class="stat-number">{{ stats.totalUsers }}</p>
              <span class="stat-label">Registered users</span>
            </div>
          </div>
        </div>

        <!-- Recent Registrations -->
        <div class="section-card">
          <div class="section-header">
            <div>
              <h2>Recent Project Registrations</h2>
              <p>Latest submissions from students and researchers</p>
            </div>
            <button class="btn-view-all" @click="viewAllRegistrations">
              View All
            </button>
          </div>

          <div v-if="recentRegistrations.length === 0" class="empty-state">
            <span class="empty-icon">📭</span>
            <p>No registrations yet</p>
          </div>

          <div v-else class="registrations-table">
            <table>
              <thead>
                <tr>
                  <th>Project Title</th>
                  <th>Faculty</th>
                  <th>Department</th>
                  <th>Students</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="registration in recentRegistrations"
                  :key="registration.id"
                >
                  <td>
                    <div class="project-title">
                      {{ registration.projectTitle }}
                    </div>
                  </td>
                  <td>
                    {{
                      registration.faculty?.nameEn ||
                      registration.faculty?.name ||
                      "N/A"
                    }}
                  </td>
                  <td>
                    {{
                      registration.department?.nameEn ||
                      registration.department?.name ||
                      "N/A"
                    }}
                  </td>
                  <td>
                    <span class="badge badge-info">{{
                      registration.numberOfStudents
                    }}</span>
                  </td>
                  <td>
                    <span
                      class="status-badge"
                      :style="{
                        background: getStatusColor(registration.status),
                      }"
                    >
                      {{ registration.status.replace("_", " ") }}
                    </span>
                  </td>
                  <td>
                    <span class="date-text">{{
                      formatDate(registration.submittedAt)
                    }}</span>
                  </td>
                  <td>
                    <button
                      class="btn-action"
                      @click="viewRegistration(registration.id)"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="section-card">
          <div class="section-header">
            <div>
              <h2>Quick Actions</h2>
              <p>Common administrative tasks</p>
            </div>
          </div>

          <div class="quick-actions-grid">
            <button class="action-card" @click="viewAllRegistrations">
              <div class="action-icon">📋</div>
              <h3>Manage Registrations</h3>
              <p>Review and approve project submissions</p>
            </button>

            <button class="action-card">
              <div class="action-icon">👥</div>
              <h3>Manage Users</h3>
              <p>Add, edit, or remove user accounts</p>
            </button>

            <button class="action-card">
              <div class="action-icon">🏢</div>
              <h3>Manage Faculties</h3>
              <p>Configure faculties and departments</p>
            </button>

            <button class="action-card">
              <div class="action-icon">⚙️</div>
              <h3>System Settings</h3>
              <p>Configure system-wide settings</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.super-admin-dashboard {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  min-height: 100vh;
  background: #f5f5f5;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 30px;
  width: 100%;
}

/* Navigation */
.dashboard-navbar {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 20px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.dashboard-navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.5px;
}

.logo-sub {
  font-size: 11px;
  font-weight: 600;
  color: #0066ff;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* User Menu */
.user-menu-wrapper {
  position: relative;
}

.user-menu-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  border: 2px solid #e6edff;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.user-menu-btn:hover {
  border-color: #0066ff;
  background: #f8f9ff;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #0066ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  color: #1a1a1a;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  font-size: 10px;
  color: #666;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: white;
  border: 2px solid #e6edff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  min-width: 250px;
  z-index: 1000;
  animation: dropdownSlide 0.3s ease;
}

@keyframes dropdownSlide {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-info {
  padding: 16px;
  background: #f8f9ff;
  border-radius: 10px 10px 0 0;
}

.user-full-name {
  font-weight: 700;
  font-size: 15px;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.user-email {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.user-role {
  font-size: 12px;
  color: #0066ff;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dropdown-divider {
  height: 1px;
  background: #e6edff;
  margin: 8px 0;
}

.dropdown-item {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.dropdown-item:hover {
  background: #f8f9ff;
  color: #0066ff;
}

.logout-btn {
  color: #ff4444;
}

.logout-btn:hover {
  background: #fff5f5;
  color: #cc0000;
}

/* Dashboard Content */
.dashboard-content {
  padding: 40px 0 80px;
}

.dashboard-header {
  margin-bottom: 35px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.dashboard-header p {
  font-size: 16px;
  color: #666;
}

/* Error Message */
.error-message {
  background: #fff5f5;
  border: 2px solid #ffcccc;
  border-left: 4px solid #ff4444;
  color: #cc0000;
  padding: 14px 18px;
  border-radius: 8px;
  margin-bottom: 25px;
  font-size: 14px;
  font-weight: 600;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
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

.loading-state p {
  color: #666;
  font-size: 15px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  gap: 20px;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #e6edff;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stat-content h3 {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: #999;
}

/* Section Card */
.section-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.section-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.section-header p {
  font-size: 14px;
  color: #666;
}

.btn-view-all {
  background: #0066ff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.btn-view-all:hover {
  background: #0052cc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 102, 255, 0.3);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 16px;
  color: #999;
}

/* Registrations Table */
.registrations-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f8f9ff;
}

th {
  padding: 14px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 700;
  color: #1a1a1a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e6edff;
}

td {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: #1a1a1a;
}

tr:hover {
  background: #f8f9ff;
}

.project-title {
  font-weight: 600;
  color: #1a1a1a;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  text-transform: capitalize;
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge-info {
  background: #e3f2fd;
  color: #1976d2;
}

.date-text {
  font-size: 13px;
  color: #666;
}

.btn-action {
  background: #f0f0f0;
  color: #1a1a1a;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn-action:hover {
  background: #0066ff;
  color: white;
}

/* Quick Actions */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.action-card {
  background: #f8f9ff;
  border: 2px solid #e6edff;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  font-family: inherit;
}

.action-card:hover {
  background: white;
  border-color: #0066ff;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 102, 255, 0.15);
}

.action-icon {
  font-size: 36px;
  margin-bottom: 12px;
}

.action-card h3 {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 6px;
}

.action-card p {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 0 20px;
  }

  .dashboard-content {
    padding: 30px 0 60px;
  }

  .dashboard-header h1 {
    font-size: 26px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .section-card {
    padding: 20px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .registrations-table {
    font-size: 13px;
  }

  th,
  td {
    padding: 10px;
  }

  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
