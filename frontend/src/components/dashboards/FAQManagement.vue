<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/useAuthStore";
import api from "../../api.js";

const router = useRouter();
const authStore = useAuthStore();

// Data
const faqs = ref([]);
const categories = ref([]);
const loading = ref(false);
const error = ref("");
const successMessage = ref("");

// Filters
const filters = ref({
  search: "",
  category: "",
  isactive: "all", // 'all', 'true', 'false'
});

// Modals
const showDetailsModal = ref(false);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);

const selectedFAQ = ref(null);
const faqToDelete = ref(null);

// Form data
const faqForm = ref({
  question: "",
  answer: "",
  category: "",
  keywords: "",
  priority: 0,
  isactive: true,
});

// Fetch FAQs
const fetchFAQs = async () => {
  loading.value = true;
  error.value = "";

  try {
    const params = {};
    if (filters.value.search) params.search = filters.value.search;
    if (filters.value.category) params.category = filters.value.category;
    if (filters.value.isactive !== "all")
      params.isactive = filters.value.isactive;

    const response = await api.get("/faqs", { params });
    faqs.value = response.data.data || [];
  } catch (err) {
    console.error("Error fetching FAQs:", err);
    error.value = "Failed to fetch FAQs. Please try again.";
  } finally {
    loading.value = false;
  }
};

// Fetch categories
const fetchCategories = async () => {
  try {
    const response = await api.get("/faqs/categories");
    categories.value = response.data.data || [];
  } catch (err) {
    console.error("Error fetching categories:", err);
  }
};

// View FAQ details
const viewFAQ = (faq) => {
  selectedFAQ.value = faq;
  showDetailsModal.value = true;
};

// Open create modal
const openCreateModal = () => {
  faqForm.value = {
    question: "",
    answer: "",
    category: "",
    keywords: "",
    priority: 0,
    isactive: true,
  };
  showCreateModal.value = true;
};

// Create FAQ
const createFAQ = async () => {
  loading.value = true;
  error.value = "";
  successMessage.value = "";

  try {
    await api.post("/faqs", faqForm.value);
    successMessage.value = "FAQ created successfully!";
    showCreateModal.value = false;
    await fetchFAQs();
    await fetchCategories();
  } catch (err) {
    console.error("Error creating FAQ:", err);
    error.value = err.response?.data?.message || "Failed to create FAQ.";
  } finally {
    loading.value = false;
  }
};

// Open edit modal
const openEditModal = (faq) => {
  selectedFAQ.value = faq;
  faqForm.value = {
    question: faq.question,
    answer: faq.answer,
    category: faq.category || "",
    keywords: faq.keywords || "",
    priority: faq.priority || 0,
    isactive: faq.isactive,
  };
  showEditModal.value = true;
};

// Update FAQ
const updateFAQ = async () => {
  loading.value = true;
  error.value = "";
  successMessage.value = "";

  try {
    await api.put(`/faqs/${selectedFAQ.value.id}`, faqForm.value);
    successMessage.value = "FAQ updated successfully!";
    showEditModal.value = false;
    await fetchFAQs();
    await fetchCategories();
  } catch (err) {
    console.error("Error updating FAQ:", err);
    error.value = err.response?.data?.message || "Failed to update FAQ.";
  } finally {
    loading.value = false;
  }
};

// Open delete confirmation
const openDeleteModal = (faq) => {
  faqToDelete.value = faq;
  showDeleteModal.value = true;
};

// Delete FAQ
const deleteFAQ = async () => {
  loading.value = true;
  error.value = "";
  successMessage.value = "";

  try {
    await api.delete(`/faqs/${faqToDelete.value.id}`);
    successMessage.value = "FAQ deleted successfully!";
    showDeleteModal.value = false;
    await fetchFAQs();
    await fetchCategories();
  } catch (err) {
    console.error("Error deleting FAQ:", err);
    error.value = err.response?.data?.message || "Failed to delete FAQ.";
  } finally {
    loading.value = false;
  }
};

