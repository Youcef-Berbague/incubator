<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../../stores/useAuthStore";
import api from "../../../api.js";
import { ROLES, getHighestRole } from "../../../config/roles";

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
const hasProject = computed(() => projects.value.length > 0);
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
  <section class="student-dashboard">
    <div class="ambient ambient-left"></div>
    <div class="ambient ambient-right"></div>

    <div class="page-shell">
      <header class="hero-card">
        <div class="hero-copy">
          <p class="eyebrow">Student Portal</p>
          <h1>Welcome, {{ userName }}</h1>
          <p class="hero-text">
            This dashboard is synced with your student-access backend data so
            you can track your registration, projects, and current access status
            in one place.
          </p>

          <div class="hero-meta">
            <span class="meta-chip">Role: {{ currentRoleLabel }}</span>
            <span class="meta-chip">Email: {{ userEmail }}</span>
            <span class="meta-chip">
              Updated:
              {{ lastUpdated ? formatDateTime(lastUpdated) : "Not loaded yet" }}
            </span>
          </div>
        </div>

        <div class="hero-actions">
          <button
            class="action-button primary"
            :disabled="loading"
            @click="refreshDashboard"
          >
            {{ loading ? "Refreshing..." : "Refresh data" }}
          </button>
          <button class="action-button secondary" @click="goToAccount">
            My account
          </button>
          <button class="action-button secondary" @click="goHome">
            Go home
          </button>
        </div>
      </header>

      <div v-if="error" class="notice notice-warning">
        {{ error }}
      </div>

      <div v-if="loading" class="loading-card">
        <div class="spinner"></div>
        <p>Loading student dashboard...</p>
      </div>

      <template v-else>
        <section class="stats-grid">
          <article class="stat-card accent-green">
            <span class="stat-label">Linked projects</span>
            <strong class="stat-value">{{ summary.projectCount }}</strong>
            <small class="stat-note">
              {{ summary.assignedProjects }} project{{
                summary.assignedProjects === 1 ? "" : "s"
              }}
              available through your access level.
            </small>
          </article>

          <article class="stat-card accent-blue">
            <span class="stat-label">Registration</span>
            <strong class="stat-value">{{ registrationStatusLabel }}</strong>
            <small class="stat-note">
              {{
                summary.hasRegistration
                  ? "A submission exists in the backend."
                  : "No registration record was found."
              }}
            </small>
          </article>

          <article class="stat-card accent-gold">
            <span class="stat-label">Self-service</span>
            <strong class="stat-value">
              {{ summary.canSelfServe ? "Enabled" : "Restricted" }}
            </strong>
            <small class="stat-note">
              {{
                roleSnapshot?.canSelfServe
                  ? "Your role can access student-facing dashboard data."
                  : "Your role is limited."
              }}
            </small>
          </article>

          <article class="stat-card accent-slate">
            <span class="stat-label">Backend sync</span>
            <strong class="stat-value">Live</strong>
            <small class="stat-note">
              {{
                profile
                  ? "Profile, projects, and registration are loaded from the API."
                  : "Waiting for profile data."
              }}
            </small>
          </article>
        </section>

        <section class="quick-nav">
          <button
            class="quick-nav-item"
            @click="scrollToSection('projects-section')"
          >
            View projects
          </button>
          <button
            class="quick-nav-item"
            @click="scrollToSection('registration-section')"
          >
            View registration
          </button>
          <button
            class="quick-nav-item"
            @click="scrollToSection('access-section')"
          >
            View access
          </button>
          <button
            class="quick-nav-item"
            @click="scrollToSection('profile-section')"
          >
            View profile
          </button>
        </section>

        <section class="content-grid">
          <article id="projects-section" class="panel panel-projects">
            <div class="panel-header">
              <div>
                <p class="panel-kicker">Projects</p>
                <h2>Your linked projects</h2>
              </div>
              <span class="panel-badge">{{ projects.length }}</span>
            </div>

            <div v-if="projects.length === 0" class="empty-state">
              <div class="empty-icon">📦</div>
              <h3>No project linked yet</h3>
              <p>
                Your account does not have an assigned project in the backend
                yet. Once your team is linked, project details will appear here.
              </p>
            </div>

            <div v-else class="project-list">
              <article
                v-for="project in projects"
                :key="project.id"
                class="project-card"
              >
                <div class="project-topline">
                  <div>
                    <p class="project-code">{{ project.code }}</p>
                    <h3>{{ project.title }}</h3>
                  </div>
                  <span
                    class="project-pill"
                    :class="
                      project.incubated
                        ? 'project-pill-active'
                        : 'project-pill-muted'
                    "
                  >
                    {{ project.incubated ? "Incubated" : "In progress" }}
                  </span>
                </div>

                <div class="progress-row">
                  <div class="progress-track">
                    <span
                      class="progress-fill"
                      :style="{ width: `${Math.min(project.progress, 100)}%` }"
                    ></span>
                  </div>
                  <span class="progress-label">{{
                    getProjectProgressLabel(project)
                  }}</span>
                </div>

                <div class="project-metadata">
                  <span>Faculty: {{ project.facultyName }}</span>
                  <span>Department: {{ project.departmentName }}</span>
                  <span v-if="project.preIncubationStatus"
                    >Pre-incubation: {{ project.preIncubationStatus }}</span
                  >
                  <span v-if="project.accelerationStatus"
                    >Acceleration: {{ project.accelerationStatus }}</span
                  >
                  <span v-if="project.teamId"
                    >Team ID: {{ project.teamId }}</span
                  >
                </div>
              </article>
            </div>
          </article>

          <article id="registration-section" class="panel panel-registration">
            <div class="panel-header">
              <div>
                <p class="panel-kicker">Registration</p>
                <h2>Your latest submission</h2>
              </div>
              <span
                class="panel-badge"
                :class="getStatusClass(registration?.status)"
              >
                {{ registrationStatusLabel }}
              </span>
            </div>

            <div v-if="registration" class="details-list">
              <div class="details-row">
                <span>Project title</span>
                <strong>{{ registration.title }}</strong>
              </div>
              <div class="details-row">
                <span>Faculty</span>
                <strong>{{ registration.facultyName }}</strong>
              </div>
              <div class="details-row">
                <span>Department</span>
                <strong>{{ registration.departmentName }}</strong>
              </div>
              <div class="details-row">
                <span>Submitted at</span>
                <strong>{{ formatDateTime(registration.submittedAt) }}</strong>
              </div>
              <div class="details-row">
                <span>Submission status</span>
                <strong>{{ registrationStatusLabel }}</strong>
              </div>
            </div>

            <div v-else class="empty-state compact">
              <div class="empty-icon">📝</div>
              <h3>No registration found</h3>
              <p>
                The backend did not return a project registration for your
                account. If you already submitted one, check that your email
                matches the registration record.
              </p>
            </div>
          </article>

          <article id="access-section" class="panel panel-access">
            <div class="panel-header">
              <div>
                <p class="panel-kicker">Access</p>
                <h2>Student capability snapshot</h2>
              </div>
            </div>

            <div class="access-grid">
              <div class="access-item">
                <span class="access-label">Can self-serve</span>
                <strong>{{ roleSnapshot?.canSelfServe ? "Yes" : "No" }}</strong>
              </div>
              <div class="access-item">
                <span class="access-label">Can manage projects</span>
                <strong>{{
                  roleSnapshot?.canManageProjects ? "Yes" : "No"
                }}</strong>
              </div>
              <div class="access-item">
                <span class="access-label">Backend role</span>
                <strong>{{ roleSnapshot?.role || currentRoleLabel }}</strong>
              </div>
              <div class="access-item">
                <span class="access-label">Role value</span>
                <strong>{{ currentRole }}</strong>
              </div>
            </div>

            <p class="panel-footnote">
              These values come directly from <span>/dashboard/role</span> and
              are kept in sync with the backend authorization model.
            </p>
          </article>

          <article id="profile-section" class="panel panel-profile">
            <div class="panel-header">
              <div>
                <p class="panel-kicker">Profile</p>
                <h2>Your account snapshot</h2>
              </div>
            </div>

            <div class="details-list compact-details">
              <div class="details-row">
                <span>Name</span>
                <strong>{{ userName }}</strong>
              </div>
              <div class="details-row">
                <span>Email</span>
                <strong>{{ userEmail }}</strong>
              </div>
              <div class="details-row">
                <span>Role</span>
                <strong>{{ currentRoleLabel }}</strong>
              </div>
              <div class="details-row">
                <span>Registered projects</span>
                <strong>{{ summary.projectCount }}</strong>
              </div>
            </div>

            <button class="panel-link-button" @click="goToAccount">
              Open account settings
            </button>
          </article>
        </section>
      </template>
    </div>
  </section>
