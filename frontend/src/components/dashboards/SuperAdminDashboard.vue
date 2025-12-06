<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/useAuthStore";
import api from "../../api.js";

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

// Fetch dashboard data with retry mechanism for initial load
const fetchDashboardData = async (retryCount = 0) => {
  loading.value = true;
  error.value = "";

  try {
    // Fetch registrations statistics
    const registrationsRes = await api.get("/registrations?page=1&limit=5");

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
      const allRegistrationsRes = await api.get("/registrations?limit=1000");

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

    // Fetch users count
    try {
      const usersRes = await api.get("/users/all");

      if (usersRes.data.success) {
        stats.value.totalUsers =
          usersRes.data.total || usersRes.data.data.length;
      } else {
        // Fallback if response structure is different
        stats.value.totalUsers = Array.isArray(usersRes.data)
          ? usersRes.data.length
          : 0;
      }
    } catch (usersErr) {
      console.error("Error fetching users count:", usersErr);
      stats.value.totalUsers = 0;
    }
  } catch (err) {
    console.error("Error fetching dashboard data:", err);

    // If it's a 401/403 error and this is the first attempt, retry once after a short delay
    // This handles the case where cookies aren't set immediately after login
    if (
      (err.response?.status === 401 || err.response?.status === 403) &&
      retryCount === 0
    ) {
      console.log("[Dashboard] Retrying after authentication delay...");
      setTimeout(() => {
        fetchDashboardData(1); // Retry once
      }, 500); // Wait 500ms for cookies to be set
      return; // Don't set loading to false yet
    }

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
  // Small delay to ensure cookies from login are properly set
  // This prevents 401 errors when dashboard loads immediately after login
  setTimeout(() => {
    fetchDashboardData();
  }, 100);
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
  router.push("/dashboard/registrations");
};

const viewRegistration = (id) => {
  router.push("/dashboard/registrations");
};

const manageUsers = () => {
  router.push("/dashboard/users");
};

const manageFaculties = () => {
  router.push("/dashboard/faculties");
};

const manageFAQs = () => {
  router.push("/dashboard/faqs");
};

const manageAccelerationStatuses = () => {
  router.push("/dashboard/acceleration-statuses");
};

const manageLocations = () => {
  router.push("/dashboard/locations");
};

const managePartners = () => {
  router.push("/dashboard/partners");
};

const managePreIncubationStatuses = () => {
  router.push("/dashboard/pre-incubation-statuses");
};

const manageJuryMemberRoles = () => {
  router.push("/dashboard/jury-member-roles");
};

const manageJuries = () => {
  router.push("/dashboard/juries");
};

const manageAccount = () => {
  router.push("/dashboard/account");
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
          <img
            src="/incubator_logo.png"
            alt="Badji Mokhtar University Incubator"
            class="logo-img"
          />
          <div class="logo-text-container">
            <span class="logo-text">Badji Mokhtar University</span>
            <span class="logo-sub">Super Admin Panel</span>
          </div>
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
              <button
                class="dropdown-item"
                @click="
                  router.push('/dashboard/account');
                  showUserMenu = false;
                "
              >
                My Account Settings
              </button>
              <button
                class="dropdown-item"
                @click="
                  router.push('/');
                  showUserMenu = false;
                "
              >
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
      <!-- Sidebar -->
      <aside class="dashboard-sidebar">
        <div class="sidebar-header">
          <h3>Quick Actions</h3>
          <p>Common tasks</p>
        </div>

        <nav class="sidebar-nav">
          <button class="sidebar-item" @click="viewAllRegistrations">
            <div class="sidebar-icon">📋</div>
            <div class="sidebar-content">
              <h4>Registrations</h4>
              <p>Review submissions</p>
            </div>
          </button>

          <button class="sidebar-item" @click="manageUsers">
            <div class="sidebar-icon">👥</div>
            <div class="sidebar-content">
              <h4>Users</h4>
              <p>Manage accounts</p>
            </div>
          </button>

          <button class="sidebar-item" @click="manageJuries">
            <div class="sidebar-icon">⚖️</div>
            <div class="sidebar-content">
              <h4>Juries</h4>
              <p>Manage jury sessions</p>
            </div>
          </button>

          <div class="sidebar-divider"></div>
          <div class="sidebar-section-title">System Configuration</div>

          <button class="sidebar-item" @click="manageFaculties">
            <div class="sidebar-icon">🏢</div>
            <div class="sidebar-content">
              <h4>Faculties</h4>
              <p>Configure departments</p>
            </div>
          </button>

          <button class="sidebar-item" @click="manageFAQs">
            <div class="sidebar-icon">❓</div>
            <div class="sidebar-content">
              <h4>FAQs</h4>
              <p>Manage questions</p>
            </div>
          </button>

          <button class="sidebar-item" @click="manageAccelerationStatuses">
            <div class="sidebar-icon">🎯</div>
            <div class="sidebar-content">
              <h4>Acceleration Status</h4>
              <p>Project phases</p>
            </div>
          </button>

          <button class="sidebar-item" @click="managePreIncubationStatuses">
            <div class="sidebar-icon">🌱</div>
            <div class="sidebar-content">
              <h4>Pre-Incubation Status</h4>
              <p>Early stages</p>
            </div>
          </button>

          <button class="sidebar-item" @click="manageLocations">
            <div class="sidebar-icon">📍</div>
            <div class="sidebar-content">
              <h4>Locations</h4>
              <p>Manage venues</p>
            </div>
          </button>

          <button class="sidebar-item" @click="managePartners">
            <div class="sidebar-icon">🤝</div>
            <div class="sidebar-content">
              <h4>Partners</h4>
              <p>Stakeholders</p>
            </div>
          </button>

          <button class="sidebar-item" @click="manageJuryMemberRoles">
            <div class="sidebar-icon">👔</div>
            <div class="sidebar-content">
              <h4>Jury Roles</h4>
              <p>Member roles</p>
            </div>
          </button>

          <div class="sidebar-divider"></div>

          <button class="sidebar-item" @click="manageAccount">
            <div class="sidebar-icon">⚙️</div>
            <div class="sidebar-content">
              <h4>My Account</h4>
              <p>Update settings</p>
            </div>
          </button>
        </nav>
      </aside>

      <div class="dashboard-main">
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
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.super-admin-dashboard {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  min-height: 100vh;
  background: #f5f5f5;
  direction: ltr;
  text-align: left;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
}

/* Navigation */
.dashboard-navbar {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 12px 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.dashboard-navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-img {
  height: 50px;
  width: auto;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.logo-img:hover {
  transform: scale(1.05);
}

.logo-text-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.logo-text {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.3px;
}

.logo-sub {
  font-size: 11px;
  font-weight: 600;
  color: #23a455;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* User Menu */
.user-menu-wrapper {
  position: relative;
}

.user-menu-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 2px solid #e6edff;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.user-menu-btn:hover {
  border-color: #61ce70;
  background: #f0fdf4;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #61ce70 0%, #23a455 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
}

.user-name {
  font-weight: 600;
  font-size: 13px;
  color: #1a1a1a;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  font-size: 9px;
  color: #666;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: white;
  border: 2px solid #e8f5eb;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(97, 206, 112, 0.15);
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
  background: linear-gradient(135deg, #f0fdf4 0%, #e8f5eb 100%);
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
  color: #23a455;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dropdown-divider {
  height: 1px;
  background: #e8f5eb;
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
  background: #f0fdf4;
  color: #23a455;
}

.logout-btn {
  color: #ff6b6b;
}

.logout-btn:hover {
  background: #fff5f5;
  color: #e05555;
}

/* Dashboard Content */
.dashboard-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  background: #f5f5f5;
}

/* Sidebar */
.dashboard-sidebar {
  width: 240px;
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 20px 0;
  overflow-y: auto;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 0 20px 16px;
  border-bottom: 2px solid #f0f0f0;
  margin-bottom: 8px;
}

.sidebar-header h3 {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 3px;
  letter-spacing: -0.3px;
}

.sidebar-header p {
  font-size: 11px;
  color: #666;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-family: inherit;
  border-left: 3px solid transparent;
}

.sidebar-item:hover {
  background: #f0fdf4;
  border-left-color: #61ce70;
}

.sidebar-item:hover .sidebar-icon {
  transform: scale(1.1);
}

.sidebar-icon {
  font-size: 20px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 8px;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.sidebar-item:hover .sidebar-icon {
  background: #e8f5eb;
}

.sidebar-content {
  flex: 1;
}

.sidebar-content h4 {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 2px;
}

.sidebar-content p {
  font-size: 11px;
  color: #666;
  line-height: 1.3;
}

.sidebar-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 12px 20px;
}

.sidebar-section-title {
  padding: 12px 20px 8px;
  font-size: 11px;
  font-weight: 700;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Main Content Area */
.dashboard-main {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.dashboard-main .container {
  max-width: 1200px;
  padding: 30px 24px;
}

.dashboard-header {
  margin-bottom: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 6px;
  letter-spacing: -0.5px;
}

.dashboard-header p {
  font-size: 14px;
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
  border: 4px solid #e8f5eb;
  border-top: 4px solid #61ce70;
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
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  justify-items: stretch;
  align-items: stretch;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  gap: 16px;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 2px solid transparent;
  width: 100%;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(97, 206, 112, 0.15);
  border-color: #e8f5eb;
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.stat-content h3 {
  font-size: 11px;
  font-weight: 600;
  color: #666;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 3px;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

/* Section Card */
.section-card {
  background: white;
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.section-header h2 {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 3px;
}

.section-header p {
  font-size: 13px;
  color: #666;
}

.btn-view-all {
  background: linear-gradient(135deg, #61ce70 0%, #23a455 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  box-shadow: 0 4px 15px rgba(97, 206, 112, 0.25);
}

.btn-view-all:hover {
  background: linear-gradient(135deg, #23a455 0%, #1a8542 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(35, 164, 85, 0.4);
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
  background: linear-gradient(135deg, #f0fdf4 0%, #e8f5eb 100%);
}

th {
  padding: 14px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 700;
  color: #1a1a1a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #61ce70;
}

td {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: #1a1a1a;
}
tr:hover {
  background: #f0fdf4;
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

/* Responsive */
@media (max-width: 768px) {
  .super-admin-dashboard {
    height: auto;
    overflow: auto;
  }

  .dashboard-content {
    flex-direction: column;
    overflow: auto;
  }

  .dashboard-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
    padding: 16px 0;
    overflow-x: auto;
    overflow-y: visible;
  }

  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
    padding: 0 10px;
    gap: 8px;
  }

  .sidebar-item {
    flex-direction: column;
    min-width: 100px;
    padding: 10px;
    text-align: center;
    gap: 6px;
    border-left: none;
    border-bottom: 3px solid transparent;
  }

  .sidebar-item:hover {
    border-left-color: transparent;
    border-bottom-color: #61ce70;
  }

  .sidebar-content h4 {
    font-size: 11px;
  }

  .sidebar-content p {
    display: none;
  }

  .dashboard-main {
    overflow-y: visible;
  }

  .dashboard-main .container {
    padding: 20px 16px;
  }

  .dashboard-header h1 {
    font-size: 22px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .section-card {
    padding: 16px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .registrations-table {
    font-size: 12px;
  }

  th,
  td {
    padding: 8px;
  }
}
</style>
