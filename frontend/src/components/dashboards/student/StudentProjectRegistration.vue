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
const profileStudentData = computed(() => ({
  firstName: authStore.user?.first_name || "",
  lastName: authStore.user?.last_name || "",
  email: authStore.user?.email || "",
  phone: authStore.user?.phone_number || "",
  academicLevel: authStore.user?.academic_level || "",
}));

const registrationStatusLabel = computed(() => {
  if (!registrationStatus.value) return "No registration";
  return registrationStatus.value.replace("_", " ");
});

const isFormLocked = computed(() => !canEdit.value || loading.value || saving.value);
const submitLabel = computed(() => {
  if (saving.value) return "Saving...";
  return isEditMode.value ? "Save Changes" : "Submit Registration";
});

const academicLevelOptions = [
  { value: "L1", label: "License 1 (L1)" },
  { value: "L2", label: "License 2 (L2)" },
  { value: "L3", label: "License 3 (L3)" },
  { value: "M1", label: "Master 1 (M1)" },
  { value: "M2", label: "Master 2 (M2)" },
  { value: "PhD", label: "PhD/Doctorate" },
];

const createStudentFieldErrors = () => ({
  firstName: "",
  lastName: "",
  email: "",
  academicLevel: "",
});

const createSupervisorFieldErrors = () => ({
  firstName: "",
  lastName: "",
  email: "",
});

const fieldErrors = ref({
  projectTitle: "",
  numberOfStudents: "",
  numberOfSupervisors: "",
  selectedFaculty: "",
  selectedDepartment: "",
  students: [createStudentFieldErrors()],
  supervisors: [createSupervisorFieldErrors()],
});

const syncNestedFieldErrors = () => {
  fieldErrors.value.students = students.value.map(
    (_, index) => fieldErrors.value.students[index] || createStudentFieldErrors(),
  );
  fieldErrors.value.supervisors = supervisors.value.map(
    (_, index) =>
      fieldErrors.value.supervisors[index] || createSupervisorFieldErrors(),
  );
};

const resetFieldErrors = () => {
  fieldErrors.value.projectTitle = "";
  fieldErrors.value.numberOfStudents = "";
  fieldErrors.value.numberOfSupervisors = "";
  fieldErrors.value.selectedFaculty = "";
  fieldErrors.value.selectedDepartment = "";
  syncNestedFieldErrors();
  fieldErrors.value.students = fieldErrors.value.students.map(() =>
    createStudentFieldErrors(),
  );
  fieldErrors.value.supervisors = fieldErrors.value.supervisors.map(() =>
    createSupervisorFieldErrors(),
  );
};

const synchronizeFirstStudentFromProfile = ({ overwrite = false } = {}) => {
  const profile = profileStudentData.value;
  if (!profile.email) return;

  if (!students.value.length) {
    students.value.push({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      academicLevel: "",
    });
  }

  const firstStudent = students.value[0];
  if (overwrite || !firstStudent.firstName?.trim()) {
    firstStudent.firstName = profile.firstName;
  }
  if (overwrite || !firstStudent.lastName?.trim()) {
    firstStudent.lastName = profile.lastName;
  }
  if (overwrite || !firstStudent.phone?.trim()) {
    firstStudent.phone = profile.phone;
  }
  if (overwrite || !firstStudent.academicLevel?.trim()) {
    firstStudent.academicLevel = profile.academicLevel;
  }

  // Keep registration ownership attached to the logged-in student account.
  firstStudent.email = profile.email;
};

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
  syncNestedFieldErrors();
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
  syncNestedFieldErrors();
});

watch(selectedFaculty, (facultyId) => {
  selectedDepartment.value = "";
  fieldErrors.value.selectedDepartment = "";
  loadDepartments(facultyId);
});

