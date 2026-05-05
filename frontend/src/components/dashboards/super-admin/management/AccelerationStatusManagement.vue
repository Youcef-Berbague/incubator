<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../../../stores/useAuthStore";
import api from "../../../../api.js";

const router = useRouter();
const authStore = useAuthStore();

// Data
const statuses = ref([]);
const loading = ref(false);
const error = ref("");
const successMessage = ref("");

// Filters
const filters = ref({
  search: "",
});

// Modals
const showDetailsModal = ref(false);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);

const selectedStatus = ref(null);
const statusToDelete = ref(null);

// Form data
const statusForm = ref({
  acceleration_name: "",
});

// Fetch statuses
const fetchStatuses = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await api.get("/acceleration-statuses");
    statuses.value = response.data.data || [];
  } catch (err) {
    console.error("Error fetching acceleration statuses:", err);
    error.value = "Failed to fetch acceleration statuses. Please try again.";
  } finally {
    loading.value = false;
  }
};

// Filtered statuses
const filteredStatuses = computed(() => {
  let result = [...statuses.value];

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    result = result.filter((status) =>
      status.acceleration_name?.toLowerCase().includes(search)
    );
  }

  return result;
});

// View status details
const viewStatus = (status) => {
  selectedStatus.value = status;
  showDetailsModal.value = true;
};

// Open create modal
const openCreateModal = () => {
  statusForm.value = {
    acceleration_name: "",
  };
  showCreateModal.value = true;
};

// Create status
const createStatus = async () => {
  loading.value = true;
  error.value = "";
  successMessage.value = "";

  try {
    await api.post("/acceleration-statuses", statusForm.value);
    successMessage.value = "Acceleration status created successfully!";
    showCreateModal.value = false;
    await fetchStatuses();
  } catch (err) {
    console.error("Error creating acceleration status:", err);
    error.value =
      err.response?.data?.message || "Failed to create acceleration status.";
  } finally {
    loading.value = false;
  }
};

// Open edit modal
const openEditModal = (status) => {
  selectedStatus.value = status;
  statusForm.value = {
    acceleration_name: status.acceleration_name,
  };
  showEditModal.value = true;
};

// Update status
const updateStatus = async () => {
  loading.value = true;
  error.value = "";
  successMessage.value = "";

  try {
    await api.put(
      `/acceleration-statuses/${selectedStatus.value.id}`,
      statusForm.value
    );
    successMessage.value = "Acceleration status updated successfully!";
    showEditModal.value = false;
    await fetchStatuses();
  } catch (err) {
    console.error("Error updating acceleration status:", err);
    error.value =
      err.response?.data?.message || "Failed to update acceleration status.";
  } finally {
    loading.value = false;
  }
};

// Open delete confirmation
const openDeleteModal = (status) => {
  statusToDelete.value = status;
  showDeleteModal.value = true;
};

// Delete status
const deleteStatus = async () => {
  loading.value = true;
  error.value = "";
  successMessage.value = "";

  try {
    await api.delete(`/acceleration-statuses/${statusToDelete.value.id}`);
    successMessage.value = "Acceleration status deleted successfully!";
    showDeleteModal.value = false;
    await fetchStatuses();
  } catch (err) {
    console.error("Error deleting acceleration status:", err);
    error.value =
      err.response?.data?.message || "Failed to delete acceleration status.";
  } finally {
    loading.value = false;
  }
};

// Clear messages
const clearMessages = () => {
  error.value = "";
  successMessage.value = "";
};

onMounted(() => {
  fetchStatuses();
});
</script>

