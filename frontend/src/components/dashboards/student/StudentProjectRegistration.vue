<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../../stores/useAuthStore";
import api from "../../../api.js";
import StudentDashboardNav from "./components/StudentDashboardNav.vue";
import StudentDashboardSidebar from "./components/StudentDashboardSidebar.vue";

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const saving = ref(false);
const error = ref("");
const successMessage = ref("");

const projectTitle = ref("");
const numberOfStudents = ref(1);
const numberOfSupervisors = ref(1);
const selectedFaculty = ref("");
const selectedDepartment = ref("");
const pendingDepartmentId = ref(null);

const faculties = ref([]);
const departments = ref([]);

const students = ref([
  { firstName: "", lastName: "", email: "", phone: "", academicLevel: "" },
]);
const supervisors = ref([
  { firstName: "", lastName: "", email: "", phone: "" },
]);

const isEditMode = ref(false);
const registrationStatus = ref(null);

const editableStatuses = ["pending", "in_review", "revision_required"];
const canEdit = computed(
  () =>
    !registrationStatus.value ||
    editableStatuses.includes(registrationStatus.value),
);

const userName = computed(() => authStore.userName || "Student");
const userEmail = computed(() => authStore.userEmail || "N/A");

const registrationStatusLabel = computed(() => {
  if (!registrationStatus.value) return "No registration";
  return registrationStatus.value.replace("_", " ");
});

const loadFaculties = async () => {
  try {
    const response = await api.get("/faculties");
    faculties.value = response.data || [];
  } catch (err) {
    console.error("Error loading faculties:", err);
  }
};

const loadDepartments = async (facultyId) => {
  if (!facultyId) {
    departments.value = [];
    selectedDepartment.value = "";
    return;
  }

  try {
    const response = await api.get(`/faculties/${facultyId}/departments`);
    departments.value = response.data || [];
    if (pendingDepartmentId.value) {
      selectedDepartment.value = String(pendingDepartmentId.value);
      pendingDepartmentId.value = null;
    }
  } catch (err) {
    console.error("Error loading departments:", err);
    departments.value = [];
  }
};

watch(numberOfStudents, (newVal) => {
  const target = Number(newVal || 0);
  const current = students.value.length;
  if (target > current) {
    for (let i = current; i < target; i += 1) {
      students.value.push({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        academicLevel: "",
      });
    }
  } else if (target < current) {
    students.value = students.value.slice(0, target);
  }
});

watch(numberOfSupervisors, (newVal) => {
  const target = Number(newVal || 0);
  const current = supervisors.value.length;
  if (target > current) {
    for (let i = current; i < target; i += 1) {
      supervisors.value.push({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
      });
    }
  } else if (target < current) {
    supervisors.value = supervisors.value.slice(0, target);
  }
});

watch(selectedFaculty, (facultyId) => {
  loadDepartments(facultyId);
});

const hydrateRegistration = (registration) => {
  if (!registration) return;

  isEditMode.value = true;
  registrationStatus.value = registration.status || null;

  projectTitle.value = registration.projectTitle || "";
  selectedFaculty.value = registration.faculty?.id
    ? String(registration.faculty.id)
    : "";
  pendingDepartmentId.value = registration.department?.id || null;

  students.value = Array.isArray(registration.students)
    ? registration.students.map((student) => ({
        firstName: student.firstName || "",
        lastName: student.lastName || "",
        email: student.email || "",
        phone: student.phone || "",
        academicLevel: student.academicLevel || "",
      }))
    : [
        {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          academicLevel: "",
        },
      ];

  supervisors.value = Array.isArray(registration.supervisors)
    ? registration.supervisors.map((supervisor) => ({
        firstName: supervisor.firstName || "",
        lastName: supervisor.lastName || "",
        email: supervisor.email || "",
        phone: supervisor.phone || "",
      }))
    : [{ firstName: "", lastName: "", email: "", phone: "" }];

  numberOfStudents.value = students.value.length || 1;
  numberOfSupervisors.value = supervisors.value.length || 1;
};

const loadExistingRegistration = async () => {
  try {
    const response = await api.get("/projects/register");
    if (response.data?.success && response.data?.data) {
      hydrateRegistration(response.data.data);
    }
  } catch (err) {
    console.error("Error loading existing registration:", err);
  }
};

