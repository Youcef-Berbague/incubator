<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/useAuthStore";
import api from "../../api.js";

const router = useRouter();
const authStore = useAuthStore();

// Data
const users = ref([]);
const availableRoles = ref([]);
const loading = ref(false);
const error = ref("");
const successMessage = ref("");

// Filters
const filters = ref({
  role: "",
  status: "",
  search: "",
});

// Modals
const showDetailsModal = ref(false);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const showPasswordModal = ref(false);

const selectedUser = ref(null);
const userToDelete = ref(null);

// Form data for create/edit
const userForm = ref({
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  password: "",
  role: [],
  status: "active",
  academic_level: "",
  departement_id: null,
});

const passwordForm = ref({
  userId: null,
  newPassword: "",
  confirmPassword: "",
});

// Status options
const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

// Academic levels
const academicLevels = ["L1", "L2", "L3", "M1", "M2", "PhD"];

// Fetch users
const fetchUsers = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await api.get("/users/all");

    if (response.data.success) {
      users.value = response.data.data;
    } else {
      users.value = response.data || [];
    }
  } catch (err) {
    console.error("Error fetching users:", err);
    error.value = "Failed to fetch users. Please try again.";
  } finally {
    loading.value = false;
  }
};

// Fetch available roles
const fetchAvailableRoles = async () => {
  try {
    const response = await api.get("/users/roles");

    if (response.data.success) {
      availableRoles.value = response.data.data;
    }
  } catch (err) {
    console.error("Error fetching roles:", err);
  }
};

// Filtered users
const filteredUsers = computed(() => {
  let result = [...users.value];

  // Filter by role
  if (filters.value.role) {
    result = result.filter((user) => {
      const userRoles = Array.isArray(user.role) ? user.role : [];
      return userRoles.includes(parseInt(filters.value.role));
    });
  }

  // Filter by status
  if (filters.value.status) {
    result = result.filter((user) => user.status === filters.value.status);
  }

  // Filter by search
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    result = result.filter((user) => {
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
      const email = user.email?.toLowerCase() || "";
      return fullName.includes(search) || email.includes(search);
    });
  }

  return result;
});

// View user details
const viewDetails = (user) => {
  selectedUser.value = { ...user };
  showDetailsModal.value = true;
};

// Open create modal
const openCreateModal = () => {
  userForm.value = {
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    role: [],
    status: "active",
    academic_level: "",
    departement_id: null,
  };
  showCreateModal.value = true;
};

