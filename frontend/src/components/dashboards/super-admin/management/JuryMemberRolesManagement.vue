<template>
  <div class="jury-roles-management">
    <!-- Header with back button -->
    <div class="header">
      <div class="header-content">
        <button class="back-btn" @click="goBack" title="Back to Dashboard">
          <span class="back-icon">←</span>
        </button>
        <div class="header-text">
          <h1>Jury Member Roles Management</h1>
          <p>Manage roles for jury members (President, Examiner, etc.)</p>
        </div>
      </div>
      <button class="btn-create" @click="openCreateModal">
        <span class="icon">➕</span>
        Create New Role
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="filters-section">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search roles by name..."
          class="search-input"
        />
      </div>
      <div class="stats-badge">
        <span class="badge-label">Total Roles:</span>
        <span class="badge-value">{{ filteredRoles.length }}</span>
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
      <p>Loading roles...</p>
    </div>

    <!-- Roles Grid -->
    <div v-else-if="filteredRoles.length > 0" class="roles-grid">
      <div v-for="role in filteredRoles" :key="role.id" class="role-card">
        <div class="role-header">
          <div class="role-icon">👔</div>
          <div class="role-info">
            <h3 class="role-name">{{ role.name }}</h3>
            <p class="role-members-count">
              {{ getMembersCount(role) }} member(s) assigned
            </p>
          </div>
        </div>

        <div
          class="role-members"
          v-if="role.jury_membre && role.jury_membre.length > 0"
        >
          <p class="members-label">Assigned to:</p>
          <div class="members-list">
            <div
              v-for="membre in role.jury_membre.slice(0, 3)"
              :key="membre.id"
              class="member-tag"
            >
              {{ getUserName(membre) }}
            </div>
            <div v-if="role.jury_membre.length > 3" class="member-tag more-tag">
              +{{ role.jury_membre.length - 3 }} more
            </div>
          </div>
        </div>

        <div class="role-actions">
          <button
            class="btn-edit"
            @click="openEditModal(role)"
            title="Edit role"
          >
            ✏️ Edit
          </button>
          <button
            class="btn-delete"
            @click="confirmDelete(role)"
            title="Delete role"
            :disabled="role.jury_membre && role.jury_membre.length > 0"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <span class="empty-icon">📋</span>
      <p>No jury member roles found</p>
      <button class="btn-create-empty" @click="openCreateModal">
        Create First Role
      </button>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ isEditing ? "Edit Role" : "Create New Role" }}</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>

        <form @submit.prevent="submitForm" class="modal-form">
          <div class="form-group">
            <label for="roleName"
              >Role Name <span class="required">*</span></label
            >
            <input
              id="roleName"
              v-model="formData.name"
              type="text"
              placeholder="e.g., President, Examiner, Rapporteur"
              maxlength="30"
              required
              class="form-input"
            />
            <small class="form-hint">
              Maximum 30 characters ({{ formData.name.length }}/30)
            </small>
          </div>

          <div v-if="formError" class="form-error">
            {{ formError }}
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="closeModal">
              Cancel
            </button>
            <button type="submit" class="btn-submit" :disabled="submitting">
              {{
                submitting
                  ? "Saving..."
                  : isEditing
                  ? "Update Role"
                  : "Create Role"
              }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h2>Confirm Deletion</h2>
          <button class="close-btn" @click="closeDeleteModal">&times;</button>
        </div>

        <div class="delete-warning">
          <span class="warning-icon">⚠️</span>
          <p>
            Are you sure you want to delete the role
            <strong>"{{ roleToDelete?.name }}"</strong>?
          </p>
          <p class="warning-text">This action cannot be undone.</p>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="closeDeleteModal">
            Cancel
          </button>
          <button
            type="button"
            class="btn-delete-confirm"
            @click="deleteRole"
            :disabled="deleting"
          >
            {{ deleting ? "Deleting..." : "Delete Role" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../../../../api.js";

const router = useRouter();

// State
const roles = ref([]);
const loading = ref(false);
const error = ref("");
const successMessage = ref("");
const searchQuery = ref("");

// Modal state
const showModal = ref(false);
const isEditing = ref(false);
const formData = ref({
  name: "",
});
const formError = ref("");
const submitting = ref(false);
const currentRoleId = ref(null);

// Delete modal state
const showDeleteModal = ref(false);
const roleToDelete = ref(null);
const deleting = ref(false);

// Computed
const filteredRoles = computed(() => {
  if (!searchQuery.value.trim()) {
    return roles.value;
  }

  const query = searchQuery.value.toLowerCase();
  return roles.value.filter((role) => role.name?.toLowerCase().includes(query));
});

// Methods
const goBack = () => {
  router.push("/dashboard");
};

const fetchRoles = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await api.get("/jury-member-roles");

    if (response.data.success) {
      roles.value = response.data.data || [];
    } else {
      error.value = "Failed to load jury member roles";
    }
  } catch (err) {
    console.error("Error fetching roles:", err);
    error.value = err.response?.data?.message || "Failed to load roles";
  } finally {
    loading.value = false;
  }
};

const getMembersCount = (role) => {
  return role.jury_membre ? role.jury_membre.length : 0;
};

const getUserName = (membre) => {
  if (membre.users) {
    return `${membre.users.first_name} ${membre.users.last_name}`;
  }
  return "Unknown User";
};

const openCreateModal = () => {
  isEditing.value = false;
  formData.value = {
    name: "",
  };
  formError.value = "";
  showModal.value = true;
};

const openEditModal = (role) => {
  isEditing.value = true;
  currentRoleId.value = role.id;
  formData.value = {
    name: role.name || "",
  };
  formError.value = "";
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  formError.value = "";
  formData.value = {
    name: "",
  };
};

const submitForm = async () => {
  formError.value = "";

  // Validation
  if (!formData.value.name.trim()) {
    formError.value = "Role name is required";
    return;
  }

  if (formData.value.name.length > 30) {
    formError.value = "Role name must not exceed 30 characters";
    return;
  }

  submitting.value = true;

  try {
    let response;

    if (isEditing.value) {
      response = await api.put(
        `/jury-member-roles/${currentRoleId.value}`,
        formData.value
      );
    } else {
      response = await api.post("/jury-member-roles", formData.value);
    }

    if (response.data.success) {
      successMessage.value =
        response.data.message ||
        (isEditing.value
          ? "Role updated successfully"
          : "Role created successfully");
      setTimeout(() => {
        successMessage.value = "";
      }, 3000);

      closeModal();
      await fetchRoles();
    } else {
      formError.value = response.data.message || "Operation failed";
    }
  } catch (err) {
    console.error("Error submitting form:", err);
    formError.value = err.response?.data?.message || "Operation failed";
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = (role) => {
  if (role.jury_membre && role.jury_membre.length > 0) {
    error.value = `Cannot delete role "${role.name}": ${role.jury_membre.length} jury member(s) are using this role`;
    setTimeout(() => {
      error.value = "";
    }, 5000);
    return;
  }

  roleToDelete.value = role;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  roleToDelete.value = null;
};

const deleteRole = async () => {
  if (!roleToDelete.value) return;

  deleting.value = true;
  error.value = "";

  try {
    const response = await api.delete(
      `/jury-member-roles/${roleToDelete.value.id}`
    );

    if (response.data.success) {
      successMessage.value =
        response.data.message || "Role deleted successfully";
      setTimeout(() => {
        successMessage.value = "";
      }, 3000);

      closeDeleteModal();
      await fetchRoles();
    } else {
      error.value = response.data.message || "Failed to delete role";
    }
  } catch (err) {
    console.error("Error deleting role:", err);
    error.value = err.response?.data?.message || "Failed to delete role";
  } finally {
    deleting.value = false;
  }
};

// Lifecycle
onMounted(() => {
  fetchRoles();
});
</script>

<style scoped>
.jury-roles-management {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
  background: #f5f5f5;
  min-height: 100vh;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  gap: 20px;
  flex-wrap: wrap;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid #e6edff;
  background: white;
  color: #0066ff;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.back-btn:hover {
  background: #0066ff;
  color: white;
  transform: translateX(-2px);
}

.back-icon {
  display: block;
  font-weight: bold;
}

.header-text {
  flex: 1;
}

.header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 6px;
  letter-spacing: -0.5px;
}

.header p {
  font-size: 14px;
  color: #666;
}

.btn-create {
  background: linear-gradient(135deg, #0066ff 0%, #0052cc 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 102, 255, 0.2);
}

.btn-create:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 102, 255, 0.3);
}

.icon {
  font-size: 16px;
}

/* Filters */
.filters-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  align-items: center;
}