const validateForm = () => {
  if (!projectTitle.value.trim()) {
    error.value = "Please enter a project title.";
    return false;
  }

  if (projectTitle.value.trim().length < 5) {
    error.value = "Project title must be at least 5 characters long.";
    return false;
  }

  if (!Number(numberOfStudents.value) || Number(numberOfStudents.value) < 1) {
    error.value = "Number of students must be at least 1.";
    return false;
  }

  if (
    !Number(numberOfSupervisors.value) ||
    Number(numberOfSupervisors.value) < 1
  ) {
    error.value = "Number of supervisors must be at least 1.";
    return false;
  }

  if (!selectedFaculty.value || !selectedDepartment.value) {
    error.value = "Please select a faculty and department.";
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  for (let i = 0; i < students.value.length; i += 1) {
    const student = students.value[i];
    if (!student.firstName || !student.lastName || !student.email) {
      error.value = `Please complete all required fields for student ${i + 1}.`;
      return false;
    }
    if (!emailRegex.test(student.email)) {
      error.value = `Invalid email format for student ${i + 1}.`;
      return false;
    }
    if (!student.academicLevel) {
      error.value = `Please provide academic level for student ${i + 1}.`;
      return false;
    }
  }

  for (let i = 0; i < supervisors.value.length; i += 1) {
    const supervisor = supervisors.value[i];
    if (!supervisor.firstName || !supervisor.lastName || !supervisor.email) {
      error.value = `Please complete all required fields for supervisor ${
        i + 1
      }.`;
      return false;
    }
    if (!emailRegex.test(supervisor.email)) {
      error.value = `Invalid email format for supervisor ${i + 1}.`;
      return false;
    }
  }

  return true;
};

const buildPayload = () => ({
  projectTitle: projectTitle.value.trim(),
  numberOfStudents: Number(numberOfStudents.value),
  numberOfSupervisors: Number(numberOfSupervisors.value),
  facultyId: Number(selectedFaculty.value),
  departmentId: Number(selectedDepartment.value),
  students: students.value,
  supervisors: supervisors.value,
});

const handleSubmit = async () => {
  error.value = "";
  successMessage.value = "";

  if (!canEdit.value) {
    error.value = "This registration is locked after approval.";
    return;
  }

  if (!validateForm()) return;

  saving.value = true;
  try {
    const payload = buildPayload();
    if (isEditMode.value) {
      const response = await api.patch("/projects/register", payload);
      successMessage.value =
        response.data?.message || "Registration updated successfully.";
      if (response.data?.data?.status) {
        registrationStatus.value = response.data.data.status;
      }
    } else {
      const response = await api.post("/projects/register", payload);
      successMessage.value =
        response.data?.message || "Registration submitted successfully.";
      isEditMode.value = true;
      registrationStatus.value = response.data?.data?.status || "pending";
      router.push("/registration-success");
    }
  } catch (err) {
    console.error("Registration submission failed:", err);
    const response = err.response?.data;
    if (response?.errors?.length) {
      error.value = `${response.errors[0].field}: ${response.errors[0].message}`;
    } else {
      error.value =
        response?.message ||
        "Failed to submit registration. Please check the form and try again.";
    }
  } finally {
    saving.value = false;
  }
};

const goHome = () => router.push("/");
const goToAccount = () => router.push("/dashboard/account");
const handleLogout = async () => {
  await authStore.logout();
  router.push("/");
};

onMounted(async () => {
  loading.value = true;
  await loadFaculties();
  await loadExistingRegistration();
  if (selectedFaculty.value) {
    await loadDepartments(selectedFaculty.value);
  }
  loading.value = false;
});
</script>

<template>
  <div class="student-dashboard student-registration-page">
    <StudentDashboardNav
      :user-name="userName"
      :user-email="userEmail"
      role-label="Student"
      @home="goHome"
      @account="goToAccount"
      @logout="handleLogout"
    />

    <div class="dashboard-content">
      <StudentDashboardSidebar
        :project-count="0"
        :has-registration="Boolean(registrationStatus)"
        :registration-status-label="registrationStatusLabel"
        @scroll="() => {}"
        @account="goToAccount"
        @home="goHome"
        @refresh="loadExistingRegistration"
      />

      <div class="dashboard-main">
        <div class="container">
          <div class="dashboard-header">
            <div>
              <h1>
                {{ isEditMode ? "Update Registration" : "Register Project" }}
              </h1>
              <p>
                {{
                  isEditMode
                    ? "Update your project details before approval."
                    : "Submit a project registration after logging in."
                }}
              </p>
            </div>
          </div>

          <div v-if="error" class="error-message">{{ error }}</div>
          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>

          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Loading registration form...</p>
          </div>

          <div v-else class="section-card">
            <div class="section-header">
              <div>
                <h2>Project Registration</h2>
                <p>Status: {{ registrationStatusLabel }}</p>
              </div>
              <button
                class="btn-view-all"
                :disabled="saving || !canEdit"
                @click="handleSubmit"
              >
                {{
                  saving ? "Saving..." : isEditMode ? "Save Changes" : "Submit"
                }}
              </button>
            </div>

            <form class="registration-form" @submit.prevent="handleSubmit">
              <div class="form-grid">
                <div class="form-field">
                  <label>Project Title</label>
                  <input
                    v-model="projectTitle"
                    type="text"
                    placeholder="Project title"
                  />
                </div>
                <div class="form-field">
                  <label>Faculty</label>
                  <select v-model="selectedFaculty">
                    <option value="">Select faculty</option>
                    <option
                      v-for="faculty in faculties"
                      :key="faculty.id"
                      :value="String(faculty.id)"
                    >
                      {{ faculty.faculty_name_en || faculty.faculty_name }}
                    </option>
                  </select>
                </div>
                <div class="form-field">
                  <label>Department</label>
                  <select v-model="selectedDepartment">
                    <option value="">Select department</option>
                    <option
                      v-for="department in departments"
                      :key="department.id"
                      :value="String(department.id)"
                    >
                      {{
                        department.departement_name_en ||
                        department.departement_name
                      }}
                    </option>
                  </select>
                </div>
                <div class="form-field">
                  <label>Number of Students</label>
                  <input
                    v-model.number="numberOfStudents"
                    type="number"
                    min="1"
                  />
                </div>
                <div class="form-field">
                  <label>Number of Supervisors</label>
                  <input
                    v-model.number="numberOfSupervisors"
                    type="number"
                    min="1"
                  />
                </div>
              </div>

              <div class="form-section">
                <h3>Students</h3>
                <div
                  v-for="(student, index) in students"
                  :key="`student-${index}`"
                  class="form-row"
                >
                  <input
                    v-model="student.firstName"
                    type="text"
                    placeholder="First name"
                  />
                  <input
                    v-model="student.lastName"
                    type="text"
                    placeholder="Last name"
                  />
                  <input
                    v-model="student.email"
                    type="email"
                    placeholder="Email"
                  />
                  <input
                    v-model="student.phone"
                    type="text"
                    placeholder="Phone"
                  />
                  <input
                    v-model="student.academicLevel"
                    type="text"
                    placeholder="Academic level"
                  />
                </div>
              </div>

              <div class="form-section">
                <h3>Supervisors</h3>
                <div
                  v-for="(supervisor, index) in supervisors"
                  :key="`supervisor-${index}`"
                  class="form-row"
                >
                  <input
                    v-model="supervisor.firstName"
                    type="text"
                    placeholder="First name"
                  />
                  <input
                    v-model="supervisor.lastName"
                    type="text"
                    placeholder="Last name"
                  />
                  <input
                    v-model="supervisor.email"
                    type="email"
                    placeholder="Email"
                  />
                  <input
                    v-model="supervisor.phone"
                    type="text"
                    placeholder="Phone"
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.student-registration-page .success-message {
  background: #f0fdf4;
  border: 2px solid #bbf7d0;
  border-left: 4px solid #22c55e;
  color: #15803d;
  padding: 14px 18px;
  border-radius: 8px;
  margin-bottom: 25px;
  font-size: 14px;
  font-weight: 600;
}

.registration-form {
  display: grid;
  gap: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  font-size: 12px;
  font-weight: 700;
  color: #1a1a1a;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.form-field input,
.form-field select,
.form-row input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  font-size: 14px;
  font-family: inherit;
}

.form-field input:focus,
.form-field select:focus,
.form-row input:focus {
  outline: none;
  border-color: #61ce70;
  box-shadow: 0 0 0 3px rgba(97, 206, 112, 0.2);
}

.form-section {
  display: grid;
  gap: 12px;
}

.form-section h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
