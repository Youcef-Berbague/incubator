<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../../stores/useAuthStore";
import api from "../../../api.js";

const router = useRouter();
const authStore = useAuthStore();

// User data
const userData = ref({
  id: null,
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  academic_level: "",
  status: "",
  role: [],
});

const loading = ref(false);
const error = ref("");
const successMessage = ref("");

// Password change
const showPasswordModal = ref(false);
const passwordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});
const passwordError = ref("");

// Fetch user data
const fetchUserData = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await api.get("/users/me");

    if (response.data) {
      userData.value = {
        id: response.data.id,
        first_name: response.data.first_name || "",
        last_name: response.data.last_name || "",
        email: response.data.email || "",
        phone_number: response.data.phone_number || "",
        academic_level: response.data.academic_level || "",
        status: response.data.status || "",
        role: response.data.role || [],
      };
    }
  } catch (err) {
    console.error("Error fetching user data:", err);
    error.value = "Failed to load your account information.";
  } finally {
    loading.value = false;
  }
};

// Update user information
const updateUserInfo = async () => {
  error.value = "";
  successMessage.value = "";

  try {
    // Validate required fields
    if (
      !userData.value.first_name ||
      !userData.value.last_name ||
      !userData.value.email ||
      !userData.value.phone_number
    ) {
      error.value =
        "First name, last name, email, and phone number are required.";
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.value.email)) {
      error.value = "Please enter a valid email address.";
      return;
    }

    // Phone validation (basic)
    if (userData.value.phone_number.length < 10) {
      error.value = "Please enter a valid phone number.";
      return;
    }

    const response = await api.put("/users/update", {
      id: userData.value.id,
      first_name: userData.value.first_name,
      last_name: userData.value.last_name,
      email: userData.value.email,
      phone_number: userData.value.phone_number,
      academic_level: userData.value.academic_level || null,
    });

    if (response.data) {
      successMessage.value =
        "Your account information has been updated successfully!";

      // Update auth store with new user name
      authStore.user = {
        ...authStore.user,
        first_name: userData.value.first_name,
        last_name: userData.value.last_name,
        email: userData.value.email,
      };

      setTimeout(() => {
        successMessage.value = "";
      }, 5000);
    }
  } catch (err) {
    console.error("Error updating user info:", err);
    error.value =
      err.response?.data?.message ||
      "Failed to update your information. Please try again.";
  }
};

// Open password change modal
const openPasswordModal = () => {
  passwordForm.value = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
  passwordError.value = "";
  showPasswordModal.value = true;
};

// Change password
const changePassword = async () => {
  passwordError.value = "";

  try {
    // Validate passwords
    if (
      !passwordForm.value.currentPassword ||
      !passwordForm.value.newPassword ||
      !passwordForm.value.confirmPassword
    ) {
      passwordError.value = "All password fields are required.";
      return;
    }

    if (passwordForm.value.newPassword.length < 8) {
      passwordError.value = "New password must be at least 8 characters long.";
      return;
    }

    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      passwordError.value = "New password and confirmation do not match.";
      return;
    }

    // Note: You'll need to create a separate endpoint for password verification
    // For now, we'll just update the password
    const response = await api.put("/users/update", {
      id: userData.value.id,
      password: passwordForm.value.newPassword,
    });

    if (response.data) {
      successMessage.value = "Password changed successfully!";
      showPasswordModal.value = false;

      setTimeout(() => {
        successMessage.value = "";
      }, 5000);
    }
  } catch (err) {
    console.error("Error changing password:", err);
    passwordError.value =
      err.response?.data?.message ||
      "Failed to change password. Please try again.";
  }
};

// Close password modal
const closePasswordModal = () => {
  showPasswordModal.value = false;
  passwordError.value = "";
};

// Get role display name
const getRoleDisplay = () => {
  const roleNames = {
    100: "Super Admin",
    90: "Admin",
    70: "Coach",
    60: "Supervisor",
    40: "Student",
    10: "Guest",
  };

  if (!userData.value.role || userData.value.role.length === 0) {
    return "No role assigned";
  }

  return userData.value.role
    .map((roleValue) => roleNames[roleValue] || `Role ${roleValue}`)
    .join(", ");
};

// Initialize
onMounted(() => {
  fetchUserData();
});
</script>