</template>

<style scoped>
.student-dashboard {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(
      circle at top left,
      rgba(73, 158, 96, 0.16),
      transparent 32%
    ),
    radial-gradient(
      circle at top right,
      rgba(22, 96, 135, 0.12),
      transparent 28%
    ),
    linear-gradient(180deg, #f4fbf6 0%, #edf7ef 100%);
  color: #11311d;
}

.ambient {
  position: absolute;
  width: 28rem;
  height: 28rem;
  border-radius: 999px;
  filter: blur(24px);
  opacity: 0.45;
  pointer-events: none;
}

.ambient-left {
  left: -12rem;
  top: 4rem;
  background: rgba(52, 157, 98, 0.18);
}

.ambient-right {
  right: -10rem;
  top: 8rem;
  background: rgba(35, 87, 168, 0.12);
}

.page-shell {
  position: relative;
  z-index: 1;
  width: min(1400px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 1.25rem 0 3rem;
}

.hero-card,
.panel,
.loading-card,
.notice,
.quick-nav-item,
.stat-card {
  border: 1px solid rgba(16, 48, 27, 0.08);
  box-shadow: 0 20px 60px rgba(16, 48, 27, 0.08);
}

.hero-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 2rem;
  padding: 2rem;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(14px);
}

.hero-copy {
  max-width: 760px;
}

.eyebrow,
.panel-kicker {
  margin: 0 0 0.75rem;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #2f7f4d;
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.4rem);
  line-height: 1.06;
  letter-spacing: -0.05em;
}

