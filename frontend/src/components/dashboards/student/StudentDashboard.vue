<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../../stores/useAuthStore";
import api from "../../../api.js";
import { ROLES, getHighestRole } from "../../../config/roles";
import StudentDashboardNav from "./components/StudentDashboardNav.vue";
import StudentDashboardSidebar from "./components/StudentDashboardSidebar.vue";
import StudentStatsGrid from "./components/StudentStatsGrid.vue";
import StudentProjectsSection from "./components/StudentProjectsSection.vue";
import StudentRegistrationSection from "./components/StudentRegistrationSection.vue";
import StudentAccessSection from "./components/StudentAccessSection.vue";
import StudentProfileSection from "./components/StudentProfileSection.vue";

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const error = ref("");
const lastUpdated = ref(null);

const summary = ref({
  projectCount: 0,
  hasRegistration: false,
  registrationStatus: null,
  assignedProjects: 0,
  canSelfServe: true,
  canManageProjects: false,
});

const profile = ref(null);
const projects = ref([]);
const registration = ref(null);
const roleSnapshot = ref(null);

const statusLabels = {
  pending: "Pending",
  in_review: "In Review",
  approved: "Approved",
  rejected: "Rejected",
  revision_required: "Revision Required",
  withdrawn: "Withdrawn",
};

const roleLabels = {
  [ROLES.superAdmin]: "Super Admin",
  [ROLES.admin]: "Admin",
  [ROLES.coach]: "Coach",
  [ROLES.supervisor]: "Supervisor",
  [ROLES.student]: "Student",
  [ROLES.guest]: "Guest",
};

const userName = computed(
  () => authStore.userName || profile.value?.first_name || "Student",
);
const userEmail = computed(
  () => authStore.userEmail || profile.value?.email || "N/A",
);
const currentRole = computed(() => getHighestRole(authStore.user?.role));
const currentRoleLabel = computed(
  () => roleLabels[currentRole.value] || "Student",
);
const userFirstName = computed(() => {
  const name = userName.value || "Student";
  return name.split(" ")[0] || name;
});
const registrationStatusLabel = computed(() => {
  if (!registration.value) return "No registration";
  return (
    statusLabels[registration.value.status] ||
    registration.value.status ||
    "Pending"
  );
});

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeRegistration = (item) => {
  if (!item) return null;

  return {
    id: item.id,
    title: item.title || "Untitled project",
    status: item.status || "pending",
    submittedAt: item.submitted_at || item.submittedAt || null,
    facultyName:
      item.faculty?.faculty_name_en ||
      item.faculty?.faculty_name ||
      item.faculties?.faculty_name_en ||
      item.faculties?.faculty_name ||
      item.faculty?.name ||
      item.faculties?.name ||
      "N/A",
    departmentName:
      item.department?.departement_name_en ||
      item.department?.departement_name ||
      item.departements?.departement_name_en ||
      item.departements?.departement_name ||
      item.department?.name ||
      item.departements?.name ||
      "N/A",
  };
};

const normalizeProject = (item) => {
  const department = item?.departements || item?.department || null;
  const faculty = department?.faculties || item?.faculty || null;

  return {
    id: item?.id,
    title: item?.title || "Untitled project",
    code: item?.project_code || "N/A",
    progress: Number(item?.progress_percent || 0),
    incubated: Boolean(item?.incubated),
    departmentName:
      department?.departement_name_en ||
      department?.departement_name ||
      department?.name ||
      "Unassigned",
    facultyName:
      faculty?.faculty_name_en ||
      faculty?.faculty_name ||
      faculty?.name ||
      "Unassigned",
    accelerationStatus:
      item?.acceleration_status_project_acceleration_statusToacceleration_status
        ?.acceleration_name ||
      item?.acceleration_status?.acceleration_name ||
      null,
    preIncubationStatus:
      item
        ?.pre_incubation_status_project_pre_incubation_statusTopre_incubation_status
        ?.status_name ||
      item?.pre_incubation_status?.status_name ||
      null,
    teamId: item?.project_team?.id || item?.team_id || null,
  };
};