.search-box {
  flex: 1;
  min-width: 280px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 2px solid #e6edff;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #0066ff;
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
}

.stats-badge {
  background: white;
  border: 2px solid #e6edff;
  padding: 12px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge-label {
  font-size: 13px;
  color: #666;
  font-weight: 600;
}

.badge-value {
  font-size: 16px;
  font-weight: 700;
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
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
}

.error-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.success-message {
  background: #f0fdf4;
  border: 2px solid #86efac;
  border-left: 4px solid #22c55e;
  color: #166534;
  padding: 14px 18px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
}

.success-icon {
  font-size: 20px;
  flex-shrink: 0;
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
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

/* Roles Grid */
.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.role-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #f7fafc;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.role-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #e6edff;
}

.role-header {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f7fafc;
}

.role-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.role-info {
  flex: 1;
}

.role-name {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.role-members-count {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.role-members {
  margin-bottom: 20px;
}

.members-label {
  font-size: 12px;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.members-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.member-tag {
  background: #f8f9ff;
  color: #0066ff;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid #e6edff;
}

.more-tag {
  background: #e6edff;
}

.role-actions {
  display: flex;
  gap: 10px;
}

.btn-edit,
.btn-delete {
  flex: 1;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-edit {
  background: #f8f9ff;
  color: #0066ff;
  border: 2px solid #e6edff;
}

.btn-edit:hover {
  background: #0066ff;
  color: white;
}

.btn-delete {
  background: #fff5f5;
  color: #ff4444;
  border: 2px solid #ffcccc;
}

.btn-delete:hover:not(:disabled) {
  background: #ff4444;
  color: white;
}

.btn-delete:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  border: 2px dashed #e0e0e0;
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 16px;
  color: #999;
  margin-bottom: 20px;
}

.btn-create-empty {
  background: linear-gradient(135deg, #0066ff 0%, #0052cc 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-create-empty:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 102, 255, 0.3);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 24px;
  border-bottom: 2px solid #f7fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: #f7fafc;
  color: #718096;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 300;
}

.close-btn:hover {
  background: #e6edff;
  color: #1a202c;
  transform: rotate(90deg);
}

.modal-form {
  padding: 24px;
}

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

.required {
  color: #ff4444;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e6edff;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #0066ff;
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
}

.form-hint {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #999;
}

.form-error {
  background: #fff5f5;
  border: 2px solid #ffcccc;
  border-left: 4px solid #ff4444;
  color: #cc0000;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 13px;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f7fafc;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-cancel {
  background: #f7fafc;
  color: #718096;
  border: 2px solid #e6edff;
}

.btn-cancel:hover {
  background: #e6edff;
  color: #1a202c;
}

.btn-submit {
  background: linear-gradient(135deg, #0066ff 0%, #0052cc 100%);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 102, 255, 0.3);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Delete Modal */
.delete-modal {
  max-width: 450px;
}

.delete-warning {
  padding: 24px;
  text-align: center;
}

.warning-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.delete-warning p {
  font-size: 15px;
  color: #1a1a1a;
  margin-bottom: 12px;
  line-height: 1.5;
}

.delete-warning strong {
  color: #ff4444;
  font-weight: 700;
}

.warning-text {
  font-size: 13px;
  color: #999;
  font-style: italic;
}

.btn-delete-confirm {
  flex: 1;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  background: #ff4444;
  color: white;
}

.btn-delete-confirm:hover:not(:disabled) {
  background: #cc0000;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 68, 68, 0.3);
}

.btn-delete-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .jury-roles-management {
    padding: 20px 16px;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header h1 {
    font-size: 22px;
  }

  .btn-create {
    width: 100%;
    justify-content: center;
  }

  .roles-grid {
    grid-template-columns: 1fr;
  }

  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    min-width: 100%;
  }

  .stats-badge {
    justify-content: center;
  }

  .modal-content {
    width: 95%;
    max-height: 95vh;
  }
}
</style>