<template>
  <div class="acceleration-status-management">
    <div class="container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <button
            @click="router.push('/dashboard')"
            class="back-btn"
            title="Back to Dashboard"
          >
            <span class="back-icon">←</span>
          </button>
          <div class="header-text">
            <h1>Acceleration Status Management</h1>
            <p>Manage project acceleration phases and statuses</p>
          </div>
        </div>
        <button @click="openCreateModal" class="btn btn-primary">
          <span class="icon">➕</span>
          Add New Status
        </button>
      </div>

      <!-- Messages -->
      <div v-if="successMessage" class="alert alert-success">
        {{ successMessage }}
        <button @click="clearMessages" class="close-btn">×</button>
      </div>
      <div v-if="error" class="alert alert-error">
        {{ error }}
        <button @click="clearMessages" class="close-btn">×</button>
      </div>

      <!-- Search -->
      <div class="filters-card">
        <div class="form-group">
          <label>Search</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search statuses..."
            class="form-control"
          />
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading && statuses.length === 0" class="loading-state">
        <div class="spinner"></div>
        <p>Loading acceleration statuses...</p>
      </div>

      <!-- Statuses List -->
      <div v-else class="statuses-grid">
        <div v-if="filteredStatuses.length === 0" class="empty-state">
          <div class="empty-icon">🚀</div>
          <p>No acceleration statuses found</p>
        </div>

        <div
          v-for="status in filteredStatuses"
          :key="status.id"
          class="status-card"
        >
          <div class="status-content">
            <div class="status-icon">🎯</div>
            <div class="status-info">
              <h3 class="status-name">{{ status.acceleration_name }}</h3>
              <p class="status-id">ID: {{ status.id }}</p>
            </div>
          </div>
          <div class="status-actions">
            <button @click="viewStatus(status)" class="btn btn-sm btn-outline">
              View
            </button>
            <button
              @click="openEditModal(status)"
              class="btn btn-sm btn-outline"
            >
              Edit
            </button>
            <button
              @click="openDeleteModal(status)"
              class="btn btn-sm btn-danger"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-footer">
        <p>
          Total Statuses: <strong>{{ statuses.length }}</strong>
        </p>
      </div>
    </div>

    <!-- Details Modal -->
    <div
      v-if="showDetailsModal"
      class="modal-overlay"
      @click="showDetailsModal = false"
    >
      <div class="modal-content modal-small" @click.stop>
        <div class="modal-header">
          <h2>Status Details</h2>
          <button @click="showDetailsModal = false" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-group">
            <label>Status ID</label>
            <p>{{ selectedStatus.id }}</p>
          </div>
          <div class="detail-group">
            <label>Acceleration Name</label>
            <p>{{ selectedStatus.acceleration_name }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showCreateModal || showEditModal"
      class="modal-overlay"
      @click="
        showCreateModal = false;
        showEditModal = false;
      "
    >
      <div class="modal-content modal-small" @click.stop>
        <div class="modal-header">
          <h2>{{ showCreateModal ? "Create New Status" : "Edit Status" }}</h2>
          <button
            @click="
              showCreateModal = false;
              showEditModal = false;
            "
            class="close-btn"
          >
            ×
          </button>
        </div>
        <div class="modal-body">
          <form
            @submit.prevent="showCreateModal ? createStatus() : updateStatus()"
          >
            <div class="form-group">
              <label>Acceleration Name <span class="required">*</span></label>
              <input
                v-model="statusForm.acceleration_name"
                type="text"
                required
                maxlength="30"
                placeholder="e.g., Phase 1, In Progress, Completed"
                class="form-control"
              />
              <small class="form-hint">Maximum 30 characters</small>
            </div>
            <div class="modal-actions">
              <button
                type="button"
                @click="
                  showCreateModal = false;
                  showEditModal = false;
                "
                class="btn btn-outline"
              >
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                {{
                  loading
                    ? "Saving..."
                    : showCreateModal
                    ? "Create Status"
                    : "Update Status"
                }}
              </button>
            </div>
          </form>
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
          <h2>Confirm Delete</h2>
          <button @click="showDeleteModal = false" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete this acceleration status?</p>
          <p class="warning-text">
            <strong>Status:</strong> {{ statusToDelete?.acceleration_name }}
          </p>
          <p class="text-muted">
            This action cannot be undone. This status cannot be deleted if it's
            assigned to any projects.
          </p>
        </div>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="btn btn-outline">
            Cancel
          </button>
          <button
            @click="deleteStatus"
            class="btn btn-danger"
            :disabled="loading"
          >
            {{ loading ? "Deleting..." : "Delete Status" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.acceleration-status-management {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 24px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  gap: 16px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.back-btn:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
  transform: translateX(-2px);
}

.back-icon {
  font-size: 20px;
  color: #4a5568;
}

.header-text {
  flex: 1;
}

.page-header h1 {
  font-size: 28px;
  color: #1a202c;
  margin: 0 0 4px 0;
}

.page-header p {
  color: #718096;
  margin: 0;
}

.alert {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alert-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.close-btn {
  background: #f7fafc;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
  color: #718096;
  font-weight: 300;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #1a202c;
  transform: rotate(90deg);
}

.filters-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-control {
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.form-hint {
  color: #718096;
  font-size: 12px;
  margin-top: 4px;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top-color: #4299e1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.statuses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.status-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid #f7fafc;
}

.status-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  border-color: #e2e8f0;
}

.status-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-icon {
  font-size: 40px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  flex-shrink: 0;
}

.status-info {
  flex: 1;
}

.status-name {
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 4px 0;
}

.status-id {
  font-size: 13px;
  color: #718096;
  margin: 0;
}

.status-actions {
  display: flex;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.stats-footer {
  background: white;
  border-radius: 12px;
  padding: 16px 24px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stats-footer p {
  margin: 0;
  color: #4a5568;
  font-size: 14px;
}

.stats-footer strong {
  color: #1a202c;
  font-size: 18px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #4299e1;
  color: white;
}

.btn-primary:hover {
  background: #3182ce;
}

.btn-outline {
  background: white;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.btn-outline:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.btn-danger {
  background: #f56565;
  color: white;
}

.btn-danger:hover {
  background: #e53e3e;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 14px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
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
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-small {
  max-width: 500px;
}

.modal-header {
  padding: 24px 24px 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
  border-radius: 16px 16px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1a202c;
}

.modal-body {
  padding: 24px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f7fafc;
}

.detail-group {
  margin-bottom: 20px;
}

.detail-group label {
  font-weight: 600;
  color: #2d3748;
  display: block;
  margin-bottom: 8px;
}

.detail-group p {
  color: #4a5568;
  margin: 0;
}

.required {
  color: #f56565;
}

.warning-text {
  background: #fff3cd;
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid #ffc107;
  margin: 16px 0;
}

.text-muted {
  color: #718096;
  font-size: 14px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .statuses-grid {
    grid-template-columns: 1fr;
  }

  .status-actions {
    flex-wrap: wrap;
  }
}
</style>
