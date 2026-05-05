<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../../../stores/useAuthStore";
import api from "../../../../api.js";

const router = useRouter();
const authStore = useAuthStore();

// Data
const partners = ref([]);
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

const selectedPartner = ref(null);
const partnerToDelete = ref(null);

// Form data
const partnerForm = ref({
  full_name: "",
  phone_number: "",
  email: "",
  professionel_adress: "",
});

// Form errors
const formErrors = ref({
  phone_number: "",
  email: "",
});

// Validate phone number (Algerian format: 0XXXXXXXXX - 10 digits)
const validatePhoneNumber = () => {
  const phone = partnerForm.value.phone_number;
  const algerianPhoneRegex = /^0[5-7][0-9]{8}$/;

  if (!phone) {
    formErrors.value.phone_number = "";
    return true;
  }

  if (!algerianPhoneRegex.test(phone)) {
    formErrors.value.phone_number =
      "Invalid Algerian phone number format (must be 0XXXXXXXXX)";
    return false;
  }

  formErrors.value.phone_number = "";
  return true;
};

// Validate email
const validateEmail = () => {
  const email = partnerForm.value.email;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    formErrors.value.email = "";
    return true;
  }

  if (!emailRegex.test(email)) {
    formErrors.value.email = "Invalid email format";
    return false;
  }

  formErrors.value.email = "";
  return true;
};

// Validate form
const validateForm = () => {
  const isPhoneValid = validatePhoneNumber();
  const isEmailValid = validateEmail();
  return isPhoneValid && isEmailValid;
};

// Fetch partners
const fetchPartners = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await api.get("/partners");
    partners.value = response.data.data || [];
  } catch (err) {
    console.error("Error fetching partners:", err);
    error.value = "Failed to fetch partners. Please try again.";
  } finally {
    loading.value = false;
  }
};

// Filtered partners
const filteredPartners = computed(() => {
  let result = [...partners.value];

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    result = result.filter(
      (partner) =>
        partner.full_name?.toLowerCase().includes(search) ||
        partner.email?.toLowerCase().includes(search) ||
        partner.phone_number?.includes(search) ||
        partner.professionel_adress?.toLowerCase().includes(search)
    );
  }

  return result;
});

// View partner details
const viewPartner = (partner) => {
  selectedPartner.value = partner;
  showDetailsModal.value = true;
};

// Open create modal
const openCreateModal = () => {
  partnerForm.value = {
    full_name: "",
    phone_number: "",
    email: "",
    professionel_adress: "",
  };
  formErrors.value = {
    phone_number: "",
    email: "",
  };
  showCreateModal.value = true;
};

// Create partner
const createPartner = async () => {
  if (!validateForm()) {
    return;
  }

  loading.value = true;
  error.value = "";
  successMessage.value = "";

  try {
    await api.post("/partners", partnerForm.value);
    successMessage.value = "Partner created successfully!";
    showCreateModal.value = false;
    await fetchPartners();
  } catch (err) {
    console.error("Error creating partner:", err);
    error.value = err.response?.data?.message || "Failed to create partner.";
  } finally {
    loading.value = false;
  }
};

// Open edit modal
const openEditModal = (partner) => {
  selectedPartner.value = partner;
  partnerForm.value = {
    full_name: partner.full_name,
    phone_number: partner.phone_number || "",
    email: partner.email || "",
    professionel_adress: partner.professionel_adress || "",
  };
  formErrors.value = {
    phone_number: "",
    email: "",
  };
  showEditModal.value = true;
};

// Update partner
const updatePartner = async () => {
  if (!validateForm()) {
    return;
  }

  loading.value = true;
  error.value = "";
  successMessage.value = "";

  try {
    await api.put(`/partners/${selectedPartner.value.id}`, partnerForm.value);
    successMessage.value = "Partner updated successfully!";
    showEditModal.value = false;
    await fetchPartners();
  } catch (err) {
    console.error("Error updating partner:", err);
    error.value = err.response?.data?.message || "Failed to update partner.";
  } finally {
    loading.value = false;
  }
};

// Open delete confirmation
const openDeleteModal = (partner) => {
  partnerToDelete.value = partner;
  showDeleteModal.value = true;
};

