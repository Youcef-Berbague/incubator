<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../../../stores/useAuthStore";
import api from "../../../../api.js";

const router = useRouter();
const authStore = useAuthStore();

// Data
const registrations = ref([]);
const loading = ref(false);
const error = ref("");
const successMessage = ref("");

// Pagination
const currentPage = ref(1);
const totalPages = ref(1);
const totalRegistrations = ref(0);
const limit = ref(10);

// Filters
const filters = ref({
  status: "",
  facultyId: "",
  departmentId: "",
  search: "",
});

// Faculties and Departments for filters
const faculties = ref([]);
const departments = ref([]);

// Selected registration for view/edit modal
const selectedRegistration = ref(null);
const showDetailsModal = ref(false);
const showDeleteModal = ref(false);
const showStatusModal = ref(false);
const registrationToDelete = ref(null);
const registrationToUpdate = ref(null);
const newStatus = ref("");
const reviewerNotes = ref("");

// Status options
const statusOptions = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "in_review", label: "In Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "revision_required", label: "Revision Required" },
  { value: "withdrawn", label: "Withdrawn" },
];

// Fetch registrations
const fetchRegistrations = async () => {
  loading.value = true;
  error.value = "";

  try {
    const params = new URLSearchParams({
      page: currentPage.value,
      limit: limit.value,
    });

    if (filters.value.status) params.append("status", filters.value.status);
    if (filters.value.facultyId)
      params.append("facultyId", filters.value.facultyId);
    if (filters.value.departmentId)
      params.append("departmentId", filters.value.departmentId);

    const response = await api.get(`/registrations?${params.toString()}`);

    if (response.data.success) {
      registrations.value = response.data.data.registrations;
      totalPages.value = response.data.data.pagination.totalPages;
      totalRegistrations.value = response.data.data.pagination.total;
    }
  } catch (err) {
    console.error("Error fetching registrations:", err);
    error.value =
      err.response?.data?.message ||
      "Failed to load registrations. Please try again.";
  } finally {
    loading.value = false;
  }
};

// Fetch faculties for filter
const fetchFaculties = async () => {
  try {
    const response = await api.get("/faculties");
    faculties.value = response.data;
  } catch (err) {
    console.error("Error fetching faculties:", err);
  }
};

// Fetch departments when faculty changes
const onFacultyChange = async (facultyId) => {
  filters.value.departmentId = "";
  departments.value = [];

  if (facultyId) {
    try {
      const response = await api.get(`/faculties/${facultyId}/departments`);
      departments.value = response.data;
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  }
};

// View registration details
const viewDetails = async (id) => {
  loading.value = true;
  error.value = "";

  try {
    const response = await api.get(`/registrations/${id}`);

    if (response.data.success) {
      selectedRegistration.value = response.data.data;
      showDetailsModal.value = true;
    }
  } catch (err) {
    console.error("Error fetching registration details:", err);
    error.value =
      err.response?.data?.message || "Failed to load registration details.";
  } finally {
    loading.value = false;
  }
};

// Open delete confirmation
const confirmDelete = (registration) => {
  registrationToDelete.value = registration;
  showDeleteModal.value = true;
};

// Delete registration
const deleteRegistration = async () => {
  if (!registrationToDelete.value) return;

  loading.value = true;
  error.value = "";

  try {
    const response = await api.delete(
      `/registrations/${registrationToDelete.value.id}`
    );

    if (response.data.success) {
      successMessage.value = "Registration deleted successfully";
      showDeleteModal.value = false;
      registrationToDelete.value = null;
      fetchRegistrations();

      setTimeout(() => {
        successMessage.value = "";
      }, 3000);
    }
  } catch (err) {
    console.error("Error deleting registration:", err);
    error.value =
      err.response?.data?.message || "Failed to delete registration.";
    showDeleteModal.value = false;
  } finally {
    loading.value = false;
  }
};

// Open status update modal
const openStatusModal = (registration) => {
  registrationToUpdate.value = registration;
  newStatus.value = registration.status;
  reviewerNotes.value = "";
  showStatusModal.value = true;
};

// Update registration status
const updateStatus = async () => {
  if (!registrationToUpdate.value || !newStatus.value) return;

  loading.value = true;
  error.value = "";

  try {
    const response = await api.patch(
      `/registrations/${registrationToUpdate.value.id}/status`,
      {
        status: newStatus.value,
        reviewerNotes: reviewerNotes.value || undefined,
      }
    );

    if (response.data.success) {
      // Check if project was created (approval)
      if (response.data.data.projectId) {
        const accountsCreated =
          response.data?.data?.accountsCreated ??
          response.data?.data?.usersCreated ??
          0;
        const accountsReused = response.data?.data?.accountsReused ?? 0;
        successMessage.value = `Registration approved! Project created with ID: ${
          response.data.data.projectId
        }. ${accountsCreated} new user(s) created${
          accountsReused ? `, ${accountsReused} existing account(s) reused` : ""
        }.`;
      } else {
        successMessage.value = "Registration status updated successfully";
      }

      showStatusModal.value = false;
      registrationToUpdate.value = null;
      newStatus.value = "";
      reviewerNotes.value = "";
      fetchRegistrations();

      setTimeout(() => {
        successMessage.value = "";
      }, 5000);
    }
  } catch (err) {
    console.error("Error updating status:", err);
    error.value =
      err.response?.data?.message || "Failed to update registration status.";
    showStatusModal.value = false;
  } finally {
    loading.value = false;
  }
};

// Apply filters
const applyFilters = () => {
  currentPage.value = 1;
  fetchRegistrations();
};

// Reset filters
const resetFilters = () => {
  filters.value = {
    status: "",
    facultyId: "",
    departmentId: "",
    search: "",
  };
  departments.value = [];
  currentPage.value = 1;
  fetchRegistrations();
};

// Pagination
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchRegistrations();
  }
};