watch(
  () => authStore.user,
  () => {
    synchronizeFirstStudentFromProfile();
  },
  { deep: true },
);

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
  synchronizeFirstStudentFromProfile({ overwrite: true });
  syncNestedFieldErrors();
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
  resetFieldErrors();
  error.value = "";

  const trimmedProjectTitle = projectTitle.value.trim();

  if (!projectTitle.value.trim()) {
    fieldErrors.value.projectTitle = "Please enter a project title.";
    error.value = "Please enter a project title.";
    return false;
  }

  if (trimmedProjectTitle.length < 5) {
    fieldErrors.value.projectTitle =
      "Project title must be at least 5 characters long.";
    error.value = "Project title must be at least 5 characters long.";
    return false;
  }

  if (!Number(numberOfStudents.value) || Number(numberOfStudents.value) < 1) {
    fieldErrors.value.numberOfStudents = "Minimum is 1 student.";
    error.value = "Number of students must be at least 1.";
    return false;
  }

  if (
    !Number(numberOfSupervisors.value) ||
    Number(numberOfSupervisors.value) < 1
  ) {
    fieldErrors.value.numberOfSupervisors = "Minimum is 1 supervisor.";
    error.value = "Number of supervisors must be at least 1.";
    return false;
  }

  if (!selectedFaculty.value || !selectedDepartment.value) {
    if (!selectedFaculty.value) {
      fieldErrors.value.selectedFaculty = "Please select a faculty.";
    }
    if (!selectedDepartment.value) {
      fieldErrors.value.selectedDepartment = "Please select a department.";
    }
    error.value = "Please select a faculty and department.";
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  for (let i = 0; i < students.value.length; i += 1) {
    const student = students.value[i];
    const studentErrors = fieldErrors.value.students[i];
    if (!student.firstName?.trim()) {
      studentErrors.firstName = "First name is required.";
    }
    if (!student.lastName?.trim()) {
      studentErrors.lastName = "Last name is required.";
    }
    if (!student.email?.trim()) {
      studentErrors.email = "Email is required.";
    } else if (!emailRegex.test(student.email.trim())) {
      studentErrors.email = "Invalid email format.";
    }
    if (!student.academicLevel?.trim()) {
      studentErrors.academicLevel = "Academic level is required.";
    }
    if (
      studentErrors.firstName ||
      studentErrors.lastName ||
      studentErrors.email ||
      studentErrors.academicLevel
    ) {
      error.value = `Please complete all required fields for student ${i + 1}.`;
      return false;
    }
  }

  for (let i = 0; i < supervisors.value.length; i += 1) {
    const supervisor = supervisors.value[i];
    const supervisorErrors = fieldErrors.value.supervisors[i];
    if (!supervisor.firstName?.trim()) {
      supervisorErrors.firstName = "First name is required.";
    }
    if (!supervisor.lastName?.trim()) {
      supervisorErrors.lastName = "Last name is required.";
    }
    if (!supervisor.email?.trim()) {
      supervisorErrors.email = "Email is required.";
    } else if (!emailRegex.test(supervisor.email.trim())) {
      supervisorErrors.email = "Invalid email format.";
    }
    if (
      supervisorErrors.firstName ||
      supervisorErrors.lastName ||
      supervisorErrors.email
    ) {
      error.value = `Please complete all required fields for supervisor ${
        i + 1
      }.`;
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
  resetFieldErrors();
  error.value = "";
  successMessage.value = "";
  // Keep account linkage via email, but preserve user edits on first student fields.
  synchronizeFirstStudentFromProfile();

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
      try {
        const meResponse = await api.get("/users/me");
        authStore.user = meResponse.data;
      } catch (profileError) {
        console.warn("Unable to refresh account profile after registration update.");
      }
    } else {
      const response = await api.post("/projects/register", payload);
      successMessage.value =
        response.data?.message || "Registration submitted successfully.";
      isEditMode.value = true;
      registrationStatus.value = response.data?.data?.status || "pending";
      try {
        const meResponse = await api.get("/users/me");
        authStore.user = meResponse.data;
      } catch (profileError) {
        console.warn("Unable to refresh account profile after registration submit.");
      }
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
  if (!authStore.isInitialized) {
    await authStore.checkAuth();
  }
  synchronizeFirstStudentFromProfile({ overwrite: true });
  await loadFaculties();
  await loadExistingRegistration();
  if (selectedFaculty.value) {
    await loadDepartments(selectedFaculty.value);
  }
  synchronizeFirstStudentFromProfile({ overwrite: true });
  syncNestedFieldErrors();
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
                <p class="status-line">
                  Status:
                  <span class="status-badge">{{ registrationStatusLabel }}</span>
                </p>
              </div>
              <button
                class="submit-btn"
                type="submit"
                form="project-registration-form"
                :disabled="isFormLocked"
              >
                {{ submitLabel }}
              </button>
            </div>

            <div v-if="!canEdit" class="lock-banner">
              This registration is locked because it has already been approved.
            </div>

            <form
              id="project-registration-form"
              class="registration-form"
              @submit.prevent="handleSubmit"
            >
              <div class="form-grid">
                <div class="form-field form-field-wide">
                  <label>Project Title <span class="required">*</span></label>
                  <input
                    v-model="projectTitle"
                    type="text"
                    placeholder="Project title"
                    :disabled="isFormLocked"
                    :class="{ invalid: !!fieldErrors.projectTitle }"
                  />
                  <p v-if="fieldErrors.projectTitle" class="input-error">
                    {{ fieldErrors.projectTitle }}
                  </p>
                </div>
                <div class="form-field">
                  <label>Faculty <span class="required">*</span></label>
                  <select
                    v-model="selectedFaculty"
                    :disabled="isFormLocked"
                    :class="{ invalid: !!fieldErrors.selectedFaculty }"
                  >
                    <option value="">Select faculty</option>
                    <option
                      v-for="faculty in faculties"
                      :key="faculty.id"
                      :value="String(faculty.id)"
                    >
                      {{ faculty.faculty_name_en || faculty.faculty_name }}
                    </option>
                  </select>
                  <p v-if="fieldErrors.selectedFaculty" class="input-error">
                    {{ fieldErrors.selectedFaculty }}
                  </p>
                </div>
                <div class="form-field">
                  <label>Department <span class="required">*</span></label>
                  <select
                    v-model="selectedDepartment"
                    :disabled="isFormLocked || !selectedFaculty"
                    :class="{ invalid: !!fieldErrors.selectedDepartment }"
                  >
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
                  <p v-if="fieldErrors.selectedDepartment" class="input-error">
                    {{ fieldErrors.selectedDepartment }}
                  </p>
                </div>
                <div class="form-field">
                  <label>Number of Students <span class="required">*</span></label>
                  <input
                    v-model.number="numberOfStudents"
                    type="number"
                    min="1"
                    :disabled="isFormLocked"
                    :class="{ invalid: !!fieldErrors.numberOfStudents }"
                  />
                  <p v-if="fieldErrors.numberOfStudents" class="input-error">
                    {{ fieldErrors.numberOfStudents }}
                  </p>
                </div>
                <div class="form-field">
                  <label
                    >Number of Supervisors <span class="required">*</span></label
                  >
                  <input
                    v-model.number="numberOfSupervisors"
                    type="number"
                    min="1"
                    :disabled="isFormLocked"
                    :class="{ invalid: !!fieldErrors.numberOfSupervisors }"
                  />
                  <p v-if="fieldErrors.numberOfSupervisors" class="input-error">
                    {{ fieldErrors.numberOfSupervisors }}
                  </p>
                </div>
              </div>

              <div class="form-section">
                <h3>Students</h3>
                <div
                  v-for="(student, index) in students"
                  :key="`student-${index}`"
                  class="entry-card"
                >
                  <h4>
                    Student {{ index + 1 }}
                    <span v-if="index === 0" class="profile-sync-badge">
                      Linked to your account
                    </span>
                  </h4>
                  <div class="form-row">
                    <div class="row-field">
                      <input
                        v-model="student.firstName"
                        type="text"
                        placeholder="First name *"
                        :disabled="isFormLocked"
                        :class="{ invalid: !!fieldErrors.students[index]?.firstName }"
                      />
                      <p
                        v-if="fieldErrors.students[index]?.firstName"
                        class="input-error"
                      >
                        {{ fieldErrors.students[index].firstName }}
                      </p>
                    </div>
                    <div class="row-field">
                      <input
                        v-model="student.lastName"
                        type="text"
                        placeholder="Last name *"
                        :disabled="isFormLocked"
                        :class="{ invalid: !!fieldErrors.students[index]?.lastName }"
                      />
                      <p
                        v-if="fieldErrors.students[index]?.lastName"
                        class="input-error"
                      >
                        {{ fieldErrors.students[index].lastName }}
                      </p>
                    </div>
                    <div class="row-field">
                      <input
                        v-model="student.email"
                        type="email"
                        placeholder="Email *"
                        :disabled="isFormLocked || index === 0"
                        :class="{ invalid: !!fieldErrors.students[index]?.email }"
                      />
                      <p v-if="index === 0" class="input-hint">
                        The first student email is synced from your profile.
                      </p>
                      <p
                        v-if="fieldErrors.students[index]?.email"
                        class="input-error"
                      >
                        {{ fieldErrors.students[index].email }}
                      </p>
                    </div>
                    <div class="row-field">
                      <input
                        v-model="student.phone"
                        type="text"
                        placeholder="Phone (optional)"
                        :disabled="isFormLocked"
                      />
                    </div>
                    <div class="row-field">
                      <select
                        v-model="student.academicLevel"
                        :disabled="isFormLocked"
                        :class="{
                          invalid: !!fieldErrors.students[index]?.academicLevel,
                        }"
                      >
                        <option value="">Select academic level *</option>
                        <option
                          v-for="levelOption in academicLevelOptions"
                          :key="levelOption.value"
                          :value="levelOption.value"
                        >
                          {{ levelOption.label }}
                        </option>
                      </select>
                      <p
                        v-if="fieldErrors.students[index]?.academicLevel"
                        class="input-error"
                      >
                        {{ fieldErrors.students[index].academicLevel }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-section">
                <h3>Supervisors</h3>
                <div
                  v-for="(supervisor, index) in supervisors"
                  :key="`supervisor-${index}`"
                  class="entry-card"
                >
                  <h4>Supervisor {{ index + 1 }}</h4>
                  <div class="form-row">
                    <div class="row-field">
                      <input
                        v-model="supervisor.firstName"
                        type="text"
                        placeholder="First name *"
                        :disabled="isFormLocked"
                        :class="{
                          invalid: !!fieldErrors.supervisors[index]?.firstName,
                        }"
                      />
                      <p
                        v-if="fieldErrors.supervisors[index]?.firstName"
                        class="input-error"
                      >
                        {{ fieldErrors.supervisors[index].firstName }}
                      </p>
                    </div>
                    <div class="row-field">
                      <input
                        v-model="supervisor.lastName"
                        type="text"
                        placeholder="Last name *"
                        :disabled="isFormLocked"
                        :class="{
                          invalid: !!fieldErrors.supervisors[index]?.lastName,
                        }"
                      />
                      <p
                        v-if="fieldErrors.supervisors[index]?.lastName"
                        class="input-error"
                      >
                        {{ fieldErrors.supervisors[index].lastName }}
                      </p>
                    </div>
                    <div class="row-field">
                      <input
                        v-model="supervisor.email"
                        type="email"
                        placeholder="Email *"
                        :disabled="isFormLocked"
                        :class="{ invalid: !!fieldErrors.supervisors[index]?.email }"
                      />
                      <p
                        v-if="fieldErrors.supervisors[index]?.email"
                        class="input-error"
                      >
                        {{ fieldErrors.supervisors[index].email }}
                      </p>
                    </div>
                    <div class="row-field">
                      <input
                        v-model="supervisor.phone"
                        type="text"
                        placeholder="Phone (optional)"
                        :disabled="isFormLocked"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-footer">
                <button class="submit-btn full-width" type="submit" :disabled="isFormLocked">
                  {{ submitLabel }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.student-registration-page .section-card {
  background: linear-gradient(180deg, #ffffff 0%, #f8fbf8 100%);
}

.student-registration-page .error-message,
.student-registration-page .success-message {
  border-radius: 10px;
  padding: 14px 18px;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 600;
}

.student-registration-page .error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
}

.student-registration-page .success-message {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #15803d;
}

.section-header {
  align-items: flex-start;
  gap: 12px;
}

.section-header h2 {
  margin-bottom: 4px;
}

.status-line {
  margin: 0;
  color: #475569;
  font-size: 14px;
}

.status-badge {
  display: inline-block;
  margin-left: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #eaf8ec;
  color: #166534;
  font-weight: 700;
  text-transform: capitalize;
}

.lock-banner {
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #854d0e;
  padding: 12px 14px;
  border-radius: 10px;
  margin-bottom: 20px;
  font-size: 13px;
  font-weight: 600;
}

.registration-form {
  display: grid;
  gap: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.form-field-wide {
  grid-column: 1 / -1;
}

.form-field label {
  font-size: 12px;
  font-weight: 700;
  color: #334155;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.required {
  color: #b91c1c;
}

.form-field input,
.form-field select,
.form-row input,
.form-row select {
  padding: 11px 12px;
  border-radius: 8px;
  border: 1px solid #d6dee4;
  font-size: 14px;
  font-family: inherit;
  background: #fff;
  color: #111827;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-field input:focus,
.form-field select:focus,
.form-row input:focus,
.form-row select:focus {
  outline: none;
  border-color: #61ce70;
  box-shadow: 0 0 0 3px rgba(97, 206, 112, 0.2);
}

.form-field input:disabled,
.form-field select:disabled,
.form-row input:disabled,
.form-row select:disabled {
  background: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}

.input-error {
  margin: -2px 0 0;
  font-size: 12px;
  color: #b91c1c;
}

.input-hint {
  margin: -2px 0 0;
  font-size: 12px;
  color: #475569;
}

.invalid {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.12) !important;
}

.form-section {
  display: grid;
  gap: 14px;
}

.form-section h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.entry-card {
  padding: 14px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  display: grid;
  gap: 10px;
}

.entry-card h4 {
  margin: 0;
  font-size: 14px;
  color: #334155;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-sync-badge {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 999px;
  background: #e0f2fe;
  color: #075985;
  font-size: 11px;
  font-weight: 700;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.row-field {
  display: grid;
  gap: 6px;
}

.submit-btn {
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #16a34a, #22c55e);
  color: #ffffff;
  padding: 11px 16px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: filter 0.2s ease, transform 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  filter: brightness(1.05);
  transform: translateY(-1px);
}

.submit-btn:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.form-footer {
  display: none;
}

.full-width {
  width: 100%;
}

@media (max-width: 768px) {
  .section-header .submit-btn {
    display: none;
  }

  .form-footer {
    display: block;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