.hero-text {
  margin: 1rem 0 0;
  max-width: 54rem;
  font-size: 1rem;
  line-height: 1.75;
  color: #526356;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.meta-chip,
.panel-badge,
.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 0.85rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
}

.meta-chip {
  background: rgba(16, 48, 27, 0.06);
  color: #21432f;
}

.hero-actions {
  display: grid;
  gap: 0.75rem;
  min-width: 14rem;
}

.action-button,
.panel-link-button,
.quick-nav-item {
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
  font: inherit;
}

.action-button {
  padding: 0.95rem 1rem;
  font-weight: 700;
}

.action-button:hover,
.quick-nav-item:hover,
.panel-link-button:hover {
  transform: translateY(-1px);
}

.action-button.primary {
  color: white;
  background: linear-gradient(135deg, #1d8f4c 0%, #2f6fdf 100%);
}

.action-button.secondary,
.panel-link-button,
.quick-nav-item {
  background: rgba(255, 255, 255, 0.95);
  color: #193422;
}

.action-button:disabled {
  opacity: 0.7;
  cursor: progress;
}

.notice {
  margin-top: 1rem;
  padding: 1rem 1.1rem;
  border-radius: 18px;
  background: rgba(255, 251, 235, 0.94);
  color: #7a4b00;
}

.loading-card {
  margin-top: 1rem;
  display: grid;
  place-items: center;
  gap: 0.85rem;
  min-height: 18rem;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.84);
}

.spinner {
  width: 52px;
  height: 52px;
  border-radius: 999px;
  border: 4px solid rgba(46, 117, 73, 0.12);
  border-top-color: #1d8f4c;
  animation: spin 1s linear infinite;
}

.loading-card p {
  margin: 0;
  color: #526356;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.stat-card {
  border-radius: 24px;
  padding: 1.15rem;
  background: rgba(255, 255, 255, 0.9);
  min-height: 10rem;
}

.stat-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  color: #62806e;
}

.stat-value {
  display: block;
  margin-top: 0.7rem;
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  letter-spacing: -0.05em;
}

.stat-note {
  display: block;
  margin-top: 0.5rem;
  line-height: 1.6;
  color: #587062;
}

.accent-green {
  background: linear-gradient(
    180deg,
    rgba(241, 251, 244, 0.98),
    rgba(255, 255, 255, 0.92)
  );
}

.accent-blue {
  background: linear-gradient(
    180deg,
    rgba(239, 247, 255, 0.98),
    rgba(255, 255, 255, 0.92)
  );
}

.accent-gold {
  background: linear-gradient(
    180deg,
    rgba(255, 249, 234, 0.98),
    rgba(255, 255, 255, 0.92)
  );
}

.accent-slate {
  background: linear-gradient(
    180deg,
    rgba(244, 247, 248, 0.98),
    rgba(255, 255, 255, 0.92)
  );
}

.quick-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.quick-nav-item {
  padding: 0.85rem 1rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
  align-items: start;
}