<template>
  <div class="account-settings">
    <!-- Header -->
    <div class="settings-header">
      <div>
        <h1>My Account Settings</h1>
        <p>Manage your personal information and account preferences</p>
      </div>
      <button class="btn-back" @click="router.push('/dashboard')">
        ← Back to Dashboard
      </button>
    </div>

    <!-- Messages -->
    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading your account information...</p>
    </div>

    <!-- Account Settings Form -->
    <div v-else class="settings-container">
      <!-- Personal Information Card -->
      <div class="settings-card">
        <div class="card-header">
          <h2>Personal Information</h2>
          <p>Update your personal details</p>
        </div>

        <div class="card-body">
          <div class="form-row">
            <div class="form-group">
              <label class="required">First Name</label>
              <input
                v-model="userData.first_name"
                type="text"
                placeholder="Enter your first name"
                required
              />
            </div>

            <div class="form-group">
              <label class="required">Last Name</label>
              <input
                v-model="userData.last_name"
                type="text"
                placeholder="Enter your last name"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="required">Email Address</label>
              <input
                v-model="userData.email"
                type="email"
                placeholder="your.email@example.com"
                required
              />
              <span class="field-hint"
                >This email is used for login and notifications</span
              >
            </div>

            <div class="form-group">
              <label class="required">Phone Number</label>
              <input
                v-model="userData.phone_number"
                type="tel"
                placeholder="0XXXXXXXXX"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Academic Level</label>
              <select v-model="userData.academic_level">
                <option value="">Select academic level</option>
                <option value="L1">License 1 (L1)</option>
                <option value="L2">License 2 (L2)</option>
                <option value="L3">License 3 (L3)</option>
                <option value="M1">Master 1 (M1)</option>
                <option value="M2">Master 2 (M2)</option>
                <option value="PhD">PhD/Doctorate</option>
              </select>
            </div>

            <div class="form-group">
              <label>Role</label>
              <div class="role-display">
                <span class="role-badge">{{ getRoleDisplay() }}</span>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Account Status</label>
              <input
                :value="userData.status || 'N/A'"
                type="text"
                disabled
                class="disabled-field"
              />
            </div>
          </div>

          <div class="form-actions">
            <button class="btn-primary" @click="updateUserInfo">
              💾 Save Changes
            </button>
          </div>
        </div>
      </div>

      <!-- Account Security Card -->
      <div class="settings-card">
        <div class="card-header">
          <h2>Account Security</h2>
          <p>Manage your password and security settings</p>
        </div>

        <div class="card-body">
          <div class="security-item">
            <div class="security-info">
              <h3>Password</h3>
              <p>Change your password to keep your account secure</p>
            </div>
            <button class="btn-secondary" @click="openPasswordModal">
              🔒 Change Password
            </button>
          </div>

          <div class="security-divider"></div>

          <div class="security-item">
            <div class="security-info">
              <h3>Two-Factor Authentication</h3>
              <p>Add an extra layer of security to your account</p>
            </div>
            <button class="btn-secondary" disabled>Coming Soon</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Password Change Modal -->
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
          <div v-if="passwordError" class="error-message">
            {{ passwordError }}
          </div>

          <div class="form-group">
            <label class="required">Current Password</label>
            <input
              v-model="passwordForm.currentPassword"
              type="password"
              placeholder="Enter your current password"
              required
            />
          </div>

          <div class="form-group">
            <label class="required">New Password</label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="Enter new password (min 8 characters)"
              required
            />
          </div>

          <div class="form-group">
            <label class="required">Confirm New Password</label>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              required
            />
          </div>

          <div class="password-requirements">
            <p><strong>Password Requirements:</strong></p>
            <ul>
              <li>At least 8 characters long</li>
              <li>Mix of uppercase and lowercase letters recommended</li>
              <li>
                Include numbers and special characters for better security
              </li>
            </ul>
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
  </div>
</template>

<style scoped>
.account-settings {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

.settings-header {
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.settings-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.settings-header p {
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

/* Settings Container */
.settings-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  padding: 24px;
  border-bottom: 2px solid #f0f0f0;
}

.card-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 6px;
}

.card-header p {
  font-size: 14px;
  color: #666;
}

.card-body {
  padding: 24px;
}

/* Form Elements */
.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 6px;
}

.form-group label.required::after {
  content: " *";
  color: #ff4444;
}

.form-group input {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;
}

.form-group select {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;
  background: white;
  cursor: pointer;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #0066ff;
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
}

.form-group input.disabled-field {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.field-hint {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.role-display {
  display: flex;
  align-items: center;
}

.role-badge {
  display: inline-block;
  padding: 6px 16px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
}

.form-actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

/* Security Items */
.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.security-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.security-info p {
  font-size: 13px;
  color: #666;
}

.security-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 16px 0;
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

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
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

.btn-secondary:hover:not(:disabled) {
  background: #f8f8f8;
  border-color: #999;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
}

.modal-footer {
  padding: 20px 24px;
  border-top: 2px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.password-requirements {
  background: #f8f9ff;
  border-left: 4px solid #0066ff;
  padding: 12px 16px;
  border-radius: 6px;
  margin-top: 16px;
}

.password-requirements p {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.password-requirements ul {
  margin: 0;
  padding-left: 20px;
}

.password-requirements li {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

/* Responsive */
@media (max-width: 768px) {
  .account-settings {
    padding: 20px;
  }

  .settings-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .btn-back {
    width: 100%;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .security-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .btn-secondary {
    width: 100%;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