const loadStudentDashboard = async () => {
  loading.value = true;
  error.value = "";

  try {
    const [
      dashboardSummaryResult,
      dashboardRoleResult,
      meSummaryResult,
      meProjectsResult,
      meRegistrationResult,
      meProfileResult,
    ] = await Promise.allSettled([
      api.get("/dashboard/summary"),
      api.get("/dashboard/role"),
      api.get("/users/me/summary"),
      api.get("/users/me/projects"),
      api.get("/users/me/registration"),
      api.get("/users/me"),
    ]);

    const dashboardSummary =
      dashboardSummaryResult.status === "fulfilled"
        ? dashboardSummaryResult.value.data?.data ||
          dashboardSummaryResult.value.data
        : null;
    const dashboardRole =
      dashboardRoleResult.status === "fulfilled"
        ? dashboardRoleResult.value.data?.data || dashboardRoleResult.value.data
        : null;
    const meSummary =
      meSummaryResult.status === "fulfilled"
        ? meSummaryResult.value.data?.data || meSummaryResult.value.data
        : null;
    const meProjects =
      meProjectsResult.status === "fulfilled"
        ? meProjectsResult.value.data?.data || meProjectsResult.value.data || []
        : [];
    const meRegistration =
      meRegistrationResult.status === "fulfilled"
        ? meRegistrationResult.value.data?.data ||
          meRegistrationResult.value.data ||
          null
        : null;
    const meProfile =
      meProfileResult.status === "fulfilled"
        ? meProfileResult.value.data?.data || meProfileResult.value.data || null
        : null;

    profile.value = meSummary?.user || meProfile || profile.value;
    projects.value = (
      meProjects.length > 0
        ? meProjects
        : meSummary?.projects || dashboardSummary?.projects || []
    ).map(normalizeProject);
    registration.value = normalizeRegistration(
      meRegistration ||
        meSummary?.registration ||
        dashboardSummary?.registration ||
        null,
    );
    roleSnapshot.value = dashboardRole || null;

    summary.value = {
      projectCount:
        meSummary?.projectCount ??
        dashboardSummary?.counts?.assignedProjects ??
        projects.value.length,
      hasRegistration:
        dashboardSummary?.counts?.hasRegistration ??
        Boolean(registration.value),
      registrationStatus: registration.value?.status || null,
      assignedProjects:
        dashboardSummary?.counts?.assignedProjects ?? projects.value.length,
      canSelfServe: dashboardRole?.canSelfServe ?? true,
      canManageProjects: dashboardRole?.canManageProjects ?? false,
    };

    const hadFailure =
      dashboardSummaryResult.status === "rejected" ||
      dashboardRoleResult.status === "rejected" ||
      meSummaryResult.status === "rejected" ||
      meProjectsResult.status === "rejected" ||
      meRegistrationResult.status === "rejected";

    if (hadFailure && !dashboardSummary && !meSummary) {
      error.value = "Some student dashboard data could not be loaded.";
    } else if (hadFailure) {
      error.value =
        "Some sections are unavailable right now, but the dashboard is still usable.";
    }

    lastUpdated.value = new Date();
  } catch (err) {
    console.error("Error loading student dashboard:", err);
    error.value =
      err.response?.data?.message || "Failed to load student dashboard data.";
  } finally {
    loading.value = false;
  }
};

const refreshDashboard = () => {
  loadStudentDashboard();
};

const goToAccount = () => {
  router.push("/dashboard/account");
};

const goHome = () => {
  router.push("/");
};

const handleLogout = async () => {
  await authStore.logout();
  router.push("/");
};

const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const getStatusClass = (status) => `status-pill status-${status || "pending"}`;

const getProjectProgressLabel = (project) => `${project.progress}% complete`;

onMounted(() => {
  loadStudentDashboard();
});
</script>