// Delete partner
const deletePartner = async () => {
  loading.value = true;
  error.value = "";
  successMessage.value = "";

  try {
    await api.delete(`/partners/${partnerToDelete.value.id}`);
    successMessage.value = "Partner deleted successfully!";
    showDeleteModal.value = false;
    await fetchPartners();
  } catch (err) {
    console.error("Error deleting partner:", err);
    error.value = err.response?.data?.message || "Failed to delete partner.";
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
  fetchPartners();
});
</script>

<template>
  <div class="partners-management">
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
            <h1>Socio-Economic Partners Management</h1>
            <p>Manage partnerships and external stakeholders</p>
          </div>
        </div>
        <button @click="openCreateModal" class="btn btn-primary">
          <span class="icon">➕</span>
          Add New Partner
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
            placeholder="Search by name, email, phone, or address..."
            class="form-control"
          />
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading && partners.length === 0" class="loading-state">
        <div class="spinner"></div>
        <p>Loading partners...</p>
      </div>

      <!-- Partners Table -->
      <div v-else class="partners-table-wrapper">
        <div v-if="filteredPartners.length === 0" class="empty-state">
          <div class="empty-icon">🤝</div>
          <p>No partners found</p>
        </div>

        <table v-else class="partners-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="partner in filteredPartners" :key="partner.id">
              <td>
                <div class="partner-name-cell">
                  <div class="partner-avatar">
                    {{ partner.full_name?.charAt(0).toUpperCase() }}
                  </div>
                  <strong>{{ partner.full_name }}</strong>
                </div>
              </td>
              <td>
                <span v-if="partner.email" class="contact-info">
                  <span class="contact-icon">📧</span>
                  {{ partner.email }}
                </span>
                <span v-else class="text-muted">N/A</span>
              </td>
              <td>
                <span v-if="partner.phone_number" class="contact-info">
                  <span class="contact-icon">📱</span>
                  {{ partner.phone_number }}
                </span>
                <span v-else class="text-muted">N/A</span>
              </td>
              <td>
                <span v-if="partner.professionel_adress" class="address-cell">
                  {{ partner.professionel_adress }}
                </span>
                <span v-else class="text-muted">N/A</span>
              </td>
              <td>
                <div class="action-buttons">
                  <button
                    @click="viewPartner(partner)"
                    class="btn btn-sm btn-outline"
                    title="View Details"
                  >
                    👁️
                  </button>
                  <button
                    @click="openEditModal(partner)"
                    class="btn btn-sm btn-outline"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    @click="openDeleteModal(partner)"
                    class="btn btn-sm btn-danger"
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

      <!-- Stats -->
      <div class="stats-footer">
        <p>
          Total Partners: <strong>{{ partners.length }}</strong>
        </p>
      </div>
    </div>

    <!-- Details Modal -->
    <div
      v-if="showDetailsModal"
      class="modal-overlay"
      @click="showDetailsModal = false"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Partner Details</h2>
          <button @click="showDetailsModal = false" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-group">
            <label>Partner ID</label>
            <p>{{ selectedPartner.id }}</p>
          </div>
          <div class="detail-group">
            <label>Full Name</label>
            <p>{{ selectedPartner.full_name }}</p>
          </div>
          <div class="detail-group">
            <label>Email Address</label>
            <p v-if="selectedPartner.email">
              <a :href="`mailto:${selectedPartner.email}`" class="email-link">{{
                selectedPartner.email
              }}</a>
            </p>
            <p v-else class="text-muted">Not provided</p>
          </div>
          <div class="detail-group">
            <label>Phone Number</label>
            <p v-if="selectedPartner.phone_number">
              <a
                :href="`tel:${selectedPartner.phone_number}`"
                class="phone-link"
                >{{ selectedPartner.phone_number }}</a
              >
            </p>
            <p v-else class="text-muted">Not provided</p>
          </div>
          <div class="detail-group">
            <label>Professional Address</label>
            <p v-if="selectedPartner.professionel_adress">
              {{ selectedPartner.professionel_adress }}
            </p>
            <p v-else class="text-muted">Not provided</p>
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
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ showCreateModal ? "Create New Partner" : "Edit Partner" }}</h2>
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
            @submit.prevent="
              showCreateModal ? createPartner() : updatePartner()
            "
          >
            <div class="form-group">
              <label>Full Name <span class="required">*</span></label>
              <input
                v-model="partnerForm.full_name"
                type="text"
                required
                maxlength="100"
                placeholder="Enter partner's full name"
                class="form-control"
              />
              <small class="form-hint">Maximum 100 characters</small>
            </div>

            <div class="form-group">
              <label>Email Address</label>
              <input
                v-model="partnerForm.email"
                @blur="validateEmail"
                type="email"
                maxlength="100"
                placeholder="partner@example.com"
                class="form-control"
                :class="{ 'input-error': formErrors.email }"
              />
              <small v-if="formErrors.email" class="error-hint">{{
                formErrors.email
              }}</small>
              <small v-else class="form-hint"
                >Optional - Must be unique if provided</small
              >
            </div>

            <div class="form-group">
              <label>Phone Number</label>
              <input
                v-model="partnerForm.phone_number"
                @blur="validatePhoneNumber"
                type="tel"
                maxlength="10"
                placeholder="0XXXXXXXXX"
                class="form-control"
                :class="{ 'input-error': formErrors.phone_number }"
              />
              <small v-if="formErrors.phone_number" class="error-hint">{{
                formErrors.phone_number
              }}</small>
              <small v-else class="form-hint"
                >Optional - Algerian format (0XXXXXXXXX) - Must be unique if
                provided</small
              >
            </div>

            <div class="form-group">
              <label>Professional Address</label>
              <textarea
                v-model="partnerForm.professionel_adress"
                maxlength="200"
                rows="3"
                placeholder="Enter professional address"
                class="form-control"
              ></textarea>
              <small class="form-hint">Optional - Maximum 200 characters</small>
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
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="
                  loading || formErrors.email || formErrors.phone_number
                "
              >
                {{
                  loading
                    ? "Saving..."
                    : showCreateModal
                    ? "Create Partner"
                    : "Update Partner"
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
          <p>Are you sure you want to delete this partner?</p>
          <p class="warning-text">
            <strong>Partner:</strong> {{ partnerToDelete?.full_name }}
          </p>
          <p class="text-muted">This action cannot be undone.</p>
        </div>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="btn btn-outline">
            Cancel
          </button>
          <button
            @click="deletePartner"
            class="btn btn-danger"
            :disabled="loading"
          >
            {{ loading ? "Deleting..." : "Delete Partner" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.partners-management {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 24px 0;
}

.container {
  max-width: 1400px;
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
  margin-bottom: 20px;
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
  font-family: inherit;
}

.form-control:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.form-control.input-error {
  border-color: #f56565;
}

.form-control.input-error:focus {
  box-shadow: 0 0 0 3px rgba(245, 101, 101, 0.1);
}

.form-hint {
  color: #718096;
  font-size: 12px;
  margin-top: 4px;
}

.error-hint {
  color: #f56565;
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

.partners-table-wrapper {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow-x: auto;
  margin-bottom: 24px;
  border: 1px solid #f7fafc;
}

.partners-table {
  width: 100%;
  border-collapse: collapse;
}

.partners-table thead {
  background: #f7fafc;
}

.partners-table th {
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #2d3748;
  font-size: 14px;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}

.partners-table tbody tr {
  border-bottom: 1px solid #f7fafc;
  transition: all 0.2s;
}

.partners-table tbody tr:hover {
  background: #f7fafc;
  transform: scale(1.001);
}

.partners-table td {
  padding: 16px;
  font-size: 14px;
  color: #4a5568;
}

.partner-name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.partner-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
}

.contact-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.contact-icon {
  font-size: 14px;
}

.address-cell {
  max-width: 250px;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-buttons {
  display: flex;
  gap: 8px;
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

.btn-primary:hover:not(:disabled) {
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

.btn-danger:hover:not(:disabled) {
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
  text-align: center;
  padding: 60px 20px;
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

.detail-group:last-child {
  margin-bottom: 0;
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

.email-link,
.phone-link {
  color: #4299e1;
  text-decoration: none;
}

.email-link:hover,
.phone-link:hover {
  text-decoration: underline;
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

  .partners-table {
    font-size: 13px;
  }

  .partners-table th,
  .partners-table td {
    padding: 12px 8px;
  }

  .address-cell {
    max-width: 150px;
  }
}
</style>
