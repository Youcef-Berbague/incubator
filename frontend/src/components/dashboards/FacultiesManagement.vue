<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/useAuthStore";
import api from "../../api.js";

const router = useRouter();
const authStore = useAuthStore();

// Data
const faculties = ref([]);
const departments = ref([]);
const loading = ref(false);
const error = ref("");
const successMessage = ref("");

// Active tab
const activeTab = ref("faculties"); // 'faculties' or 'departments'

// Filters
const filters = ref({
  facultySearch: "",
  departmentSearch: "",
  selectedFaculty: "",
});

// Modals
const showFacultyDetailsModal = ref(false);
const showFacultyCreateModal = ref(false);
const showFacultyEditModal = ref(false);
const showFacultyDeleteModal = ref(false);

const showDepartmentDetailsModal = ref(false);
const showDepartmentCreateModal = ref(false);
const showDepartmentEditModal = ref(false);
const showDepartmentDeleteModal = ref(false);

const selectedFaculty = ref(null);
const selectedDepartment = ref(null);
const facultyToDelete = ref(null);
const departmentToDelete = ref(null);

// Form data
const facultyForm = ref({
  faculty_name: "",
  faculty_name_en: "",
});

const departmentForm = ref({
  departement_name: "",
  departement_name_en: "",
  faculty_id: null,
});

// Fetch faculties
const fetchFaculties = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await api.get("/faculties");
    faculties.value = response.data || [];
  } catch (err) {
    console.error("Error fetching faculties:", err);
    error.value = "Failed to fetch faculties. Please try again.";
  } finally {
    loading.value = false;
  }
};

// Fetch departments
const fetchDepartments = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await api.get("/departments");
    departments.value = response.data || [];
  } catch (err) {
    console.error("Error fetching departments:", err);
    error.value = "Failed to fetch departments. Please try again.";
  } finally {
    loading.value = false;
  }
};

// Filtered faculties
const filteredFaculties = computed(() => {
  let result = [...faculties.value];

  if (filters.value.facultySearch) {
    const search = filters.value.facultySearch.toLowerCase();
    result = result.filter((faculty) => {
      const name = faculty.faculty_name?.toLowerCase() || "";
      const nameEn = faculty.faculty_name_en?.toLowerCase() || "";
      return name.includes(search) || nameEn.includes(search);
    });
  }

  return result;
});

// Filtered departments
const filteredDepartments = computed(() => {
  let result = [...departments.value];

  if (filters.value.selectedFaculty) {
    result = result.filter(
      (dept) => dept.faculties?.id === parseInt(filters.value.selectedFaculty)
    );
  }

  if (filters.value.departmentSearch) {
    const search = filters.value.departmentSearch.toLowerCase();
    result = result.filter((dept) => {
      const name = dept.departement_name?.toLowerCase() || "";
      const nameEn = dept.departement_name_en?.toLowerCase() || "";
      return name.includes(search) || nameEn.includes(search);
    });
  }

  return result;
});

// Faculty CRUD Operations

// View faculty details
const viewFacultyDetails = (faculty) => {
  selectedFaculty.value = { ...faculty };
  showFacultyDetailsModal.value = true;
};

// Open create faculty modal
const openFacultyCreateModal = () => {
  facultyForm.value = {
    faculty_name: "",
    faculty_name_en: "",
  };
  showFacultyCreateModal.value = true;
};