<template>
  <div class="student-dashboard">
    <StudentDashboardNav
      :user-name="userName"
      :user-email="userEmail"
      :role-label="currentRoleLabel"
      @home="goHome"
      @account="goToAccount"
      @logout="handleLogout"
    />

    <div class="dashboard-content">
      <StudentDashboardSidebar
        :project-count="projects.length"
        :has-registration="summary.hasRegistration"
        :registration-status-label="registrationStatusLabel"
        @scroll="scrollToSection"
        @account="goToAccount"
        @home="goHome"
        @refresh="refreshDashboard"
      />

      <div class="dashboard-main">
        <div class="container">
          <div class="dashboard-header">
            <div>
              <h1>Welcome back, {{ userFirstName }}!</h1>
              <p>Track your student progress and registration status.</p>
            </div>
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Loading dashboard data...</p>
          </div>

          <template v-else>
            <StudentStatsGrid
              :summary="summary"
              :registration-status-label="registrationStatusLabel"
              :current-role-label="currentRoleLabel"
            />

            <StudentProjectsSection
              section-id="projects-section"
              :projects="projects"
              @view-all="scrollToSection('projects-section')"
            />

            <StudentRegistrationSection
              section-id="registration-section"
              :registration="registration"
              :registration-status-label="registrationStatusLabel"
              :format-date-time="formatDateTime"
              @action="refreshDashboard"
            />

            <StudentAccessSection
              section-id="access-section"
              :role-snapshot="roleSnapshot"
              :current-role-label="currentRoleLabel"
              :current-role-value="currentRole"
            />

            <StudentProfileSection
              section-id="profile-section"
              :user-name="userName"
              :user-email="userEmail"
              :current-role-label="currentRoleLabel"
              :project-count="summary.projectCount"
              @account="goToAccount"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.student-dashboard {
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
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

.student-dashboard .container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
}