// Create new user
const createUser = async () => {
  error.value = "";
  successMessage.value = "";

  try {
    // Validation
    if (
      !userForm.value.first_name ||
      !userForm.value.last_name ||
      !userForm.value.email ||
      !userForm.value.password
    ) {
      error.value = "Please fill in all required fields.";
      return;
    }

    if (userForm.value.role.length === 0) {
      error.value = "Please select at least one role.";
      return;
    }

    const response = await api.post("/users/create", {
      first_name: userForm.value.first_name,
      last_name: userForm.value.last_name,
      email: userForm.value.email,
      phone_number: userForm.value.phone_number,
      password: userForm.value.password,
      roles: userForm.value.role,
      academic_level: userForm.value.academic_level || null,
      departement_id: userForm.value.departement_id || null,
    });

    successMessage.value = "User created successfully!";
    showCreateModal.value = false;
    await fetchUsers();

    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (err) {
    console.error("Error creating user:", err);
    error.value = err.response?.data?.message || "Failed to create user.";
  }
};

// Open edit modal
const openEditModal = (user) => {
  selectedUser.value = { ...user };
  userForm.value = {
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone_number: user.phone_number,
    password: "",
    role: Array.isArray(user.role) ? [...user.role] : [],
    status: user.status,
    academic_level: user.academic_level || "",
    departement_id: user.departement_id || null,
  };
  showEditModal.value = true;
};

// Update user
const updateUser = async () => {
  error.value = "";
  successMessage.value = "";

  try {
    const updateData = {
      id: selectedUser.value.id,
      first_name: userForm.value.first_name,
      last_name: userForm.value.last_name,
      email: userForm.value.email,
      phone_number: userForm.value.phone_number,
      role: userForm.value.role,
      status: userForm.value.status,
      academic_level: userForm.value.academic_level || null,
      departement_id: userForm.value.departement_id || null,
    };

    // Only include password if it's provided
    if (userForm.value.password) {
      updateData.password = userForm.value.password;
    }

    const response = await api.put("/users/update", updateData);

    successMessage.value = "User updated successfully!";
    showEditModal.value = false;
    await fetchUsers();

    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (err) {
    console.error("Error updating user:", err);
    error.value = err.response?.data?.message || "Failed to update user.";
  }
};

// Open password modal
const openPasswordModal = (user) => {
  passwordForm.value = {
    userId: user.id,
    newPassword: "",
    confirmPassword: "",
  };
  selectedUser.value = { ...user };
  showPasswordModal.value = true;
};

// Change password
const changePassword = async () => {
  error.value = "";
  successMessage.value = "";

  try {
    if (!passwordForm.value.newPassword) {
      error.value = "Please enter a new password.";
      return;
    }

    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      error.value = "Passwords do not match.";
      return;
    }

    if (passwordForm.value.newPassword.length < 6) {
      error.value = "Password must be at least 6 characters long.";
      return;
    }

    const response = await api.put("/users/update", {
      id: passwordForm.value.userId,
      password: passwordForm.value.newPassword,
    });

    successMessage.value = "Password changed successfully!";
    showPasswordModal.value = false;

    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (err) {
    console.error("Error changing password:", err);
    error.value = err.response?.data?.message || "Failed to change password.";
  }
};

// Open delete modal
const confirmDelete = (user) => {
  userToDelete.value = user;
  showDeleteModal.value = true;
};

// Delete user
const deleteUser = async () => {
  error.value = "";
  successMessage.value = "";

  try {
    await api.delete("/users/delete", {
      data: { id: userToDelete.value.id },
    });

    successMessage.value = "User deleted successfully!";
    showDeleteModal.value = false;
    await fetchUsers();

    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (err) {
    console.error("Error deleting user:", err);
    error.value = err.response?.data?.message || "Failed to delete user.";
  }
};

// Apply filters
const applyFilters = () => {
  // Filters are applied automatically via computed property
};

// Reset filters
const resetFilters = () => {
  filters.value = {
    role: "",
    status: "",
    search: "",
  };
};

// Get role label
const getRoleLabel = (roleValue) => {
  const role = availableRoles.value.find((r) => r.value === roleValue);
  return role ? role.label : `Role ${roleValue}`;
};

// Get role labels for user
const getUserRoleLabels = (userRoles) => {
  if (!Array.isArray(userRoles)) return "";
  return userRoles.map((roleValue) => getRoleLabel(roleValue)).join(", ");
};

// Check if user is SuperAdmin
const isSuperAdmin = computed(() => {
  return authStore.user?.role?.includes(100);
});

// Close modals
const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedUser.value = null;
};

const closeCreateModal = () => {
  showCreateModal.value = false;
  error.value = "";
};

const closeEditModal = () => {
  showEditModal.value = false;
  selectedUser.value = null;
  error.value = "";
};

const closePasswordModal = () => {
  showPasswordModal.value = false;
  selectedUser.value = null;
  error.value = "";
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  userToDelete.value = null;
  error.value = "";
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Initialize
onMounted(() => {
  fetchUsers();
  fetchAvailableRoles();
});
</script>

<template>
  <div class="users-management">
    <!-- Header -->
    <div class="management-header">
      <div>
        <h1>Users Management</h1>
        <p>Manage user accounts, roles, and permissions</p>
      </div>
      <div class="header-actions">
        <button class="btn-back" @click="router.push('/dashboard')">
          ← Back to Dashboard
        </button>
        <button class="btn-create" @click="openCreateModal">
          + Create User
        </button>
      </div>
    </div>

    <!-- Messages -->
    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>

    <!-- Filters -->
    <div class="filters-card">
      <h3>Filter Users</h3>
      <div class="filters-grid">
        <div class="filter-group">
          <label>Role</label>
          <select v-model="filters.role">
            <option value="">All Roles</option>
            <option
              v-for="role in availableRoles"
              :key="role.value"
              :value="role.value"
            >
              {{ role.label }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Status</label>
          <select v-model="filters.status">
            <option value="">All Status</option>
            <option
              v-for="status in statusOptions"
              :key="status.value"
              :value="status.value"
            >
              {{ status.label }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Search</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search by name or email..."
          />
        </div>

        <div class="filter-actions">
          <button class="btn-reset" @click="resetFilters">Reset</button>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-summary">
      <div class="stat-item">
        <span class="stat-label">Total Users</span>
        <span class="stat-value">{{ filteredUsers.length }}</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading users...</p>
    </div>

    <!-- Users Table -->
    <div v-else class="table-card">
      <div v-if="filteredUsers.length === 0" class="empty-state">
        <span class="empty-icon">👤</span>
        <p>No users found</p>
      </div>

      <div v-else class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role(s)</th>
              <th>Status</th>
              <th>Academic Level</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>{{ user.id }}</td>
              <td class="user-name">
                {{ user.first_name }} {{ user.last_name }}
              </td>
              <td>{{ user.email }}</td>
              <td>{{ user.phone_number || "N/A" }}</td>
              <td>
                <span class="roles-text">{{
                  getUserRoleLabels(user.role)
                }}</span>
              </td>
              <td>
                <span
                  class="status-badge"
                  :style="{
                    background: user.status === 'active' ? '#4caf50' : '#999',
                  }"
                >
                  {{ user.status }}
                </span>
              </td>
              <td>{{ user.academic_level || "N/A" }}</td>
              <td class="date-text">{{ formatDate(user.createdate) }}</td>
              <td>
                <div class="action-buttons">
                  <button
                    class="btn-icon btn-view"
                    @click="viewDetails(user)"
                    title="View Details"
                  >
                    👁️
                  </button>
                  <button
                    class="btn-icon btn-edit"
                    @click="openEditModal(user)"
                    title="Edit User"
                  >
                    ✏️
                  </button>
                  <button
                    class="btn-icon btn-password"
                    @click="openPasswordModal(user)"
                    title="Change Password"
                  >
                    🔑
                  </button>
                  <button
                    v-if="isSuperAdmin"
                    class="btn-icon btn-delete"
                    @click="confirmDelete(user)"
                    title="Delete User"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Details Modal -->
    <div
      v-if="showDetailsModal"
      class="modal-overlay"
      @click="closeDetailsModal"
    >
      <div class="modal-content modal-medium" @click.stop>
        <div class="modal-header">
          <h2>User Details</h2>
          <button class="btn-close" @click="closeDetailsModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="detail-section">
            <h3>Personal Information</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">ID:</span>
                <span class="detail-value">{{ selectedUser.id }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">First Name:</span>
                <span class="detail-value">{{ selectedUser.first_name }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Last Name:</span>
                <span class="detail-value">{{ selectedUser.last_name }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Email:</span>
                <span class="detail-value">{{ selectedUser.email }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">{{
                  selectedUser.phone_number || "N/A"
                }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Academic Level:</span>
                <span class="detail-value">{{
                  selectedUser.academic_level || "N/A"
                }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Account Information</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Role(s):</span>
                <span class="detail-value">{{
                  getUserRoleLabels(selectedUser.role)
                }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Status:</span>
                <span class="detail-value">{{ selectedUser.status }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Created:</span>
                <span class="detail-value">{{
                  formatDate(selectedUser.createdate)
                }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Last Updated:</span>
                <span class="detail-value">{{
                  formatDate(selectedUser.updatedate)
                }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeDetailsModal">
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Create User Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
      <div class="modal-content modal-medium" @click.stop>
        <div class="modal-header">
          <h2>Create New User</h2>
          <button class="btn-close" @click="closeCreateModal">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="error" class="error-message">{{ error }}</div>

          <div class="form-group">
            <label class="required">First Name</label>
            <input v-model="userForm.first_name" type="text" required />
          </div>

          <div class="form-group">
            <label class="required">Last Name</label>
            <input v-model="userForm.last_name" type="text" required />
          </div>

          <div class="form-group">
            <label class="required">Email</label>
            <input v-model="userForm.email" type="email" required />
          </div>

          <div class="form-group">
            <label>Phone Number</label>
            <input v-model="userForm.phone_number" type="text" />
          </div>

          <div class="form-group">
            <label class="required">Password</label>
            <input v-model="userForm.password" type="password" required />
          </div>

          <div class="form-group">
            <label class="required">Role(s)</label>
            <div class="checkbox-group">
              <label
                v-for="role in availableRoles"
                :key="role.value"
                class="checkbox-label"
              >
                <input
                  type="checkbox"
                  :value="role.value"
                  v-model="userForm.role"
                />
                {{ role.label }}
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>Status</label>
            <select v-model="userForm.status">
              <option
                v-for="status in statusOptions"
                :key="status.value"
                :value="status.value"
              >
                {{ status.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Academic Level</label>
            <select v-model="userForm.academic_level">
              <option value="">Select level</option>
              <option
                v-for="level in academicLevels"
                :key="level"
                :value="level"
              >
                {{ level }}
              </option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeCreateModal">
            Cancel
          </button>
          <button class="btn-primary" @click="createUser">Create User</button>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content modal-medium" @click.stop>
        <div class="modal-header">
          <h2>Edit User</h2>
          <button class="btn-close" @click="closeEditModal">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="error" class="error-message">{{ error }}</div>

          <div class="form-group">
            <label class="required">First Name</label>
            <input v-model="userForm.first_name" type="text" required />
          </div>

          <div class="form-group">
            <label class="required">Last Name</label>
            <input v-model="userForm.last_name" type="text" required />
          </div>

          <div class="form-group">
            <label class="required">Email</label>
            <input v-model="userForm.email" type="email" required />
          </div>

          <div class="form-group">
            <label>Phone Number</label>
            <input v-model="userForm.phone_number" type="text" />
          </div>

          <div class="form-group">
            <label class="required">Role(s)</label>
            <div class="checkbox-group">
              <label
                v-for="role in availableRoles"
                :key="role.value"
                class="checkbox-label"
              >
                <input
                  type="checkbox"
                  :value="role.value"
                  v-model="userForm.role"
                />
                {{ role.label }}
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>Status</label>
            <select v-model="userForm.status">
              <option
                v-for="status in statusOptions"
                :key="status.value"
                :value="status.value"
              >
                {{ status.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Academic Level</label>
            <select v-model="userForm.academic_level">
              <option value="">Select level</option>
              <option
                v-for="level in academicLevels"
                :key="level"
                :value="level"
              >
                {{ level }}
              </option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeEditModal">Cancel</button>
          <button class="btn-primary" @click="updateUser">Update User</button>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div
      v-if="showPasswordModal"
      class="modal-overlay"
      @click="closePasswordModal"
    >
      <div class="modal-content modal-small" @click.stop>
        <div class="modal-header">
          <h2>Change Password</h2>
          <button class="btn-close" @click="closePasswordModal">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="error" class="error-message">{{ error }}</div>

          <p class="info-text">
            Changing password for:
            <strong
              >{{ selectedUser.first_name }}
              {{ selectedUser.last_name }}</strong
            >
          </p>

          <div class="form-group">
            <label class="required">New Password</label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              required
            />
          </div>

          <div class="form-group">
            <label class="required">Confirm Password</label>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              required
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closePasswordModal">
            Cancel
          </button>
          <button class="btn-primary" @click="changePassword">
            Change Password
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
          <div v-if="error" class="error-message">{{ error }}</div>
          <p>
            Are you sure you want to delete user
            <strong
              >{{ userToDelete?.first_name }}
              {{ userToDelete?.last_name }}</strong
            >?
          </p>
          <p class="warning-text">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeDeleteModal">
            Cancel
          </button>
          <button class="btn-danger" @click="deleteUser">Delete User</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.users-management {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
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

.header-actions {
  display: flex;
  gap: 12px;
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

.btn-create {
  padding: 12px 24px;
  border-radius: 8px;
  background: #0066ff;
  color: white;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  white-space: nowrap;
}

.btn-create:hover {
  background: #0052cc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 102, 255, 0.3);
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
  background: #f0f9ff;
  border: 2px solid #bae6fd;
  border-left: 4px solid #4caf50;
  color: #2e7d32;
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
  margin-bottom: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filters-card h3 {
  font-size: 16px;
  font-weight: 700;
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
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 6px;
}

.filter-group select,
.filter-group input {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;
}

.filter-group select:focus,
.filter-group input:focus {
  outline: none;
  border-color: #0066ff;
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
}

.filter-actions {
  display: flex;
  gap: 8px;
}

.btn-reset {
  padding: 10px 20px;
  border-radius: 6px;
  background: white;
  color: #666;
  border: 2px solid #e0e0e0;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.btn-reset:hover {
  background: #f8f8f8;
  border-color: #999;
}

/* Stats */
.stats-summary {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
}

.stat-item {
  background: white;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-label {
  font-size: 13px;
  color: #666;
  font-weight: 600;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #0066ff;
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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

/* Table */
.table-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
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

.user-name {
  font-weight: 600;
  color: #1a1a1a;
}

.roles-text {
  font-size: 13px;
  color: #666;
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
  font-size: 13px;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-icon {
  background: #f0f0f0;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-view {
  background: #e3f2fd;
}

.btn-view:hover {
  background: #2196f3;
}

.btn-edit {
  background: #fff3e0;
}

.btn-edit:hover {
  background: #ff9800;
}

.btn-password {
  background: #f3e5f5;
}

.btn-password:hover {
  background: #9c27b0;
}

.btn-delete {
  background: #ffebee;
}

.btn-delete:hover {
  background: #f44336;
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
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-small {
  max-width: 500px;
  width: 100%;
}

.modal-medium {
  max-width: 700px;
  width: 100%;
}

.modal-header {
  padding: 24px;
  border-bottom: 2px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
}

.btn-close {
  background: #f0f0f0;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn-close:hover {
  background: #e0e0e0;
  transform: rotate(90deg);
}

.modal-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 2px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Detail Sections */
.detail-section {
  margin-bottom: 24px;
}

.detail-section h3 {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 500;
}

/* Form Groups */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 6px;
}

.form-group label.required::after {
  content: " *";
  color: #ff4444;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #0066ff;
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  cursor: pointer;
}

.info-text {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

.warning-text {
  color: #ff4444;
  font-weight: 600;
  margin-top: 12px;
}

/* Buttons */
.btn-primary {
  padding: 10px 24px;
  border-radius: 6px;
  background: #0066ff;
  color: white;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.btn-primary:hover {
  background: #0052cc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 102, 255, 0.3);
}

.btn-secondary {
  padding: 10px 24px;
  border-radius: 6px;
  background: white;
  color: #666;
  border: 2px solid #e0e0e0;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.btn-secondary:hover {
  background: #f8f8f8;
  border-color: #999;
}

.btn-danger {
  padding: 10px 24px;
  border-radius: 6px;
  background: #ff4444;
  color: white;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.btn-danger:hover {
  background: #cc0000;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 68, 68, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .users-management {
    padding: 20px;
  }

  .management-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .btn-back,
  .btn-create {
    width: 100%;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .stats-summary {
    flex-direction: column;
  }

  .table-wrapper {
    font-size: 13px;
  }

  th,
  td {
    padding: 10px;
  }

  .action-buttons {
    flex-wrap: wrap;
  }
}
</style>