// Status badge color
const getStatusColor = (status) => {
  const colors = {
    pending: "#f59e0b",
    in_review: "#3b82f6",
    approved: "#10b981",
    rejected: "#ef4444",
    revision_required: "#8b5cf6",
    withdrawn: "#6b7280",
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

// Close modals
const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedRegistration.value = null;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  registrationToDelete.value = null;
};

const closeStatusModal = () => {
  showStatusModal.value = false;
  registrationToUpdate.value = null;
  newStatus.value = "";
  reviewerNotes.value = "";
};

// Check if user is SuperAdmin
const isSuperAdmin = computed(() => {
  return authStore.user?.role?.includes(100);
});

// Initialize
onMounted(() => {
  fetchRegistrations();
  fetchFaculties();
});
</script>

<template>
  <div class="registrations-management">
    <div class="management-header">
      <div>
        <h1>Project Registrations</h1>
        <p>Manage and review all project registration submissions</p>
      </div>
      <button class="btn-back" @click="router.push('/dashboard')">
        ← Back to Dashboard
      </button>
    </div>

    <!-- Error/Success Messages -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>

    <!-- Filters Section -->
    <div class="filters-card">
      <h3>Filters</h3>
      <div class="filters-grid">
        <div class="filter-group">
          <label>Status</label>
          <select v-model="filters.status">
            <option
              v-for="option in statusOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Faculty</label>
          <select
            v-model="filters.facultyId"
            @change="onFacultyChange(filters.facultyId)"
          >
            <option value="">All Faculties</option>
            <option
              v-for="faculty in faculties"
              :key="faculty.id"
              :value="faculty.id"
            >
              {{ faculty.faculty_name_en }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Department</label>
          <select v-model="filters.departmentId" :disabled="!filters.facultyId">
            <option value="">All Departments</option>
            <option v-for="dept in departments" :key="dept.id" :value="dept.id">
              {{ dept.departement_name_en }}
            </option>
          </select>
        </div>

        <div class="filter-actions">
          <button class="btn-apply" @click="applyFilters">Apply Filters</button>
          <button class="btn-reset" @click="resetFilters">Reset</button>
        </div>
      </div>
    </div>

    <!-- Stats Summary -->
    <div class="stats-summary">
      <div class="stat-item">
        <span class="stat-label">Total Registrations</span>
        <span class="stat-value">{{ totalRegistrations }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Current Page</span>
        <span class="stat-value">{{ currentPage }} / {{ totalPages }}</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading registrations...</p>
    </div>

    <!-- Registrations Table -->
    <div v-else-if="registrations.length > 0" class="table-card">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Project Title</th>
              <th>Faculty</th>
              <th>Department</th>
              <th>Students</th>
              <th>Supervisors</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="registration in registrations" :key="registration.id">
              <td>{{ registration.id }}</td>
              <td class="project-title">{{ registration.projectTitle }}</td>
              <td>{{ registration.faculty?.nameEn || "N/A" }}</td>
              <td>{{ registration.department?.nameEn || "N/A" }}</td>
              <td class="centered">{{ registration.numberOfStudents }}</td>
              <td class="centered">{{ registration.numberOfSupervisors }}</td>
              <td>
                <span
                  class="status-badge"
                  :style="{ background: getStatusColor(registration.status) }"
                >
                  {{ registration.status.replace("_", " ") }}
                </span>
              </td>
              <td class="date-text">
                {{ formatDate(registration.submittedAt) }}
              </td>
              <td>
                <div class="action-buttons">
                  <button
                    class="btn-icon btn-view"
                    @click="viewDetails(registration.id)"
                    title="View Details"
                  >
                    👁️
                  </button>
                  <button
                    class="btn-icon btn-edit"
                    @click="openStatusModal(registration)"
                    title="Update Status"
                  >
                    ✏️
                  </button>
                  <button
                    v-if="isSuperAdmin"
                    class="btn-icon btn-delete"
                    @click="confirmDelete(registration)"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <button
          class="btn-page"
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
        >
          Previous
        </button>

        <div class="page-numbers">
          <button
            v-for="page in totalPages"
            :key="page"
            class="btn-page-number"
            :class="{ active: page === currentPage }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </div>

        <button
          class="btn-page"
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">📋</div>
      <p>No registrations found</p>
      <button class="btn-reset" @click="resetFilters">Clear Filters</button>
    </div>

    <!-- Details Modal -->
    <div
      v-if="showDetailsModal"
      class="modal-overlay"
      @click="closeDetailsModal"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Registration Details</h2>
          <button class="btn-close" @click="closeDetailsModal">✕</button>
        </div>

        <div v-if="selectedRegistration" class="modal-body">
          <!-- Project Information -->
          <div class="detail-section">
            <h3>Project Information</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">ID:</span>
                <span class="detail-value">{{ selectedRegistration.id }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Title:</span>
                <span class="detail-value">{{
                  selectedRegistration.projectTitle
                }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Status:</span>
                <span
                  class="status-badge"
                  :style="{
                    background: getStatusColor(selectedRegistration.status),
                  }"
                >
                  {{ selectedRegistration.status.replace("_", " ") }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Submitted:</span>
                <span class="detail-value">{{
                  formatDate(selectedRegistration.submittedAt)
                }}</span>
              </div>
            </div>
          </div>

          <!-- Academic Information -->
          <div class="detail-section">
            <h3>Academic Information</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Faculty:</span>
                <span class="detail-value">{{
                  selectedRegistration.faculty?.nameEn || "N/A"
                }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Department:</span>
                <span class="detail-value">{{
                  selectedRegistration.department?.nameEn || "N/A"
                }}</span>
              </div>
            </div>
          </div>

          <!-- Students -->
          <div class="detail-section">
            <h3>Students ({{ selectedRegistration.students?.length || 0 }})</h3>
            <div
              v-for="(student, index) in selectedRegistration.students"
              :key="student.id"
              class="person-card"
            >
              <h4>Student {{ index + 1 }}</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Name:</span>
                  <span class="detail-value"
                    >{{ student.firstName }} {{ student.lastName }}</span
                  >
                </div>
                <div class="detail-item">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">{{ student.email || "N/A" }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Phone:</span>
                  <span class="detail-value">{{ student.phone || "N/A" }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Academic Level:</span>
                  <span class="detail-value">{{ student.academicLevel }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Supervisors -->
          <div class="detail-section">
            <h3>
              Supervisors ({{ selectedRegistration.supervisors?.length || 0 }})
            </h3>
            <div
              v-for="(supervisor, index) in selectedRegistration.supervisors"
              :key="supervisor.id"
              class="person-card"
            >
              <h4>Supervisor {{ index + 1 }}</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Name:</span>
                  <span class="detail-value"
                    >{{ supervisor.firstName }} {{ supervisor.lastName }}</span
                  >
                </div>
                <div class="detail-item">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">{{
                    supervisor.email || "N/A"
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Phone:</span>
                  <span class="detail-value">{{
                    supervisor.phone || "N/A"
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeDetailsModal">
            Close
          </button>
          <button
            class="btn-primary"
            @click="
              closeDetailsModal();
              openStatusModal(selectedRegistration);
            "
          >
            Update Status
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content modal-small" @click.stop>
        <div class="modal-header">
          <h2>Confirm Delete</h2>
          <button class="btn-close" @click="closeDeleteModal">✕</button>
        </div>

        <div class="modal-body">
          <p>
            Are you sure you want to delete the registration for
            <strong>{{ registrationToDelete?.projectTitle }}</strong
            >?
          </p>
          <p class="warning-text">This action cannot be undone.</p>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeDeleteModal">
            Cancel
          </button>
          <button class="btn-danger" @click="deleteRegistration">Delete</button>
        </div>
      </div>
    </div>

    <!-- Status Update Modal -->
    <div v-if="showStatusModal" class="modal-overlay" @click="closeStatusModal">
      <div class="modal-content modal-medium" @click.stop>
        <div class="modal-header">
          <h2>Update Registration Status</h2>
          <button class="btn-close" @click="closeStatusModal">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>Project Title</label>
            <input
              type="text"
              :value="registrationToUpdate?.projectTitle"
              disabled
              class="input-disabled"
            />
          </div>

          <div class="form-group">
            <label>Current Status</label>
            <span
              class="status-badge"
              :style="{
                background: getStatusColor(registrationToUpdate?.status),
              }"
            >
              {{ registrationToUpdate?.status.replace("_", " ") }}
            </span>
          </div>

          <div class="form-group">
            <label class="required">New Status</label>
            <select v-model="newStatus" required>
              <option
                v-for="option in statusOptions.filter((o) => o.value)"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Reviewer Notes (Optional)</label>
            <textarea
              v-model="reviewerNotes"
              rows="4"
              placeholder="Add any notes about this status change..."
            ></textarea>
          </div>

          <div v-if="newStatus === 'approved'" class="info-box">
            <strong>⚠️ Approval Action:</strong>
            <p>Approving this registration will automatically create:</p>
            <ul>
              <li>Project in the system</li>
              <li>User accounts for all students</li>
              <li>User accounts for all supervisors</li>
              <li>Team assignments</li>
              <li>Random passwords (sent via Telegram)</li>
            </ul>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeStatusModal">
            Cancel
          </button>
          <button
            class="btn-primary"
            @click="updateStatus"
            :disabled="!newStatus"
          >
            Update Status
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.registrations-management {
  padding: 30px;
  max-width: 1600px;
  margin: 0 auto;
}

.management-header {
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.management-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.management-header p {
  font-size: 15px;
  color: #666;
}

.btn-back {
  padding: 12px 24px;
  border-radius: 8px;
  background: white;
  color: #1a1a1a;
  border: 2px solid #e0e0e0;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  white-space: nowrap;
}

.btn-back:hover {
  background: #f8f8f8;
  border-color: #0066ff;
  color: #0066ff;
}

/* Messages */
.error-message {
  background: #fff5f5;
  border: 2px solid #ffcccc;
  border-left: 4px solid #ff4444;
  color: #cc0000;
  padding: 14px 18px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 600;
}

.success-message {
  background: #f0fdf4;
  border: 2px solid #86efac;
  border-left: 4px solid #22c55e;
  color: #166534;
  padding: 14px 18px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 600;
}

/* Filters */
.filters-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filters-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 20px;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  align-items: end;
}

.filter-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.filter-group select {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e6edff;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background: white;
  color: #1a1a1a;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-group select:focus {
  outline: none;
  border-color: #0066ff;
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
}

.filter-group select:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.filter-actions {
  display: flex;
  gap: 10px;
}

.btn-apply,
.btn-reset {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-family: inherit;
}

.btn-apply {
  background: #0066ff;
  color: white;
  flex: 1;
}

.btn-apply:hover {
  background: #0052cc;
}

.btn-reset {
  background: white;
  color: #1a1a1a;
  border: 2px solid #e0e0e0;
}

.btn-reset:hover {
  background: #f8f8f8;
  border-color: #1a1a1a;
}

/* Stats Summary */
.stats-summary {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.stat-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  flex: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #0066ff;
}

/* Loading */
.loading-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f0f0f0;
  border-top: 4px solid #0066ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
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

/* Table */
.table-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.table-wrapper {
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
  text-align: left;
  padding: 16px;
  font-weight: 600;
  font-size: 14px;
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
  color: #0066ff;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.centered {
  text-align: center;
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

.date-text {
  color: #666;
  font-size: 13px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-view {
  background: #e6edff;
}

.btn-view:hover {
  background: #0066ff;
}

.btn-edit {
  background: #fff7ed;
}

.btn-edit:hover {
  background: #f59e0b;
}

.btn-delete {
  background: #fff5f5;
}

.btn-delete:hover {
  background: #ff4444;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 24px;
  border-top: 1px solid #f0f0f0;
}

.btn-page {
  padding: 8px 16px;
  border-radius: 8px;
  border: 2px solid #e6edff;
  background: white;
  color: #1a1a1a;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-page:hover:not(:disabled) {
  background: #0066ff;
  color: white;
  border-color: #0066ff;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 6px;
}

.btn-page-number {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 2px solid #e6edff;
  background: white;
  color: #1a1a1a;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-page-number:hover {
  background: #f8f9ff;
  border-color: #0066ff;
}

.btn-page-number.active {
  background: #0066ff;
  color: white;
  border-color: #0066ff;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-state p {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
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
  border-radius: 16px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-small {
  max-width: 500px;
}

.modal-medium {
  max-width: 600px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 2px solid #f0f0f0;
}

.modal-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
}

.btn-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: #f5f5f5;
  cursor: pointer;
  font-size: 20px;
  color: #666;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: #ff4444;
  color: white;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 24px;
  border-top: 2px solid #f0f0f0;
}

/* Detail Sections */
.detail-section {
  margin-bottom: 30px;
}

.detail-section h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 15px;
  color: #1a1a1a;
  font-weight: 500;
}

.person-card {
  background: #f8f9ff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  border: 2px solid #e6edff;
}

.person-card h4 {
  font-size: 16px;
  font-weight: 600;
  color: #0066ff;
  margin-bottom: 12px;
}

/* Form Groups */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.form-group label.required::after {
  content: "*";
  color: #ff4444;
  margin-left: 4px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e6edff;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background: white;
  color: #1a1a1a;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #0066ff;
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
}

.input-disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.info-box {
  background: #fff7ed;
  border: 2px solid #fed7aa;
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
}

.info-box strong {
  display: block;
  color: #ea580c;
  margin-bottom: 8px;
}

.info-box p {
  font-size: 14px;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.info-box ul {
  margin-left: 20px;
  font-size: 14px;
  color: #666;
}

.info-box li {
  margin-bottom: 4px;
}

.warning-text {
  color: #ff4444;
  font-weight: 600;
  font-size: 14px;
  margin-top: 12px;
}

/* Buttons */
.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-family: inherit;
}

.btn-primary {
  background: #0066ff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0052cc;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #1a1a1a;
  border: 2px solid #e0e0e0;
}

.btn-secondary:hover {
  background: #f8f8f8;
  border-color: #1a1a1a;
}

.btn-danger {
  background: #ff4444;
  color: white;
}

.btn-danger:hover {
  background: #cc0000;
}

/* Responsive */
@media (max-width: 768px) {
  .registrations-management {
    padding: 20px;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .stats-summary {
    flex-direction: column;
  }

  .table-wrapper {
    overflow-x: scroll;
  }

  table {
    min-width: 800px;
  }

  .modal-content {
    max-width: 100%;
    margin: 20px;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .page-numbers {
    max-width: 200px;
    overflow-x: auto;
  }
}
</style>