.student-dashboard .dashboard-navbar {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 12px 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.student-dashboard .dashboard-navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.student-dashboard .logo {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
}

.student-dashboard .logo-img {
  height: 50px;
  width: auto;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.student-dashboard .logo-img:hover {
  transform: scale(1.05);
}

.student-dashboard .logo-text-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.student-dashboard .logo-text {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.3px;
}

.student-dashboard .logo-sub {
  font-size: 11px;
  font-weight: 600;
  color: #23a455;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.student-dashboard .nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.student-dashboard .user-menu-wrapper {
  position: relative;
}

.student-dashboard .user-menu-btn {
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

.student-dashboard .user-menu-btn:hover {
  border-color: #61ce70;
  background: #f0fdf4;
}

.student-dashboard .user-avatar {
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

.student-dashboard .user-name {
  font-weight: 600;
  font-size: 13px;
  color: #1a1a1a;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.student-dashboard .dropdown-arrow {
  font-size: 9px;
  color: #666;
}

.student-dashboard .user-dropdown {
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

.student-dashboard .user-info {
  padding: 16px;
  background: linear-gradient(135deg, #f0fdf4 0%, #e8f5eb 100%);
  border-radius: 10px 10px 0 0;
}

.student-dashboard .user-full-name {
  font-weight: 700;
  font-size: 15px;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.student-dashboard .user-email {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.student-dashboard .user-role {
  font-size: 12px;
  color: #23a455;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.student-dashboard .dropdown-divider {
  height: 1px;
  background: #e8f5eb;
  margin: 8px 0;
}

.student-dashboard .dropdown-item {
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

.student-dashboard .dropdown-item:hover {
  background: #f0fdf4;
  color: #23a455;
}

.student-dashboard .logout-btn {
  color: #ff6b6b;
}

.student-dashboard .logout-btn:hover {
  background: #fff5f5;
  color: #e05555;
}

.student-dashboard .dashboard-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  background: #f5f5f5;
}

.student-dashboard .dashboard-sidebar {
  width: 240px;
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 20px 0;
  overflow-y: auto;
  flex-shrink: 0;
}

.student-dashboard .sidebar-header {
  padding: 0 20px 16px;
  border-bottom: 2px solid #f0f0f0;
  margin-bottom: 8px;
}

.student-dashboard .sidebar-header h3 {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 3px;
  letter-spacing: -0.3px;
}

.student-dashboard .sidebar-header p {
  font-size: 11px;
  color: #666;
}

.student-dashboard .sidebar-nav {
  display: flex;
  flex-direction: column;
}

.student-dashboard .sidebar-item {
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

.student-dashboard .sidebar-item:hover {
  background: #f0fdf4;
  border-left-color: #61ce70;
}

.student-dashboard .sidebar-item:hover .sidebar-icon {
  transform: scale(1.1);
}

.student-dashboard .sidebar-icon {
  font-size: 14px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 8px;
  flex-shrink: 0;
  transition: all 0.3s ease;
  font-weight: 700;
  color: #2f6f4f;
}

.student-dashboard .sidebar-item:hover .sidebar-icon {
  background: #e8f5eb;
}

.student-dashboard .sidebar-content {
  flex: 1;
}

.student-dashboard .sidebar-content h4 {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 2px;
}

.student-dashboard .sidebar-content p {
  font-size: 11px;
  color: #666;
  line-height: 1.3;
}

.student-dashboard .sidebar-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 12px 20px;
}

.student-dashboard .sidebar-section-title {
  padding: 12px 20px 8px;
  font-size: 11px;
  font-weight: 700;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.student-dashboard .dashboard-main {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.student-dashboard .dashboard-main .container {
  max-width: 1200px;
  padding: 30px 24px;
}

.student-dashboard .dashboard-header {
  margin-bottom: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.student-dashboard .dashboard-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 6px;
  letter-spacing: -0.5px;
}

.student-dashboard .dashboard-header p {
  font-size: 14px;
  color: #666;
}

.student-dashboard .error-message {
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

.student-dashboard .loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.student-dashboard .spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e8f5eb;
  border-top: 4px solid #61ce70;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.student-dashboard .loading-state p {
  color: #666;
  font-size: 15px;
}

.student-dashboard .stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  justify-items: stretch;
  align-items: stretch;
}

.student-dashboard .stat-card {
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

.student-dashboard .stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(97, 206, 112, 0.15);
  border-color: #e8f5eb;
}

.student-dashboard .stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
  font-weight: 700;
}

.student-dashboard .stat-content h3 {
  font-size: 11px;
  font-weight: 600;
  color: #666;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.student-dashboard .stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 3px;
  line-height: 1.1;
}

.student-dashboard .stat-label {
  font-size: 12px;
  color: #999;
}

.student-dashboard .section-card {
  background: white;
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}

.student-dashboard .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.student-dashboard .section-header h2 {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 3px;
}

.student-dashboard .section-header p {
  font-size: 13px;
  color: #666;
}

.student-dashboard .btn-view-all {
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

.student-dashboard .btn-view-all:hover {
  background: linear-gradient(135deg, #23a455 0%, #1a8542 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(35, 164, 85, 0.4);
}

.student-dashboard .empty-state {
  text-align: center;
  padding: 60px 20px;
}

.student-dashboard .empty-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 16px;
  font-weight: 700;
  color: #b0b0b0;
}

.student-dashboard .empty-state p {
  font-size: 16px;
  color: #999;
}

.student-dashboard .registrations-table {
  overflow-x: auto;
}

.student-dashboard table {
  width: 100%;
  border-collapse: collapse;
}

.student-dashboard thead {
  background: linear-gradient(135deg, #f0fdf4 0%, #e8f5eb 100%);
}

.student-dashboard th {
  padding: 14px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 700;
  color: #1a1a1a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #61ce70;
}

.student-dashboard td {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: #1a1a1a;
}

.student-dashboard tr:hover {
  background: #f0fdf4;
}

.student-dashboard .project-title {
  font-weight: 600;
  color: #1a1a1a;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.student-dashboard .status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  text-transform: capitalize;
}

.student-dashboard .badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.student-dashboard .badge-info {
  background: #e3f2fd;
  color: #1976d2;
}

.student-dashboard .date-text {
  font-size: 13px;
  color: #666;
}

.student-dashboard .btn-action {
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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .student-dashboard {
    height: auto;
    overflow: auto;
  }

  .student-dashboard .dashboard-content {
    flex-direction: column;
    overflow: auto;
  }

  .student-dashboard .dashboard-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
    padding: 16px 0;
    overflow-x: auto;
    overflow-y: visible;
  }

  .student-dashboard .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
    padding: 0 10px;
    gap: 8px;
  }

  .student-dashboard .sidebar-item {
    flex-direction: column;
    min-width: 110px;
    padding: 10px;
    text-align: center;
    gap: 6px;
    border-left: none;
    border-bottom: 3px solid transparent;
  }

  .student-dashboard .sidebar-item:hover {
    border-left-color: transparent;
    border-bottom-color: #61ce70;
  }

  .student-dashboard .sidebar-content h4 {
    font-size: 11px;
  }

  .student-dashboard .sidebar-content p {
    display: none;
  }

  .student-dashboard .dashboard-main {
    overflow-y: visible;
  }

  .student-dashboard .dashboard-main .container {
    padding: 20px 16px;
  }

  .student-dashboard .dashboard-header h1 {
    font-size: 22px;
  }

  .student-dashboard .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .student-dashboard .section-card {
    padding: 16px;
  }

  .student-dashboard .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .student-dashboard .registrations-table {
    font-size: 12px;
  }

  .student-dashboard th,
  .student-dashboard td {
    padding: 8px;
  }
}
</style>
