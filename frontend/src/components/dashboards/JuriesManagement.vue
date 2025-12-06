<template>
  <div class="juries-management">
    <!-- Header with back button -->
    <div class="header">
      <div class="header-content">
        <button class="back-btn" @click="goBack" title="Back to Dashboard">
          <span class="back-icon">←</span>
        </button>
        <div class="header-text">
          <h1>Juries Management</h1>
          <p>Manage jury sessions, members, and project assignments</p>
        </div>
      </div>
      <button class="btn-create" @click="openCreateModal">
        <span class="icon">➕</span>
        Create New Jury
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="filters-section">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search juries by code or date..."
          class="search-input"
        />
      </div>
      <div class="stats-badges">
        <div class="stats-badge">
          <span class="badge-label">Total Juries:</span>
          <span class="badge-value">{{ filteredJuries.length }}</span>
        </div>
        <div class="stats-badge">
          <span class="badge-label">This Month:</span>
          <span class="badge-value">{{ getThisMonthCount() }}</span>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      <span class="error-icon">⚠️</span>
      {{ error }}
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="success-message">
      <span class="success-icon">✅</span>
      {{ successMessage }}
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading juries...</p>
    </div>

    <!-- Juries Grid -->
    <div v-else-if="filteredJuries.length > 0" class="juries-grid">
      <div v-for="jury in filteredJuries" :key="jury.id" class="jury-card">
        <div class="jury-header">
          <div class="jury-icon">⚖️</div>
          <div class="jury-info">
            <h3 class="jury-code">{{ jury.jury_code }}</h3>
            <p class="jury-date">
              {{ formatDate(jury.date) }}
            </p>
          </div>
        </div>

        <div class="jury-details">
          <div class="detail-row" v-if="jury.faculties">
            <span class="detail-label">🎓 Faculty:</span>
            <span class="detail-value">{{
              jury.faculties.faculty_name_en
            }}</span>
          </div>
          <div class="detail-row" v-if="jury.locations">
            <span class="detail-label">📍 Location:</span>
            <span class="detail-value">{{ jury.locations.location_name }}</span>
          </div>
          <div class="detail-row" v-if="jury.socio_economic_partner">
            <span class="detail-label">🤝 Partner:</span>
            <span class="detail-value">{{
              jury.socio_economic_partner.full_name
            }}</span>
          </div>
        </div>

        <div class="jury-stats">
          <div class="stat-item">
            <span class="stat-icon">👥</span>
            <span class="stat-text"
              >{{ getJuryMembersCount(jury) }} Members</span
            >
          </div>
          <div class="stat-item">
            <span class="stat-icon">📋</span>
            <span class="stat-text"
              >{{ getJuryProjectsCount(jury) }} Projects</span
            >
          </div>
        </div>

        <div class="jury-actions">
          <button
            class="btn-action btn-members"
            @click="openMembersModal(jury)"
            title="Manage Members"
          >
            👥 Members
          </button>
          <button
            class="btn-action btn-projects"
            @click="openProjectsModal(jury)"
            title="Assign Projects"
          >
            📋 Projects
          </button>
          <button
            class="btn-action btn-edit"
            @click="openEditModal(jury)"
            title="Edit Jury"
          >
            ✏️ Edit
          </button>
          <button
            class="btn-action btn-delete"
            @click="confirmDelete(jury)"
            title="Delete Jury"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">⚖️</div>
      <p>No juries found. Create your first jury to get started!</p>
    </div>

    <!-- Create/Edit Jury Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ isEditMode ? "Edit Jury" : "Create New Jury" }}</h2>
          <button class="close-btn" @click="closeModal">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label for="jury_code">
              Jury Code <span class="required">*</span>
            </label>
            <input
              id="jury_code"
              v-model="formData.jury_code"
              type="text"
              placeholder="e.g., JURY-2024-001"
              maxlength="100"
              class="form-input"
              :class="{ 'input-error': validationErrors.jury_code }"
            />
            <div class="char-counter">
              {{ formData.jury_code.length }}/100 characters
            </div>
            <span v-if="validationErrors.jury_code" class="error-text">{{
              validationErrors.jury_code
            }}</span>
          </div>

          <div class="form-group">
            <label for="date">Date & Time</label>
            <input
              id="date"
              v-model="formData.date"
              type="datetime-local"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="faculty_id">Faculty</label>
            <select
              id="faculty_id"
              v-model="formData.faculty_id"
              class="form-input"
            >
              <option :value="null">-- Select Faculty --</option>
              <option
                v-for="faculty in faculties"
                :key="faculty.id"
                :value="faculty.id"
              >
                {{ faculty.faculty_name_en }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="location_id">Location</label>
            <select
              id="location_id"
              v-model="formData.location_id"
              class="form-input"
            >
              <option :value="null">-- Select Location --</option>
              <option
                v-for="location in locations"
                :key="location.id"
                :value="location.id"
              >
                {{ location.location_name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="so_partener_id">Socio-Economic Partner</label>
            <select
              id="so_partener_id"
              v-model="formData.so_partener_id"
              class="form-input"
            >
              <option :value="null">-- Select Partner --</option>
              <option
                v-for="partner in partners"
                :key="partner.id"
                :value="partner.id"
              >
                {{ partner.full_name }}
              </option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="closeModal">Cancel</button>
          <button class="btn-submit" @click="handleSubmit" :disabled="saving">
            {{ saving ? "Saving..." : isEditMode ? "Update" : "Create" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Members Management Modal -->
    <div
      v-if="showMembersModal"
      class="modal-overlay"
      @click="closeMembersModal"
    >
      <div class="modal-content modal-large" @click.stop>
        <div class="modal-header">
          <h2>Manage Jury Members - {{ selectedJury?.jury_code }}</h2>
          <button class="close-btn" @click="closeMembersModal">✕</button>
        </div>

        <div class="modal-body">
          <!-- Member Limit Warning -->
          <div v-if="getCurrentMembersCount() >= 5" class="warning-banner">
            <span class="warning-icon">⚠️</span>
            <span
              >Maximum jury members reached (5/5). The socio-economic partner is
              separate. Remove a member to add a new one.</span
            >
          </div>

          <!-- Assign New Member Section -->
          <div class="assign-section" v-if="getCurrentMembersCount() < 5">
            <h3>
              Assign New Member ({{ getCurrentMembersCount() }}/5 members) -
              Partner is separate
            </h3>

            <!-- Advanced User Search -->
            <div class="advanced-search">
              <div class="search-filters-grid">
                <div class="form-group">
                  <label>Search by Name/Email</label>
                  <input
                    v-model="userSearchFilters.search"
                    type="text"
                    class="form-input"
                    placeholder="Type to search users..."
                    @input="handleUserSearch"
                  />
                </div>
                <div class="form-group">
                  <label>Filter by Department</label>
                  <select
                    v-model="userSearchFilters.departmentFilter"
                    class="form-input"
                    @change="handleUserSearch"
                  >
                    <option :value="null">All Departments</option>
                    <option
                      v-for="dept in departments"
                      :key="dept.id"
                      :value="dept.id"
                    >
                      {{ dept.departement_name }}
                    </option>
                  </select>
                </div>
              </div>
              <div
                class="search-results-info"
                v-if="filteredUsersForSearch.length > 0"
              >
                Found {{ filteredUsersForSearch.length }} user(s)
              </div>
            </div>

            <!-- User Selection & Role Assignment -->
            <div class="assign-form-grid">
              <div class="form-group">
                <label>Select User <span class="required">*</span></label>
                <select
                  v-model="newMemberForm.userId"
                  class="form-input"
                  @change="onUserSelected"
                >
                  <option :value="null">-- Select User --</option>
                  <option
                    v-for="user in filteredUsersForSearch"
                    :key="user.id"
                    :value="user.id"
                  >
                    {{ user.first_name }} {{ user.last_name }} -
                    {{ user.email }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Jury Member Role <span class="required">*</span></label>
                <select v-model="newMemberForm.roleId" class="form-input">
                  <option :value="null">-- Select Role --</option>
                  <option
                    v-for="role in availableJuryMemberRoles"
                    :key="role.id"
                    :value="role.id"
                    :disabled="isRoleAlreadyAssigned(role.id)"
                  >
                    {{ role.name }}
                    {{
                      isRoleAlreadyAssigned(role.id) ? "(Already Assigned)" : ""
                    }}
                  </option>
                </select>
              </div>
              <button
                class="btn-assign"
                @click="assignMemberToJury"
                :disabled="
                  !newMemberForm.userId ||
                  !newMemberForm.roleId ||
                  assigningMember
                "
              >
                {{ assigningMember ? "Assigning..." : "➕ Add Member" }}
              </button>
            </div>
            <p class="help-text">
              💡 The jury can have maximum 5 members. The socio-economic partner
              is assigned separately and is not counted here. Each member must
              have a different role. Use search filters to find users quickly.
            </p>
          </div>

          <!-- Current Members List -->
          <div class="members-list-section">
            <h3>Current Members ({{ getCurrentMembersCount() }}/5)</h3>
            <div v-if="getCurrentMembersCount() > 0" class="members-table">
              <div
                v-for="relation in selectedJury?.jury_membres_relation"
                :key="relation.jury_membre.id"
                class="member-row"
              >
                <div class="member-info">
                  <div class="member-avatar">
                    {{
                      getInitials(
                        relation.jury_membre.users?.first_name,
                        relation.jury_membre.users?.last_name
                      )
                    }}
                  </div>
                  <div class="member-details">
                    <p class="member-name">
                      {{ relation.jury_membre.users?.first_name }}
                      {{ relation.jury_membre.users?.last_name }}
                    </p>
                    <p class="member-role">
                      <span class="role-badge">{{
                        relation.jury_membre.jury_membre_role?.name || "No Role"
                      }}</span>
                    </p>
                    <p class="member-email">
                      {{ relation.jury_membre.users?.email }}
                    </p>
                  </div>
                </div>
                <button
                  class="btn-remove"
                  @click="confirmRemoveMember(relation.jury_membre.id)"
                  :disabled="removingMember"
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
            <div v-else class="empty-members">
              <div class="empty-icon">👥</div>
              <p>No members assigned yet.</p>
              <p class="empty-subtitle">
                Add up to 5 members with different roles to this jury.
              </p>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="closeMembersModal">Close</button>
        </div>
      </div>
    </div>

    <!-- Remove Member Confirmation Modal -->
    <div
      v-if="showRemoveMemberModal"
      class="modal-overlay"
      @click="showRemoveMemberModal = false"
    >
      <div class="modal-content modal-small" @click.stop>
        <div class="modal-header">
          <h2>Confirm Remove Member</h2>
          <button class="close-btn" @click="showRemoveMemberModal = false">
            ✕
          </button>
        </div>

        <div class="modal-body">
          <div class="delete-warning">
            <span class="warning-icon">⚠️</span>
            <p>Are you sure you want to remove this member from the jury?</p>
            <p class="warning-text">
              This action will unassign the member from this jury session.
            </p>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="showRemoveMemberModal = false">
            Cancel
          </button>
          <button
            class="btn-delete-confirm"
            @click="removeMemberFromJury"
            :disabled="removingMember"
          >
            {{ removingMember ? "Removing..." : "Remove Member" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Projects Assignment Modal -->
    <div
      v-if="showProjectsModal"
      class="modal-overlay"
      @click="closeProjectsModal"
    >
      <div class="modal-content modal-large" @click.stop>
        <div class="modal-header">
          <h2>Assign Projects - {{ selectedJury?.jury_code }}</h2>
          <button class="close-btn" @click="closeProjectsModal">✕</button>
        </div>

        <div class="modal-body">
          <div class="projects-section">
            <h3>Select Projects to Assign</h3>
            <div class="projects-grid">
              <div
                v-for="project in availableProjects"
                :key="project.id"
                class="project-checkbox-item"
              >
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    :value="project.id"
                    v-model="selectedProjectIds"
                    class="project-checkbox"
                  />
                  <div class="project-info-box">
                    <p class="project-title">{{ project.title }}</p>
                    <p class="project-code">{{ project.project_code }}</p>
                  </div>
                </label>
              </div>
            </div>

            <div class="selected-count">
              {{ selectedProjectIds.length }} project(s) selected
            </div>
          </div>

          <!-- Currently Assigned Projects -->
          <div class="current-projects-section">
            <h3>
              Currently Assigned Projects ({{
                selectedJury?.jury_project?.length || 0
              }})
            </h3>
            <div
              v-if="
                selectedJury?.jury_project &&
                selectedJury.jury_project.length > 0
              "
              class="assigned-projects-list"
            >
              <div
                v-for="jp in selectedJury.jury_project"
                :key="jp.project.id"
                class="assigned-project-item"
              >
                <div class="project-icon">📋</div>
                <div class="project-details">
                  <p class="project-title">{{ jp.project.title }}</p>
                  <p class="project-code">{{ jp.project.project_code }}</p>
                </div>
              </div>
            </div>
            <div v-else class="empty-projects">
              <p>No projects assigned yet.</p>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="closeProjectsModal">Cancel</button>
          <button
            class="btn-submit"
            @click="assignProjectsToJury"
            :disabled="assigningProjects || selectedProjectIds.length === 0"
          >
            {{
              assigningProjects
                ? "Assigning..."
                : `Assign ${selectedProjectIds.length} Project(s)`
            }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="modal-overlay"
      @click="showDeleteModal = false"
    >
      <div class="modal-content modal-small" @click.stop>
        <div class="modal-header">
          <h2>Confirm Deletion</h2>
          <button class="close-btn" @click="showDeleteModal = false">✕</button>
        </div>

        <div class="modal-body">
          <div class="delete-warning">
            <span class="warning-icon">⚠️</span>
            <p>
              Are you sure you want to delete jury
              <strong>{{ juryToDelete?.jury_code }}</strong
              >?
            </p>
            <p class="warning-text">
              This will also remove all member assignments and project
              associations. This action cannot be undone!
            </p>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="showDeleteModal = false">
            Cancel
          </button>
          <button
            class="btn-delete-confirm"
            @click="handleDelete"
            :disabled="deleting"
          >
            {{ deleting ? "Deleting..." : "Delete Jury" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../../api.js";

const router = useRouter();

// Role constants (matching backend rolesList.js)
const ROLES = Object.freeze({
  superAdmin: 100,
  admin: 90,
  coach: 70,
  supervisor: 60,
  student: 40,
  guest: 10,
});

// State
const juries = ref([]);
const faculties = ref([]);
const locations = ref([]);
const partners = ref([]);
const juryMembers = ref([]);
const projects = ref([]);
const allUsers = ref([]);
const departments = ref([]);

const loading = ref(false);
const error = ref("");
const successMessage = ref("");
const searchQuery = ref("");

// User search filters
const userSearchFilters = ref({
  search: "",
  roleFilter: null,
  departmentFilter: null,
});

// Modal states
const showModal = ref(false);
const showMembersModal = ref(false);
const showProjectsModal = ref(false);
const showDeleteModal = ref(false);
const showRemoveMemberModal = ref(false);
const isEditMode = ref(false);
const saving = ref(false);
const deleting = ref(false);
const assigningMember = ref(false);
const removingMember = ref(false);
const assigningProjects = ref(false);
const juryMemberRoles = ref(null);

// Form data
const formData = ref({
  jury_code: "",
  date: "",
  faculty_id: null,
  location_id: null,
  so_partener_id: null,
});

const newMemberForm = ref({
  userId: null,
  roleId: null,
});

const validationErrors = ref({});
const selectedJury = ref(null);
const juryToDelete = ref(null);
const memberToRemove = ref(null);
const selectedProjectIds = ref([]);

// Computed
const filteredJuries = computed(() => {
  if (!searchQuery.value) return juries.value;

  const query = searchQuery.value.toLowerCase();
  return juries.value.filter((jury) => {
    const codeMatch = jury.jury_code?.toLowerCase().includes(query);
    const dateMatch = jury.date?.toLowerCase().includes(query);
    return codeMatch || dateMatch;
  });
});

const filteredUsersForSearch = computed(() => {
  // ✅ Safety check: ensure users is always an array
  let users = Array.isArray(allUsers.value) ? allUsers.value : [];

  // Filter out users already assigned to this jury
  if (selectedJury.value) {
    const assignedUserIds =
      selectedJury.value.jury_membres_relation?.map(
        (rel) => rel.jury_membre.users?.id
      ) || [];
    users = users.filter((user) => !assignedUserIds.includes(user.id));
  }

  // Apply search filter
  if (userSearchFilters.value.search) {
    const searchTerm = userSearchFilters.value.search.toLowerCase();
    users = users.filter((user) => {
      const nameMatch = `${user.first_name} ${user.last_name}`
        .toLowerCase()
        .includes(searchTerm);
      const emailMatch = user.email?.toLowerCase().includes(searchTerm);
      return nameMatch || emailMatch;
    });
  }

  // Apply role filter
  if (userSearchFilters.value.roleFilter) {
    users = users.filter((user) =>
      user.role?.includes(userSearchFilters.value.roleFilter)
    );
  }

  // Apply department filter
  if (userSearchFilters.value.departmentFilter) {
    users = users.filter(
      (user) => user.departement_id === userSearchFilters.value.departmentFilter
    );
  }

  return users;
});

const availableJuryMemberRoles = computed(() => {
  return juryMemberRoles.value;
});

const availableProjects = computed(() => {
  return projects.value;
});

// Methods
const fetchJuries = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await api.get("/juries");
    if (response.data.success) {
      juries.value = response.data.data;
    }
  } catch (err) {
    error.value =
      err.response?.data?.message ||
      "Failed to fetch juries. Please try again.";
  } finally {
    loading.value = false;
  }
};

const fetchFaculties = async () => {
  try {
    const response = await api.get("/faculties");
    // Faculties API returns data directly without success wrapper
    if (Array.isArray(response.data)) {
      faculties.value = response.data;
    } else if (response.data.success) {
      faculties.value = response.data.data;
    }
  } catch (err) {
    console.error("Failed to fetch faculties:", err);
  }
};

const fetchLocations = async () => {
  try {
    const response = await api.get("/locations");
    if (response.data.success) {
      locations.value = response.data.data;
    }
  } catch (err) {
    console.error("Failed to fetch locations:", err);
  }
};

const fetchPartners = async () => {
  try {
    const response = await api.get("/partners");
    if (response.data.success) {
      partners.value = response.data.data;
    }
  } catch (err) {
    console.error("Failed to fetch partners:", err);
  }
};

const fetchJuryMembers = async () => {
  try {
    const response = await api.get("/jury-members");
    if (response.data.success) {
      juryMembers.value = response.data.data;
    }
  } catch (err) {
    console.error("Failed to fetch jury members:", err);
  }
};

const fetchAllUsers = async () => {
  try {
    const response = await api.get("/users/all");
    console.log("Fetched users:", response.data);
    if (response.data.success) {
      // Filter out students and guests - only show eligible jury members
      const eligibleRoles = [
        ROLES.superAdmin,
        ROLES.admin,
        ROLES.coach,
        ROLES.supervisor,
      ];
      const filteredUsers = response.data.data.filter((user) => {
        if (!user.role || !Array.isArray(user.role)) return false;
        // User must have at least one eligible role
        return user.role.some((r) => eligibleRoles.includes(r));
      });
      allUsers.value = filteredUsers;
    }
  } catch (err) {
    console.error("Failed to fetch all users:", err);
    allUsers.value = []; // ✅ Ensure it's always an array
  }
};

const fetchDepartments = async () => {
  try {
    const response = await api.get("/faculties");
    if (Array.isArray(response.data)) {
      // Extract departments from faculties
      const depts = [];
      response.data.forEach((faculty) => {
        if (faculty.departements && Array.isArray(faculty.departements)) {
          depts.push(...faculty.departements);
        }
      });
      departments.value = depts;
    } else if (response.data.success) {
      const depts = [];
      response.data.data.forEach((faculty) => {
        if (faculty.departements && Array.isArray(faculty.departements)) {
          depts.push(...faculty.departements);
        }
      });
      departments.value = depts;
    }
  } catch (err) {
    console.error("Failed to fetch departments:", err);
  }
};

const fetchJuryMemberRoles = async () => {
  try {
    const response = await api.get("/jury-member-roles");
    if (response.data.success) {
      juryMemberRoles.value = response.data.data;
    }
  } catch (err) {
    console.error("Failed to fetch jury member roles:", err);
  }
};

const fetchProjects = async () => {
  try {
    // Try to fetch projects - if the endpoint doesn't exist yet, we'll handle it gracefully
    const response = await api.get("/projects");
    if (response.data.success) {
      projects.value = response.data.data;
    }
  } catch (err) {
    // If projects endpoint doesn't exist, just log and continue
    console.warn("Projects endpoint not available yet:", err);
    projects.value = [];
  }
};

const openCreateModal = () => {
  isEditMode.value = false;
  formData.value = {
    jury_code: "",
    date: "",
    faculty_id: null,
    location_id: null,
    so_partener_id: null,
  };
  validationErrors.value = {};
  showModal.value = true;
};

const openEditModal = (jury) => {
  isEditMode.value = true;
  selectedJury.value = jury;
  formData.value = {
    jury_code: jury.jury_code,
    date: jury.date ? formatDateForInput(jury.date) : "",
    faculty_id: jury.faculty_id,
    location_id: jury.location_id,
    so_partener_id: jury.so_partener_id,
  };
  validationErrors.value = {};
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedJury.value = null;
};

const validateForm = () => {
  validationErrors.value = {};

  if (
    !formData.value.jury_code ||
    formData.value.jury_code.trim().length === 0
  ) {
    validationErrors.value.jury_code = "Jury code is required";
    return false;
  }

  if (formData.value.jury_code.length > 100) {
    validationErrors.value.jury_code =
      "Jury code must not exceed 100 characters";
    return false;
  }

  return true;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  saving.value = true;
  error.value = "";
  successMessage.value = "";

  try {
    const payload = {
      jury_code: formData.value.jury_code.trim(),
      date: formData.value.date || null,
      faculty_id: formData.value.faculty_id || null,
      location_id: formData.value.location_id || null,
      so_partener_id: formData.value.so_partener_id || null,
    };

    if (isEditMode.value) {
      const response = await api.put(
        `/juries/${selectedJury.value.id}`,
        payload
      );
      if (response.data.success) {
        successMessage.value = "Jury updated successfully!";
        await fetchJuries();
        closeModal();
        setTimeout(() => (successMessage.value = ""), 3000);
      }
    } else {
      const response = await api.post("/juries", payload);
      if (response.data.success) {
        successMessage.value = "Jury created successfully!";
        await fetchJuries();
        closeModal();
        setTimeout(() => (successMessage.value = ""), 3000);
      }
    }
  } catch (err) {
    error.value =
      err.response?.data?.message ||
      `Failed to ${isEditMode.value ? "update" : "create"} jury`;
    setTimeout(() => (error.value = ""), 5000);
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (jury) => {
  juryToDelete.value = jury;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  deleting.value = true;
  error.value = "";

  try {
    const response = await api.delete(`/juries/${juryToDelete.value.id}`);
    if (response.data.success) {
      successMessage.value = "Jury deleted successfully!";
      await fetchJuries();
      showDeleteModal.value = false;
      setTimeout(() => (successMessage.value = ""), 3000);
    }
  } catch (err) {
    error.value = err.response?.data?.message || "Failed to delete jury";
    showDeleteModal.value = false;
    setTimeout(() => (error.value = ""), 5000);
  } finally {
    deleting.value = false;
  }
};

const openMembersModal = async (jury) => {
  selectedJury.value = jury;
  newMemberForm.value = {
    userId: null,
    roleId: null,
  };
  userSearchFilters.value = {
    search: "",
    roleFilter: null,
    departmentFilter: null,
  };
  showMembersModal.value = true;

  // Fetch all users, jury member roles, and departments when modal opens
  await Promise.all([
    fetchAllUsers(),
    fetchJuryMemberRoles(),
    fetchDepartments(),
  ]);
};

const closeMembersModal = () => {
  showMembersModal.value = false;
  selectedJury.value = null;
  newMemberForm.value = {
    userId: null,
    roleId: null,
  };
  userSearchFilters.value = {
    search: "",
    roleFilter: null,
    departmentFilter: null,
  };
};

const getCurrentMembersCount = () => {
  if (!selectedJury.value) return 0;
  return selectedJury.value.jury_membres_relation?.length || 0;
};

const isRoleAlreadyAssigned = (roleId) => {
  if (!selectedJury.value) return false;

  const assignedRoleIds =
    selectedJury.value.jury_membres_relation?.map(
      (rel) => rel.jury_membre.role_id
    ) || [];

  return assignedRoleIds.includes(roleId);
};

const onUserSelected = () => {
  // Optional: You can add logic here if needed when user is selected
};

const assignMemberToJury = async () => {
  if (!newMemberForm.value.userId || !newMemberForm.value.roleId) {
    error.value = "Please select both user and role";
    setTimeout(() => (error.value = ""), 3000);
    return;
  }

  // Validate member count (max 5 members, partner is separate)
  if (getCurrentMembersCount() >= 5) {
    error.value = "Maximum of 5 jury members allowed (partner is separate)";
    setTimeout(() => (error.value = ""), 3000);
    return;
  }

  // Validate role not already assigned
  if (isRoleAlreadyAssigned(newMemberForm.value.roleId)) {
    error.value = "This role is already assigned to another member";
    setTimeout(() => (error.value = ""), 3000);
    return;
  }

  assigningMember.value = true;
  error.value = "";

  try {
    // Step 1: Get the user from users table (already selected via newMemberForm.userId)

    // Step 2: Assign jury member role to the user and save in jury_membre table
    const createMemberResponse = await api.post("/jury-members", {
      membre_id: newMemberForm.value.userId,
      role_id: newMemberForm.value.roleId,
    });

    if (!createMemberResponse.data.success) {
      throw new Error("Failed to create jury member");
    }

    const newJuryMembreId = createMemberResponse.data.data.id;

    // Step 3: Make relation between jury_membre and jury (save in jury_membres_relation)
    const assignResponse = await api.post(
      `/juries/${selectedJury.value.id}/members/${newJuryMembreId}`
    );

    if (assignResponse.data.success) {
      successMessage.value = "Member assigned successfully!";
      await fetchJuries();

      // Update selected jury
      const updatedJury = juries.value.find(
        (j) => j.id === selectedJury.value.id
      );
      selectedJury.value = updatedJury;

      // Reset form
      newMemberForm.value = {
        userId: null,
        roleId: null,
      };

      // Refresh all users list
      await fetchAllUsers();

      setTimeout(() => (successMessage.value = ""), 3000);
    }
  } catch (err) {
    error.value = err.response?.data?.message || "Failed to assign member";
    setTimeout(() => (error.value = ""), 5000);
  } finally {
    assigningMember.value = false;
  }
};

const confirmRemoveMember = (memberId) => {
  memberToRemove.value = memberId;
  showRemoveMemberModal.value = true;
};

const removeMemberFromJury = async () => {
  if (!memberToRemove.value) return;

  removingMember.value = true;
  error.value = "";

  try {
    const response = await api.delete(
      `/juries/${selectedJury.value.id}/members/${memberToRemove.value}`
    );
    if (response.data.success) {
      successMessage.value = "Member removed successfully!";
      await fetchJuries();

      // Update selected jury
      const updatedJury = juries.value.find(
        (j) => j.id === selectedJury.value.id
      );
      selectedJury.value = updatedJury;

      showRemoveMemberModal.value = false;
      memberToRemove.value = null;

      // Refresh all users list
      await fetchAllUsers();

      setTimeout(() => (successMessage.value = ""), 3000);
    }
  } catch (err) {
    error.value = err.response?.data?.message || "Failed to remove member";
    setTimeout(() => (error.value = ""), 5000);
  } finally {
    removingMember.value = false;
  }
};

const openProjectsModal = (jury) => {
  selectedJury.value = jury;
  // Pre-select currently assigned projects
  selectedProjectIds.value =
    jury.jury_project?.map((jp) => jp.project.id) || [];
  showProjectsModal.value = true;
};

const closeProjectsModal = () => {
  showProjectsModal.value = false;
  selectedJury.value = null;
  selectedProjectIds.value = [];
};

const assignProjectsToJury = async () => {
  assigningProjects.value = true;
  error.value = "";

  try {
    const response = await api.post(
      `/juries/${selectedJury.value.id}/projects`,
      {
        projectIds: selectedProjectIds.value,
      }
    );
    if (response.data.success) {
      successMessage.value = "Projects assigned successfully!";
      await fetchJuries();
      closeProjectsModal();
      setTimeout(() => (successMessage.value = ""), 3000);
    }
  } catch (err) {
    error.value = err.response?.data?.message || "Failed to assign projects";
    setTimeout(() => (error.value = ""), 5000);
  } finally {
    assigningProjects.value = false;
  }
};

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return "No date set";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const getJuryMembersCount = (jury) => {
  if (jury.socio_economic_partner) {
    return jury.jury_membres_relation?.length + 1 || 0;
  } else {
    return jury.jury_membres_relation?.length || 0;
  }
};

const getJuryProjectsCount = (jury) => {
  return jury.jury_project?.length || 0;
};

const getInitials = (firstName, lastName) => {
  if (!firstName && !lastName) return "?";
  const first = firstName?.[0] || "";
  const last = lastName?.[0] || "";
  return `${first}${last}`.toUpperCase();
};

const getThisMonthCount = () => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return juries.value.filter((jury) => {
    if (!jury.date) return false;
    const juryDate = new Date(jury.date);
    return (
      juryDate.getMonth() === currentMonth &&
      juryDate.getFullYear() === currentYear
    );
  }).length;
};

const goBack = () => {
  router.push("/dashboard");
};

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchJuries(),
    fetchFaculties(),
    fetchLocations(),
    fetchPartners(),
    fetchJuryMembers(),
    fetchProjects(),
  ]);
});
</script>

<style scoped>
.juries-management {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  padding: 30px;
  background: #f5f5f5;
  min-height: 100vh;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  background: #f0f0f0;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 20px;
}

.back-btn:hover {
  background: #e0e0e0;
  transform: translateX(-2px);
}

.back-icon {
  font-size: 20px;
  color: #1a1a1a;
}

.header-text h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.header-text p {
  font-size: 14px;
  color: #666;
}

.btn-create {
  background: #0066ff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-create:hover {
  background: #0052cc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 102, 255, 0.3);
}

.icon {
  font-size: 16px;
}

/* Filters Section */
.filters-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
}

.search-input {
  width: 100%;
  padding: 10px 10px 10px 40px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #0066ff;
}

.stats-badges {
  display: flex;
  gap: 12px;
}

.stats-badge {
  background: #f8f9ff;
  border: 2px solid #e6edff;
  padding: 8px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge-label {
  font-size: 13px;
  font-weight: 600;
  color: #666;
}

.badge-value {
  font-size: 16px;
  font-weight: 700;
  color: #0066ff;
}

/* Messages */
.error-message,
.success-message {
  padding: 14px 18px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 14px;
}

.error-message {
  background: #fff5f5;
  border: 2px solid #ffcccc;
  border-left: 4px solid #ff4444;
  color: #cc0000;
}

.success-message {
  background: #f0fff4;
  border: 2px solid #c6f6d5;
  border-left: 4px solid #48bb78;
  color: #2f855a;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
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

/* Juries Grid */
.juries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.jury-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.jury-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #e6edff;
}

.jury-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.jury-icon {
  font-size: 32px;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.jury-info {
  flex: 1;
}

.jury-code {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.jury-date {
  font-size: 13px;
  color: #666;
}

.jury-details {
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 13px;
}

.detail-label {
  font-weight: 600;
  color: #666;
  min-width: 100px;
}

.detail-value {
  color: #1a1a1a;
}

.jury-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9ff;
  border-radius: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-icon {
  font-size: 16px;
}

.stat-text {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
}

.jury-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.btn-action {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-members {
  background: #e6edff;
  color: #0066ff;
}

.btn-members:hover {
  background: #d0ddff;
}

.btn-projects {
  background: #fff3e0;
  color: #ff9800;
}

.btn-projects:hover {
  background: #ffe0b2;
}

.btn-edit {
  background: #e8f5e9;
  color: #4caf50;
}

.btn-edit:hover {
  background: #c8e6c9;
}

.btn-delete {
  background: #ffebee;
  color: #f44336;
}

.btn-delete:hover {
  background: #ffcdd2;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 16px;
  color: #666;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-large {
  max-width: 800px;
}

.modal-small {
  max-width: 400px;
}

.modal-header {
  padding: 24px;
  border-bottom: 2px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
}

.close-btn {
  background: #f0f0f0;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  color: #666;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e0e0e0;
  color: #1a1a1a;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 14px;
  color: #1a1a1a;
}

.required {
  color: #ff4444;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #0066ff;
}

.input-error {
  border-color: #ff4444;
}

.char-counter {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.error-text {
  font-size: 12px;
  color: #ff4444;
  margin-top: 4px;
  display: block;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 2px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel,
.btn-submit,
.btn-delete-confirm {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #f0f0f0;
  color: #1a1a1a;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-submit {
  background: #0066ff;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #0052cc;
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-delete-confirm {
  background: #ff4444;
  color: white;
}

.btn-delete-confirm:hover:not(:disabled) {
  background: #cc0000;
}

.btn-delete-confirm:disabled {
  background: #ffcccc;
  cursor: not-allowed;
}

/* Members Modal */
.warning-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fff3cd;
  border: 2px solid #ffc107;
  border-left: 4px solid #ff9800;
  border-radius: 8px;
  margin-bottom: 20px;
  color: #856404;
}

.warning-banner .warning-icon {
  font-size: 24px;
}

.advanced-search {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 2px solid #e6edff;
}

.search-filters-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 12px;
}

.search-results-info {
  padding: 8px 12px;
  background: #e6edff;
  color: #0066ff;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}

.assign-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9ff;
  border-radius: 8px;
}

.assign-section h3 {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.assign-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 12px;
  align-items: flex-end;
}

.assign-form-grid .form-group {
  margin-bottom: 0;
}

.assign-form-grid .required {
  color: #ff4444;
  font-weight: 700;
}

.help-text {
  margin-top: 12px;
  font-size: 13px;
  color: #666;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border-left: 3px solid #0066ff;
}

.assign-form {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.assign-form .form-group {
  flex: 1;
  margin-bottom: 0;
}

.btn-assign {
  padding: 10px 20px;
  background: #0066ff;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  height: 42px;
}

.btn-assign:hover:not(:disabled) {
  background: #0052cc;
  transform: translateY(-1px);
}

.btn-assign:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.members-list-section h3 {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.members-table {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.member-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 2px solid #e6edff;
  transition: all 0.3s ease;
}

.member-row:hover {
  border-color: #0066ff;
  box-shadow: 0 4px 12px rgba(0, 102, 255, 0.1);
}

.member-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
}

.member-details {
  flex: 1;
}

.member-name {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.member-role {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  background: #e6edff;
  color: #0066ff;
  border-radius: 12px;
  font-weight: 600;
  font-size: 12px;
}

.member-email {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.member-user-role {
  font-size: 12px;
  color: #666;
  font-style: italic;
}

.empty-members {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-members .empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-members p {
  margin: 8px 0;
}

.empty-members .empty-subtitle {
  font-size: 13px;
  color: #ccc;
}

.btn-remove {
  padding: 8px 16px;
  background: #ffebee;
  color: #f44336;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-remove:hover:not(:disabled) {
  background: #ffcdd2;
}

.btn-remove:disabled {
  background: #f0f0f0;
  color: #ccc;
  cursor: not-allowed;
}

.empty-members {
  text-align: center;
  padding: 40px 20px;
  background: #f8f9ff;
  border-radius: 8px;
  color: #666;
}

/* Projects Modal */
.projects-section {
  margin-bottom: 30px;
}

.projects-section h3 {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
  padding: 12px;
  background: #f8f9ff;
  border-radius: 8px;
  margin-bottom: 12px;
}

.project-checkbox-item {
  background: white;
  border-radius: 6px;
  border: 2px solid #e0e0e0;
  transition: all 0.2s ease;
}

.project-checkbox-item:hover {
  border-color: #0066ff;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  cursor: pointer;
}

.project-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.project-info-box {
  flex: 1;
}

.project-title {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 2px;
}

.project-code {
  font-size: 11px;
  color: #666;
}

.selected-count {
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #0066ff;
  padding: 8px;
  background: white;
  border-radius: 6px;
}

.current-projects-section {
  margin-top: 24px;
}

.current-projects-section h3 {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.assigned-projects-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.assigned-project-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9ff;
  border-radius: 8px;
  border: 2px solid #e6edff;
}

.project-icon {
  font-size: 24px;
}

.project-details {
  flex: 1;
}

.project-details .project-title {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 2px;
}

.project-details .project-code {
  font-size: 11px;
  color: #666;
}

.empty-projects {
  text-align: center;
  padding: 40px 20px;
  background: #f8f9ff;
  border-radius: 8px;
  color: #666;
}

/* Delete Modal */
.delete-warning {
  text-align: center;
  padding: 20px;
}

.warning-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.delete-warning p {
  font-size: 14px;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.warning-text {
  font-size: 13px;
  color: #ff4444;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .juries-management {
    padding: 20px;
  }

  .header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .filters-section {
    flex-direction: column;
    gap: 16px;
  }

  .search-box {
    max-width: 100%;
  }

  .stats-badges {
    justify-content: space-between;
  }

  .juries-grid {
    grid-template-columns: 1fr;
  }

  .jury-actions {
    grid-template-columns: 1fr;
  }

  .assign-form {
    flex-direction: column;
    align-items: stretch;
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }

  .assigned-projects-list {
    grid-template-columns: 1fr;
  }
}
</style>