.panel {
  border-radius: 28px;
  padding: 1.4rem;
  background: rgba(255, 255, 255, 0.88);
}

.panel-projects {
  grid-row: span 2;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.4rem;
  letter-spacing: -0.04em;
}

.panel-badge {
  background: rgba(29, 143, 76, 0.12);
  color: #1d8f4c;
}

.status-pill {
  background: rgba(16, 48, 27, 0.08);
  color: #21432f;
}

.status-pending,
.status-in_review {
  background: rgba(45, 123, 255, 0.12);
  color: #2756b6;
}

.status-approved {
  background: rgba(29, 143, 76, 0.12);
  color: #1d8f4c;
}

.status-rejected,
.status-withdrawn {
  background: rgba(229, 72, 77, 0.12);
  color: #bf3b40;
}

.status-revision_required {
  background: rgba(222, 123, 26, 0.12);
  color: #ba6600;
}

.empty-state {
  display: grid;
  place-items: center;
  text-align: center;
  gap: 0.55rem;
  min-height: 15rem;
  padding: 1rem;
  color: #526356;
}

.empty-state.compact {
  min-height: 0;
}

.empty-icon {
  font-size: 2.2rem;
}

.empty-state h3 {
  margin: 0;
  font-size: 1.2rem;
}

.empty-state p {
  margin: 0;
  max-width: 34rem;
  line-height: 1.7;
}

.project-list {
  display: grid;
  gap: 0.9rem;
}

.project-card {
  padding: 1rem;
  border-radius: 22px;
  background: linear-gradient(
    180deg,
    rgba(248, 252, 249, 0.95),
    rgba(255, 255, 255, 0.98)
  );
  border: 1px solid rgba(16, 48, 27, 0.08);
}

.project-topline {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.project-code {
  margin: 0 0 0.3rem;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #629071;
}

.project-card h3 {
  margin: 0;
  font-size: 1.12rem;
  letter-spacing: -0.03em;
}

.project-pill {
  padding: 0.5rem 0.8rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 800;
}

.project-pill-active {
  background: rgba(29, 143, 76, 0.12);
  color: #1d8f4c;
}

.project-pill-muted {
  background: rgba(16, 48, 27, 0.08);
  color: #526356;
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.9rem;
}

.progress-track {
  position: relative;
  flex: 1;
  height: 0.8rem;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(16, 48, 27, 0.08);
}

.progress-fill {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: inherit;
  background: linear-gradient(90deg, #1d8f4c 0%, #2f6fdf 100%);
}

.progress-label {
  flex: 0 0 auto;
  font-size: 0.82rem;
  font-weight: 700;
  color: #526356;
}

.project-metadata {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem 1rem;
  margin-top: 0.9rem;
  color: #526356;
  font-size: 0.9rem;
}

.details-list {
  display: grid;
  gap: 0.8rem;
}

.compact-details {
  margin-bottom: 1rem;
}

.details-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1rem;
  border-radius: 18px;
  background: rgba(16, 48, 27, 0.04);
}

.details-row span {
  color: #6a7d71;
}

.details-row strong {
  text-align: right;
  color: #173221;
}

.access-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.access-item {
  padding: 1rem;
  border-radius: 18px;
  background: rgba(16, 48, 27, 0.04);
}

.access-label {
  display: block;
  margin-bottom: 0.45rem;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: #6a7d71;
}

.access-item strong {
  font-size: 1.02rem;
}

.panel-footnote {
  margin: 1rem 0 0;
  color: #617368;
  line-height: 1.7;
}

.panel-footnote span {
  font-weight: 700;
  color: #173221;
}

.panel-link-button {
  width: 100%;
  margin-top: 1rem;
  padding: 0.9rem 1rem;
  font-weight: 700;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .panel-projects {
    grid-row: auto;
  }
}

@media (max-width: 720px) {
  .page-shell {
    width: min(100% - 1rem, 1400px);
    padding-top: 0.5rem;
  }

  .hero-card {
    flex-direction: column;
    padding: 1.35rem;
  }

  .hero-actions {
    width: 100%;
  }

  .stats-grid,
  .access-grid {
    grid-template-columns: 1fr;
  }

  .project-topline,
  .details-row {
    flex-direction: column;
  }

  .details-row strong {
    text-align: left;
  }

  .quick-nav {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 0.25rem;
  }

  .quick-nav-item {
    flex: 0 0 auto;
  }
}
</style>