// Create faculty
const createFaculty = async () => {
  error.value = "";
  successMessage.value = "";

  try {
    if (!facultyForm.value.faculty_name) {
      error.value = "Faculty name is required.";
      return;
    }

    const response = await api.post("/faculties", {
      faculty_name: facultyForm.value.faculty_name,
      faculty_name_en: facultyForm.value.faculty_name_en || null,
    });

    successMessage.value = "Faculty created successfully!";
    showFacultyCreateModal.value = false;
    await fetchFaculties();

    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (err) {
    console.error("Error creating faculty:", err);
    error.value = err.response?.data?.message || "Failed to create faculty.";
  }
};

// Open edit faculty modal
const openFacultyEditModal = (faculty) => {
  selectedFaculty.value = { ...faculty };
  facultyForm.value = {
    faculty_name: faculty.faculty_name,
    faculty_name_en: faculty.faculty_name_en || "",
  };
  showFacultyEditModal.value = true;
};

// Update faculty
const updateFaculty = async () => {
  error.value = "";
  successMessage.value = "";

  try {
    if (!facultyForm.value.faculty_name) {
      error.value = "Faculty name is required.";
      return;
    }

    const response = await api.put(`/faculties/${selectedFaculty.value.id}`, {
      faculty_name: facultyForm.value.faculty_name,
      faculty_name_en: facultyForm.value.faculty_name_en || null,
    });

    successMessage.value = "Faculty updated successfully!";
    showFacultyEditModal.value = false;
    await fetchFaculties();

    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (err) {
    console.error("Error updating faculty:", err);
    error.value = err.response?.data?.message || "Failed to update faculty.";
  }
};

// Open delete faculty modal
const confirmDeleteFaculty = (faculty) => {
  facultyToDelete.value = faculty;
  showFacultyDeleteModal.value = true;
};

// Delete faculty
const deleteFaculty = async () => {
  error.value = "";
  successMessage.value = "";

  try {
    await api.delete(`/faculties/${facultyToDelete.value.id}`);

    successMessage.value = "Faculty deleted successfully!";
    showFacultyDeleteModal.value = false;
    await fetchFaculties();
    await fetchDepartments(); // Refresh departments too

    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (err) {
    console.error("Error deleting faculty:", err);
    error.value = err.response?.data?.message || "Failed to delete faculty.";
  }
};

// Department CRUD Operations

// View department details
const viewDepartmentDetails = (department) => {
  selectedDepartment.value = { ...department };
  showDepartmentDetailsModal.value = true;
};

// Open create department modal
const openDepartmentCreateModal = () => {
  departmentForm.value = {
    departement_name: "",
    departement_name_en: "",
    faculty_id: null,
  };
  showDepartmentCreateModal.value = true;
};

// Create department
const createDepartment = async () => {
  error.value = "";
  successMessage.value = "";

  try {
    if (
      !departmentForm.value.departement_name ||
      !departmentForm.value.faculty_id
    ) {
      error.value = "Department name and faculty are required.";
      return;
    }

    const response = await api.post("/departments", {
      departement_name: departmentForm.value.departement_name,
      departement_name_en: departmentForm.value.departement_name_en || null,
      faculty_id: parseInt(departmentForm.value.faculty_id),
    });

    successMessage.value = "Department created successfully!";
    showDepartmentCreateModal.value = false;
    await fetchDepartments();

    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (err) {
    console.error("Error creating department:", err);
    error.value = err.response?.data?.message || "Failed to create department.";
  }
};

// Open edit department modal
const openDepartmentEditModal = (department) => {
  selectedDepartment.value = { ...department };
  departmentForm.value = {
    departement_name: department.departement_name,
    departement_name_en: department.departement_name_en || "",
    faculty_id: department.faculties?.id || null,
  };
  showDepartmentEditModal.value = true;
};

// Update department
const updateDepartment = async () => {
  error.value = "";
  successMessage.value = "";

  try {
    if (
      !departmentForm.value.departement_name ||
      !departmentForm.value.faculty_id
    ) {
      error.value = "Department name and faculty are required.";
      return;
    }

    const response = await api.put(
      `/departments/${selectedDepartment.value.id}`,
      {
        departement_name: departmentForm.value.departement_name,
        departement_name_en: departmentForm.value.departement_name_en || null,
        faculty_id: parseInt(departmentForm.value.faculty_id),
      }
    );

    successMessage.value = "Department updated successfully!";
    showDepartmentEditModal.value = false;
    await fetchDepartments();

    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (err) {
    console.error("Error updating department:", err);
    error.value = err.response?.data?.message || "Failed to update department.";
  }
};

// Open delete department modal
const confirmDeleteDepartment = (department) => {
  departmentToDelete.value = department;
  showDepartmentDeleteModal.value = true;
};

// Delete department
const deleteDepartment = async () => {
  error.value = "";
  successMessage.value = "";

  try {
    await api.delete(`/departments/${departmentToDelete.value.id}`);

    successMessage.value = "Department deleted successfully!";
    showDepartmentDeleteModal.value = false;
    await fetchDepartments();

    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (err) {
    console.error("Error deleting department:", err);
    error.value = err.response?.data?.message || "Failed to delete department.";
  }
};

// Reset filters
const resetFilters = () => {
  filters.value = {
    facultySearch: "",
    departmentSearch: "",
    selectedFaculty: "",
  };
};

// Close modals
const closeFacultyDetailsModal = () => {
  showFacultyDetailsModal.value = false;
  selectedFaculty.value = null;
};

const closeFacultyCreateModal = () => {
  showFacultyCreateModal.value = false;
  error.value = "";
};

const closeFacultyEditModal = () => {
  showFacultyEditModal.value = false;
  selectedFaculty.value = null;
  error.value = "";
};

const closeFacultyDeleteModal = () => {
  showFacultyDeleteModal.value = false;
  facultyToDelete.value = null;
  error.value = "";
};

const closeDepartmentDetailsModal = () => {
  showDepartmentDetailsModal.value = false;
  selectedDepartment.value = null;
};

const closeDepartmentCreateModal = () => {
  showDepartmentCreateModal.value = false;
  error.value = "";
};

const closeDepartmentEditModal = () => {
  showDepartmentEditModal.value = false;
  selectedDepartment.value = null;
  error.value = "";
};

const closeDepartmentDeleteModal = () => {
  showDepartmentDeleteModal.value = false;
  departmentToDelete.value = null;
  error.value = "";
};

// Get department count for faculty
const getDepartmentCount = (facultyId) => {
  return departments.value.filter((dept) => dept.faculties?.id === facultyId)
    .length;
};

// Initialize
onMounted(() => {
  fetchFaculties();
  fetchDepartments();
});
</script>

<template>
  <div class="faculties-management">
    <!-- Header -->
    <div class="management-header">
      <div>
        <h1>Faculties & Departments Management</h1>
        <p>Manage university faculties and their departments</p>
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

    <!-- Tabs -->
    <div class="tabs">
      <button
        class="tab-button"
        :class="{ active: activeTab === 'faculties' }"
        @click="activeTab = 'faculties'"
      >
        🏢 Faculties ({{ faculties.length }})
      </button>
      <button
        class="tab-button"
        :class="{ active: activeTab === 'departments' }"
        @click="activeTab = 'departments'"
      >
        📚 Departments ({{ departments.length }})
      </button>
    </div>

    <!-- Faculties Tab -->
    <div v-if="activeTab === 'faculties'" class="tab-content">
      <!-- Filters -->
      <div class="filters-card">
        <h3>Filter Faculties</h3>
        <div class="filters-grid">
          <div class="filter-group">
            <label>Search</label>
            <input
              v-model="filters.facultySearch"
              type="text"
              placeholder="Search by name..."
            />
          </div>
          <div class="filter-actions">
            <button class="btn-reset" @click="resetFilters">Reset</button>
            <button class="btn-create" @click="openFacultyCreateModal">
              + Add Faculty
            </button>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-summary">
        <div class="stat-item">
          <span class="stat-label">Total Faculties</span>
          <span class="stat-value">{{ filteredFaculties.length }}</span>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading faculties...</p>
      </div>

      <!-- Faculties Table -->
      <div v-else class="table-card">
        <div v-if="filteredFaculties.length === 0" class="empty-state">
          <span class="empty-icon">🏢</span>
          <p>No faculties found</p>
        </div>

        <div v-else class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Faculty Name (Arabic)</th>
                <th>Faculty Name (English)</th>
                <th>Departments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="faculty in filteredFaculties" :key="faculty.id">
                <td>{{ faculty.id }}</td>
                <td class="faculty-name">{{ faculty.faculty_name }}</td>
                <td>{{ faculty.faculty_name_en || "N/A" }}</td>
                <td class="centered">
                  <span class="badge badge-info">
                    {{ getDepartmentCount(faculty.id) }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button
                      class="btn-icon btn-view"
                      @click="viewFacultyDetails(faculty)"
                      title="View Details"
                    >
                      👁️
                    </button>
                    <button
                      class="btn-icon btn-edit"
                      @click="openFacultyEditModal(faculty)"
                      title="Edit Faculty"
                    >
                      ✏️
                    </button>
                    <button
                      class="btn-icon btn-delete"
                      @click="confirmDeleteFaculty(faculty)"
                      title="Delete Faculty"
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
    </div>

    <!-- Departments Tab -->
    <div v-if="activeTab === 'departments'" class="tab-content">
      <!-- Filters -->
      <div class="filters-card">
        <h3>Filter Departments</h3>
        <div class="filters-grid">
          <div class="filter-group">
            <label>Faculty</label>
            <select v-model="filters.selectedFaculty">
              <option value="">All Faculties</option>
              <option
                v-for="faculty in faculties"
                :key="faculty.id"
                :value="faculty.id"
              >
                {{ faculty.faculty_name }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label>Search</label>
            <input
              v-model="filters.departmentSearch"
              type="text"
              placeholder="Search by name..."
            />
          </div>
          <div class="filter-actions">
            <button class="btn-reset" @click="resetFilters">Reset</button>
            <button class="btn-create" @click="openDepartmentCreateModal">
              + Add Department
            </button>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-summary">
        <div class="stat-item">
          <span class="stat-label">Total Departments</span>
          <span class="stat-value">{{ filteredDepartments.length }}</span>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading departments...</p>
      </div>

      <!-- Departments Table -->
      <div v-else class="table-card">
        <div v-if="filteredDepartments.length === 0" class="empty-state">
          <span class="empty-icon">📚</span>
          <p>No departments found</p>
        </div>

        <div v-else class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Department Name (Arabic)</th>
                <th>Department Name (English)</th>
                <th>Faculty</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="department in filteredDepartments"
                :key="department.id"
              >
                <td>{{ department.id }}</td>
                <td class="department-name">
                  {{ department.departement_name }}
                </td>
                <td>{{ department.departement_name_en || "N/A" }}</td>
                <td>{{ department.faculties?.faculty_name || "N/A" }}</td>
                <td>
                  <div class="action-buttons">
                    <button
                      class="btn-icon btn-view"
                      @click="viewDepartmentDetails(department)"
                      title="View Details"
                    >
                      👁️
                    </button>
                    <button
                      class="btn-icon btn-edit"
                      @click="openDepartmentEditModal(department)"
                      title="Edit Department"
                    >
                      ✏️
                    </button>
                    <button
                      class="btn-icon btn-delete"
                      @click="confirmDeleteDepartment(department)"
                      title="Delete Department"
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
    </div>

    <!-- Faculty Details Modal -->
    <div
      v-if="showFacultyDetailsModal"
      class="modal-overlay"
      @click="closeFacultyDetailsModal"
    >
      <div class="modal-content modal-medium" @click.stop>
        <div class="modal-header">
          <h2>Faculty Details</h2>
          <button class="btn-close" @click="closeFacultyDetailsModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="detail-section">
            <h3>Faculty Information</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">ID:</span>
                <span class="detail-value">{{ selectedFaculty.id }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Faculty Name (Arabic):</span>
                <span class="detail-value">{{
                  selectedFaculty.faculty_name
                }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Faculty Name (English):</span>
                <span class="detail-value">{{
                  selectedFaculty.faculty_name_en || "N/A"
                }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Departments:</span>
                <span class="detail-value">{{
                  getDepartmentCount(selectedFaculty.id)
                }}</span>
              </div>
            </div>
          </div>

          <div
            v-if="
              selectedFaculty.departements &&
              selectedFaculty.departements.length > 0
            "
            class="detail-section"
          >
            <h3>Departments</h3>
            <ul class="department-list">
              <li v-for="dept in selectedFaculty.departements" :key="dept.id">
                {{ dept.departement_name }}
              </li>
            </ul>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeFacultyDetailsModal">
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Faculty Create Modal -->
    <div
      v-if="showFacultyCreateModal"
      class="modal-overlay"
      @click="closeFacultyCreateModal"
    >
      <div class="modal-content modal-small" @click.stop>
        <div class="modal-header">
          <h2>Create New Faculty</h2>
          <button class="btn-close" @click="closeFacultyCreateModal">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="error" class="error-message">{{ error }}</div>

          <div class="form-group">
            <label class="required">Faculty Name (Arabic)</label>
            <input v-model="facultyForm.faculty_name" type="text" required />
          </div>

          <div class="form-group">
            <label>Faculty Name (English)</label>
            <input v-model="facultyForm.faculty_name_en" type="text" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeFacultyCreateModal">
            Cancel
          </button>
          <button class="btn-primary" @click="createFaculty">
            Create Faculty
          </button>
        </div>
      </div>
    </div>

    <!-- Faculty Edit Modal -->
    <div
      v-if="showFacultyEditModal"
      class="modal-overlay"
      @click="closeFacultyEditModal"
    >
      <div class="modal-content modal-small" @click.stop>
        <div class="modal-header">
          <h2>Edit Faculty</h2>
          <button class="btn-close" @click="closeFacultyEditModal">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="error" class="error-message">{{ error }}</div>

          <div class="form-group">
            <label class="required">Faculty Name (Arabic)</label>
            <input v-model="facultyForm.faculty_name" type="text" required />
          </div>

          <div class="form-group">
            <label>Faculty Name (English)</label>
            <input v-model="facultyForm.faculty_name_en" type="text" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeFacultyEditModal">
            Cancel
          </button>
          <button class="btn-primary" @click="updateFaculty">
            Update Faculty
          </button>
        </div>
      </div>
    </div>

    <!-- Faculty Delete Modal -->
    <div
      v-if="showFacultyDeleteModal"
      class="modal-overlay"
      @click="closeFacultyDeleteModal"
    >
      <div class="modal-content modal-small" @click.stop>
        <div class="modal-header">
          <h2>Confirm Delete</h2>
          <button class="btn-close" @click="closeFacultyDeleteModal">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="error" class="error-message">{{ error }}</div>
          <p>
            Are you sure you want to delete faculty
            <strong>{{ facultyToDelete?.faculty_name }}</strong
            >?
          </p>
          <p class="warning-text">
            This action cannot be undone. All associated departments must be
            deleted first.
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeFacultyDeleteModal">
            Cancel
          </button>
          <button class="btn-danger" @click="deleteFaculty">
            Delete Faculty
          </button>
        </div>
      </div>
    </div>

    <!-- Department Details Modal -->
    <div
      v-if="showDepartmentDetailsModal"
      class="modal-overlay"
      @click="closeDepartmentDetailsModal"
    >
      <div class="modal-content modal-medium" @click.stop>
        <div class="modal-header">
          <h2>Department Details</h2>
          <button class="btn-close" @click="closeDepartmentDetailsModal">
            ✕
          </button>
        </div>
        <div class="modal-body">
          <div class="detail-section">
            <h3>Department Information</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">ID:</span>
                <span class="detail-value">{{ selectedDepartment.id }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Department Name (Arabic):</span>
                <span class="detail-value">{{
                  selectedDepartment.departement_name
                }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Department Name (English):</span>
                <span class="detail-value">{{
                  selectedDepartment.departement_name_en || "N/A"
                }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Faculty:</span>
                <span class="detail-value">{{
                  selectedDepartment.faculties?.faculty_name || "N/A"
                }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeDepartmentDetailsModal">
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Department Create Modal -->
    <div
      v-if="showDepartmentCreateModal"
      class="modal-overlay"
      @click="closeDepartmentCreateModal"
    >
      <div class="modal-content modal-small" @click.stop>
        <div class="modal-header">
          <h2>Create New Department</h2>
          <button class="btn-close" @click="closeDepartmentCreateModal">
            ✕
          </button>
        </div>
        <div class="modal-body">
          <div v-if="error" class="error-message">{{ error }}</div>

          <div class="form-group">
            <label class="required">Department Name (Arabic)</label>
            <input
              v-model="departmentForm.departement_name"
              type="text"
              required
            />
          </div>

          <div class="form-group">
            <label>Department Name (English)</label>
            <input v-model="departmentForm.departement_name_en" type="text" />
          </div>

          <div class="form-group">
            <label class="required">Faculty</label>
            <select v-model="departmentForm.faculty_id" required>
              <option value="">Select Faculty</option>
              <option
                v-for="faculty in faculties"
                :key="faculty.id"
                :value="faculty.id"
              >
                {{ faculty.faculty_name }}
              </option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeDepartmentCreateModal">
            Cancel
          </button>
          <button class="btn-primary" @click="createDepartment">
            Create Department
          </button>
        </div>
      </div>
    </div>

    <!-- Department Edit Modal -->
    <div
      v-if="showDepartmentEditModal"
      class="modal-overlay"
      @click="closeDepartmentEditModal"
    >
      <div class="modal-content modal-small" @click.stop>
        <div class="modal-header">
          <h2>Edit Department</h2>
          <button class="btn-close" @click="closeDepartmentEditModal">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="error" class="error-message">{{ error }}</div>

          <div class="form-group">
            <label class="required">Department Name (Arabic)</label>
            <input
              v-model="departmentForm.departement_name"
              type="text"
              required
            />
          </div>

          <div class="form-group">
            <label>Department Name (English)</label>
            <input v-model="departmentForm.departement_name_en" type="text" />
          </div>

          <div class="form-group">
            <label class="required">Faculty</label>
            <select v-model="departmentForm.faculty_id" required>
              <option value="">Select Faculty</option>
              <option
                v-for="faculty in faculties"
                :key="faculty.id"
                :value="faculty.id"
              >
                {{ faculty.faculty_name }}
              </option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeDepartmentEditModal">
            Cancel
          </button>
          <button class="btn-primary" @click="updateDepartment">
            Update Department
          </button>
        </div>
      </div>
    </div>

    <!-- Department Delete Modal -->
    <div
      v-if="showDepartmentDeleteModal"
      class="modal-overlay"
      @click="closeDepartmentDeleteModal"
    >
      <div class="modal-content modal-small" @click.stop>
        <div class="modal-header">
          <h2>Confirm Delete</h2>
          <button class="btn-close" @click="closeDepartmentDeleteModal">
            ✕
          </button>
        </div>
        <div class="modal-body">
          <div v-if="error" class="error-message">{{ error }}</div>
          <p>
            Are you sure you want to delete department
            <strong>{{ departmentToDelete?.departement_name }}</strong
            >?
          </p>
          <p class="warning-text">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeDepartmentDeleteModal">
            Cancel
          </button>
          <button class="btn-danger" @click="deleteDepartment">
            Delete Department
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.faculties-management {
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

/* Tabs */
.tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 25px;
  border-bottom: 2px solid #f0f0f0;
}

.tab-button {
  padding: 12px 24px;
  background: white;
  border: none;
  border-bottom: 3px solid transparent;
  font-weight: 600;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.tab-button:hover {
  color: #0066ff;
  background: #f8f9ff;
}

.tab-button.active {
  color: #0066ff;
  border-bottom-color: #0066ff;
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

.btn-create {
  padding: 10px 20px;
  border-radius: 6px;
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

.faculty-name,
.department-name {
  font-weight: 600;
  color: #1a1a1a;
}

.centered {
  text-align: center;
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge-info {
  background: #e3f2fd;
  color: #1976d2;
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

.department-list {
  list-style: none;
  padding: 0;
}

.department-list li {
  padding: 10px;
  background: #f8f9ff;
  border-radius: 6px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #1a1a1a;
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
  .faculties-management {
    padding: 20px;
  }

  .management-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .btn-back {
    width: 100%;
  }

  .tabs {
    flex-direction: column;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    flex-direction: column;
  }

  .btn-reset,
  .btn-create {
    width: 100%;
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