// Clear messages
const clearMessages = () => {
  error.value = "";
  successMessage.value = "";
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

onMounted(() => {
  fetchFAQs();
  fetchCategories();
});
</script>

<template>
  <div class="faq-management">
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
            <h1>FAQ Management</h1>
            <p>Manage frequently asked questions</p>
          </div>
        </div>
        <button @click="openCreateModal" class="btn btn-primary">
          <span class="icon">➕</span>
          Add New FAQ
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

      <!-- Filters -->
      <div class="filters-card">
        <div class="filters-grid">
          <div class="form-group">
            <label>Search</label>
            <input
              v-model="filters.search"
              @input="fetchFAQs"
              type="text"
              placeholder="Search questions, answers, keywords..."
              class="form-control"
            />
          </div>
          <div class="form-group">
            <label>Category</label>
            <select
              v-model="filters.category"
              @change="fetchFAQs"
              class="form-control"
            >
              <option value="">All Categories</option>
              <option v-for="cat in categories" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select
              v-model="filters.isactive"
              @change="fetchFAQs"
              class="form-control"
            >
              <option value="all">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading FAQs...</p>
      </div>

      <!-- FAQs List -->
      <div v-else class="faqs-grid">
        <div v-if="faqs.length === 0" class="empty-state">
          <div class="empty-icon">❓</div>
          <p>No FAQs found</p>
        </div>

        <div v-for="faq in faqs" :key="faq.id" class="faq-card">
          <div class="faq-header">
            <div class="faq-meta">
              <span v-if="faq.category" class="category-badge">{{
                faq.category
              }}</span>
              <span class="priority-badge" :class="'priority-' + faq.priority">
                Priority: {{ faq.priority }}
              </span>
              <span
                class="status-badge"
                :class="faq.isactive ? 'active' : 'inactive'"
              >
                {{ faq.isactive ? "Active" : "Inactive" }}
              </span>
            </div>
          </div>
          <div class="faq-content">
            <h3 class="question">{{ faq.question }}</h3>
            <p class="answer">
              {{ faq.answer.substring(0, 150)
              }}{{ faq.answer.length > 150 ? "..." : "" }}
            </p>
            <div v-if="faq.keywords" class="keywords">
              <strong>Keywords:</strong> {{ faq.keywords }}
            </div>
            <div class="faq-dates">
              <small>Created: {{ formatDate(faq.createdat) }}</small>
              <small v-if="faq.updatedat"
                >Updated: {{ formatDate(faq.updatedat) }}</small
              >
            </div>
          </div>
          <div class="faq-actions">
            <button @click="viewFAQ(faq)" class="btn btn-sm btn-outline">
              View
            </button>
            <button @click="openEditModal(faq)" class="btn btn-sm btn-outline">
              Edit
            </button>
            <button @click="openDeleteModal(faq)" class="btn btn-sm btn-danger">
              Delete
            </button>
          </div>
        </div>
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
          <h2>FAQ Details</h2>
          <button @click="showDetailsModal = false" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-group">
            <label>Question</label>
            <p>{{ selectedFAQ.question }}</p>
          </div>
          <div class="detail-group">
            <label>Answer</label>
            <p>{{ selectedFAQ.answer }}</p>
          </div>
          <div class="detail-group">
            <label>Category</label>
            <p>{{ selectedFAQ.category || "N/A" }}</p>
          </div>
          <div class="detail-group">
            <label>Keywords</label>
            <p>{{ selectedFAQ.keywords || "N/A" }}</p>
          </div>
          <div class="detail-group">
            <label>Priority</label>
            <p>{{ selectedFAQ.priority }}</p>
          </div>
          <div class="detail-group">
            <label>Status</label>
            <p>{{ selectedFAQ.isactive ? "Active" : "Inactive" }}</p>
          </div>
          <div class="detail-group">
            <label>Created</label>
            <p>{{ formatDate(selectedFAQ.createdat) }}</p>
          </div>
          <div class="detail-group" v-if="selectedFAQ.updatedat">
            <label>Updated</label>
            <p>{{ formatDate(selectedFAQ.updatedat) }}</p>
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
          <h2>{{ showCreateModal ? "Create New FAQ" : "Edit FAQ" }}</h2>
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
          <form @submit.prevent="showCreateModal ? createFAQ() : updateFAQ()">
            <div class="form-group">
              <label>Question <span class="required">*</span></label>
              <input
                v-model="faqForm.question"
                type="text"
                required
                maxlength="500"
                placeholder="Enter the question"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Answer <span class="required">*</span></label>
              <textarea
                v-model="faqForm.answer"
                required
                rows="5"
                placeholder="Enter the answer"
                class="form-control"
              ></textarea>
            </div>
            <div class="form-group">
              <label>Category</label>
              <input
                v-model="faqForm.category"
                type="text"
                maxlength="50"
                placeholder="e.g., General, Technical, Application"
                class="form-control"
                list="category-suggestions"
              />
              <datalist id="category-suggestions">
                <option
                  v-for="cat in categories"
                  :key="cat"
                  :value="cat"
                ></option>
              </datalist>
            </div>
            <div class="form-group">
              <label>Keywords</label>
              <input
                v-model="faqForm.keywords"
                type="text"
                placeholder="e.g., incubator, startup, application"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Priority</label>
              <input
                v-model.number="faqForm.priority"
                type="number"
                min="0"
                max="100"
                placeholder="0-100 (higher = more important)"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label class="checkbox-label">
                <input
                  v-model="faqForm.isactive"
                  type="checkbox"
                  class="checkbox-input"
                />
                <span>Active (visible to public)</span>
              </label>
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
                    ? "Create FAQ"
                    : "Update FAQ"
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
          <p>Are you sure you want to delete this FAQ?</p>
          <p class="warning-text">
            <strong>Question:</strong> {{ faqToDelete?.question }}
          </p>
          <p class="text-muted">This action cannot be undone.</p>
        </div>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="btn btn-outline">
            Cancel
          </button>
          <button @click="deleteFAQ" class="btn btn-danger" :disabled="loading">
            {{ loading ? "Deleting..." : "Delete FAQ" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.faq-management {
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

/* Alerts */
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

/* Filters */
.filters-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
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

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

/* Loading */
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

/* FAQs Grid */
.faqs-grid {
  display: grid;
  gap: 20px;
}

.faq-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #f7fafc;
}

.faq-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  border-color: #e2e8f0;
}

.faq-header {
  margin-bottom: 12px;
}

.faq-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.category-badge,
.priority-badge,
.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.category-badge {
  background: #e6f7ff;
  color: #0066cc;
}

.priority-badge {
  background: #fff7e6;
  color: #d46b08;
}

.priority-badge.priority-10,
.priority-badge.priority-9,
.priority-badge.priority-8 {
  background: #ffe6e6;
  color: #d32f2f;
}

.status-badge {
  background: #f0f0f0;
  color: #666;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background: #f8d7da;
  color: #721c24;
}

.faq-content {
  margin-bottom: 16px;
}

.question {
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 12px 0;
}

.answer {
  color: #4a5568;
  line-height: 1.6;
  margin: 0 0 12px 0;
}

.keywords {
  font-size: 13px;
  color: #718096;
  margin-bottom: 12px;
}

.faq-dates {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #a0aec0;
}

.faq-actions {
  display: flex;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

/* Buttons */
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
}

/* Modal */
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
  line-height: 1.6;
}

.required {
  color: #f56565;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: normal !important;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
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

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .faq-actions {
    flex-wrap: wrap;
  }
}
</style>
