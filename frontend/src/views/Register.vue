<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/useAuthStore";
import api from "../api.js";

const router = useRouter();
const authStore = useAuthStore();

// Form data
const projectTitle = ref("");
const numberOfStudents = ref(1);
const numberOfSupervisors = ref(1);
const selectedFaculty = ref(null);
const selectedDepartment = ref(null);

// API data
const faculties = ref([]);
const departments = ref([]);
const loading = ref(false);
const error = ref("");
const successMessage = ref("");

// Students and supervisors arrays
const students = ref([
  { firstName: "", lastName: "", email: "", phone: "", academicLevel: "" },
]);
const supervisors = ref([
  { firstName: "", lastName: "", email: "", phone: "" },
]);

// Load faculties on mount
onMounted(async () => {
  try {
    loading.value = true;
    const response = await api.get("/faculties");
    faculties.value = response.data;
    loading.value = false;
  } catch (err) {
    error.value = "Failed to load faculties. Please try again.";
    loading.value = false;
    console.error("Error loading faculties:", err);
  }
});

// Watch number of students and update array
watch(numberOfStudents, (newVal) => {
  const current = students.value.length;
  if (newVal > current) {
    for (let i = current; i < newVal; i++) {
      students.value.push({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        academicLevel: "",
      });
    }
  } else if (newVal < current) {
    students.value = students.value.slice(0, newVal);
  }
});

// Watch number of supervisors and update array
watch(numberOfSupervisors, (newVal) => {
  const current = supervisors.value.length;
  if (newVal > current) {
    for (let i = current; i < newVal; i++) {
      supervisors.value.push({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
      });
    }
  } else if (newVal < current) {
    supervisors.value = supervisors.value.slice(0, newVal);
  }
});

// Watch faculty selection and load departments
watch(selectedFaculty, async (facultyId) => {
  if (facultyId) {
    try {
      const response = await api.get(`/faculties/${facultyId}/departments`);
      departments.value = response.data;
      console.log(departments.value);
      selectedDepartment.value = null; // Reset department selection
    } catch (err) {
      console.error("Error loading departments:", err);
      departments.value = [];
    }
  } else {
    departments.value = [];
    selectedDepartment.value = null;
  }
});

// Form submission
const handleSubmit = async () => {
  // Clear previous errors
  error.value = "";

  // Validate form
  if (!projectTitle.value.trim()) {
    error.value = "Please enter a project title.";
    return;
  }

  if (projectTitle.value.trim().length < 5) {
    error.value = "Project title must be at least 5 characters long.";
    return;
  }

  if (!selectedFaculty.value || !selectedDepartment.value) {
    error.value = "Please select a faculty and department.";
    return;
  }

  // Validate students data
  for (let i = 0; i < students.value.length; i++) {
    const student = students.value[i];
    if (
      !student.firstName ||
      !student.lastName ||
      !student.email ||
      !student.academicLevel
    ) {
      error.value = `Please complete all required fields for student ${i + 1}.`;
      return;
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(student.email)) {
      error.value = `Invalid email format for student ${i + 1}.`;
      return;
    }
  }

  // Validate supervisors data
  for (let i = 0; i < supervisors.value.length; i++) {
    const supervisor = supervisors.value[i];
    if (!supervisor.firstName || !supervisor.lastName || !supervisor.email) {
      error.value = `Please complete all required fields for supervisor ${
        i + 1
      }.`;
      return;
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(supervisor.email)) {
      error.value = `Invalid email format for supervisor ${i + 1}.`;
      return;
    }
  }

  // Prepare submission data matching API spec
  const formData = {
    projectTitle: projectTitle.value.trim(),
    numberOfStudents: numberOfStudents.value,
    numberOfSupervisors: numberOfSupervisors.value,
    facultyId: selectedFaculty.value,
    departmentId: selectedDepartment.value,
    students: students.value,
    supervisors: supervisors.value,
  };

  try {
    loading.value = true;
    error.value = "";

    // Submit to backend API
    const response = await api.post("/projects/register", formData);

    if (response.data.success) {
      // Clear error
      error.value = "";

      // Reset form
      projectTitle.value = "";
      numberOfStudents.value = 1;
      numberOfSupervisors.value = 1;
      selectedFaculty.value = null;
      selectedDepartment.value = null;
      students.value = [
        {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          academicLevel: "",
        },
      ];
      supervisors.value = [
        {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
        },
      ];

      // Redirect to success page
      router.push("/registration-success");
    } else {
      error.value =
        response.data.message || "Submission failed. Please try again.";
    }
  } catch (err) {
    console.error("Error submitting registration:", err);

    // Handle validation errors from backend
    if (err.response && err.response.data) {
      if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
        // Display first validation error
        const firstError = err.response.data.errors[0];
        error.value = `${firstError.field}: ${firstError.message}`;
      } else {
        error.value =
          err.response.data.message ||
          "Failed to submit registration. Please try again.";
      }
    } else {
      error.value =
        "Network error. Please check your connection and try again.";
    }
  } finally {
    loading.value = false;
  }
};

const navigateHome = () => {
  router.push("/");
};
</script>

<template>
  <div class="register-page">
    <!-- Navigation -->
    <nav class="navbar">
      <div class="container">
        <div class="logo">
          <router-link to="/">
            <img
              src="/incubator_logo.png"
              alt="Badji Mokhtar University Incubator"
              class="logo-img"
            />
            <div class="logo-text-container">
              <span class="logo-text">Badji Mokhtar University</span>
              <span class="logo-sub">Innovation Incubator</span>
            </div>
          </router-link>
        </div>
        <ul class="nav-links">
          <li><router-link to="/">Home</router-link></li>
          <li><router-link to="/register">Register Project</router-link></li>
          <li v-if="authStore.isAuthenticated">
            <router-link to="/dashboard">Dashboard</router-link>
          </li>
          <li v-else>
            <router-link to="/login">Login</router-link>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Registration Form -->
    <div class="registration-section">
      <div class="container">
        <div class="form-wrapper">
          <div class="form-header">
            <h1>Register Your Project</h1>
            <p>
              Complete the form below to submit your innovative project to the
              incubator
            </p>
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>

          <form
            @submit.prevent="handleSubmit"
            class="registration-form"
            :class="{ 'form-loading': loading }"
          >
            <!-- Project Title -->
            <div class="form-section">
              <h2>Project Information</h2>
              <div class="input-group">
                <label for="project-title" class="required"
                  >Project Title</label
                >
                <input
                  type="text"
                  id="project-title"
                  v-model="projectTitle"
                  placeholder="Enter your project title"
                  required
                />
              </div>
            </div>

            <!-- Number of Students -->
            <div class="form-section">
              <h2>Team Composition</h2>
              <div class="input-group">
                <label class="required">Number of Students</label>
                <div class="radio-group">
                  <label v-for="n in 6" :key="n" class="radio-option">
                    <input
                      type="radio"
                      :value="n"
                      v-model="numberOfStudents"
                      name="students-count"
                    />
                    <span class="radio-label">{{ n }}</span>
                  </label>
                </div>
              </div>

              <!-- Students Information -->
              <div class="cards-section">
                <h3>Student Information</h3>
                <div
                  v-for="(student, index) in students"
                  :key="index"
                  class="info-card"
                >
                  <div class="card-header">
                    <h4>Student {{ index + 1 }}</h4>
                  </div>
                  <div class="card-body">
                    <div class="input-row">
                      <div class="input-group">
                        <label
                          :for="`student-${index}-firstname`"
                          class="required"
                          >First Name</label
                        >
                        <input
                          type="text"
                          :id="`student-${index}-firstname`"
                          v-model="student.firstName"
                          placeholder="First name"
                          required
                        />
                      </div>
                      <div class="input-group">
                        <label
                          :for="`student-${index}-lastname`"
                          class="required"
                          >Last Name</label
                        >
                        <input
                          type="text"
                          :id="`student-${index}-lastname`"
                          v-model="student.lastName"
                          placeholder="Last name"
                          required
                        />
                      </div>
                    </div>
                    <div class="input-row">
                      <div class="input-group">
                        <label :for="`student-${index}-email`" class="required"
                          >Email</label
                        >
                        <input
                          type="email"
                          :id="`student-${index}-email`"
                          v-model="student.email"
                          placeholder="email@example.com"
                          required
                        />
                      </div>
                      <div class="input-group">
                        <label :for="`student-${index}-phone`">Phone</label>
                        <input
                          type="tel"
                          :id="`student-${index}-phone`"
                          v-model="student.phone"
                          placeholder="0XXXXXXXXX"
                        />
                      </div>
                    </div>
                    <div class="input-row">
                      <div class="input-group">
                        <label :for="`student-${index}-level`" class="required"
                          >Academic Level</label
                        >
                        <select
                          :id="`student-${index}-level`"
                          v-model="student.academicLevel"
                          required
                        >
                          <option value="">Select academic level</option>
                          <option value="L1">License 1 (L1)</option>
                          <option value="L2">License 2 (L2)</option>
                          <option value="L3">License 3 (L3)</option>
                          <option value="M1">Master 1 (M1)</option>
                          <option value="M2">Master 2 (M2)</option>
                          <option value="PhD">PhD/Doctorate</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Number of Supervisors -->
            <div class="form-section">
              <div class="input-group">
                <label class="required">Number of Supervisors</label>
                <div class="radio-group">
                  <label v-for="n in 3" :key="n" class="radio-option">
                    <input
                      type="radio"
                      :value="n"
                      v-model="numberOfSupervisors"
                      name="supervisors-count"
                    />
                    <span class="radio-label">{{ n }}</span>
                  </label>
                </div>
              </div>

              <!-- Supervisors Information -->
              <div class="cards-section">
                <h3>Supervisor Information</h3>
                <div
                  v-for="(supervisor, index) in supervisors"
                  :key="index"
                  class="info-card"
                >
                  <div class="card-header">
                    <h4>Supervisor {{ index + 1 }}</h4>
                  </div>
                  <div class="card-body">
                    <div class="input-row">
                      <div class="input-group">
                        <label
                          :for="`supervisor-${index}-firstname`"
                          class="required"
                          >First Name</label
                        >
                        <input
                          type="text"
                          :id="`supervisor-${index}-firstname`"
                          v-model="supervisor.firstName"
                          placeholder="First name"
                          required
                        />
                      </div>
                      <div class="input-group">
                        <label
                          :for="`supervisor-${index}-lastname`"
                          class="required"
                          >Last Name</label
                        >
                        <input
                          type="text"
                          :id="`supervisor-${index}-lastname`"
                          v-model="supervisor.lastName"
                          placeholder="Last name"
                          required
                        />
                      </div>
                    </div>
                    <div class="input-row">
                      <div class="input-group">
                        <label
                          :for="`supervisor-${index}-email`"
                          class="required"
                          >Email</label
                        >
                        <input
                          type="email"
                          :id="`supervisor-${index}-email`"
                          v-model="supervisor.email"
                          placeholder="email@example.com"
                          required
                        />
                      </div>
                      <div class="input-group">
                        <label :for="`supervisor-${index}-phone`">Phone</label>
                        <input
                          type="tel"
                          :id="`supervisor-${index}-phone`"
                          v-model="supervisor.phone"
                          placeholder="0XXXXXXXXX"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Faculty and Department -->
            <div class="form-section">
              <h2>Academic Information</h2>
              <div class="input-group">
                <label for="faculty" class="required">Faculty</label>
                <select id="faculty" v-model="selectedFaculty" required>
                  <option :value="null">Select a faculty</option>
                  <option
                    v-for="faculty in faculties"
                    :key="faculty.id"
                    :value="faculty.id"
                  >
                    {{ faculty.faculty_name_en }}
                  </option>
                </select>
              </div>

              <div class="input-group" v-if="selectedFaculty">
                <label for="department" class="required">Department</label>
                <select id="department" v-model="selectedDepartment" required>
                  <option :value="null">Select a department</option>
                  <option
                    v-for="dept in departments"
                    :key="dept.id"
                    :value="dept.id"
                  >
                    {{ dept.departement_name_en }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="navigateHome">
                Cancel
              </button>
              <button type="submit" class="btn-primary" :disabled="loading">
                {{ loading ? "Submitting..." : "Submit Application" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.register-page {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  min-height: 100vh;
  background: #ffffff;
  direction: ltr;
  text-align: left;
}

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 30px;
  width: 100%;
}

/* Navigation */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 12px 0;
  z-index: 1000;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo a {
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-img {
  height: 50px;
  width: auto;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.logo-img:hover {
  transform: scale(1.05);
}

.logo-text-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.logo-text {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.3px;
}

.logo-sub {
  font-size: 11px;
  font-weight: 600;
  color: #23a455;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 35px;
  align-items: center;
}

.nav-links a {
  text-decoration: none;
  color: #1a1a1a;
  font-weight: 500;
  font-size: 15px;
  transition: color 0.3s ease;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: #61ce70;
}

/* Registration Section */
.registration-section {
  padding: 120px 0 80px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
}

.form-wrapper {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  padding: 40px 35px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
}

.form-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.form-header p {
  font-size: 15px;
  color: #666;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

/* Error Message */
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
  box-shadow: 0 4px 12px rgba(255, 68, 68, 0.1);
  animation: slideDown 0.3s ease;
}

/* Success Message */
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
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.1);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.registration-form {
  position: relative;
}

.form-loading {
  opacity: 0.6;
  pointer-events: none;
}

/* Form Sections */
.form-section {
  margin-bottom: 40px;
  position: relative;
}

.form-section::before {
  content: "";
  position: absolute;
  left: -35px;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #e8f5eb;
  border-radius: 2px;
}

.form-section h2 {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 20px;
  position: relative;
  display: inline-block;
}

/* Special styling for Academic Information section */
.form-section:last-of-type {
  background: #f0fdf4;
  padding: 30px;
  border-radius: 16px;
  border: 2px solid #e8f5eb;
  box-shadow: 0 4px 20px rgba(97, 206, 112, 0.08);
  position: relative;
  overflow: hidden;
}

.form-section:last-of-type h2 {
  color: #23a455;
  font-size: 24px;
  margin-bottom: 24px;
}

.form-section:last-of-type .input-group {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  border: 2px solid #e8f5eb;
  transition: all 0.3s ease;
}

.form-section:last-of-type .input-group:hover {
  border-color: #61ce70;
  box-shadow: 0 4px 12px rgba(97, 206, 112, 0.1);
}

.form-section:last-of-type .input-group label {
  color: #23a455;
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 700;
  margin-bottom: 12px;
}

.form-section:last-of-type .input-group select {
  border: 2px solid #61ce70;
  background: white;
  font-weight: 600;
  font-size: 15px;
  padding: 14px 16px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(97, 206, 112, 0.1);
  color: #1a1a1a;
}

.form-section:last-of-type .input-group select option {
  color: #1a1a1a;
  background: white;
}

.form-section:last-of-type .input-group select option:first-child {
  color: #999;
}

.form-section:last-of-type .input-group select:focus {
  box-shadow: 0 0 0 4px rgba(97, 206, 112, 0.15),
    0 8px 20px rgba(97, 206, 112, 0.2);
  border-color: #23a455;
}

.form-section h3 {
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
  letter-spacing: 0.3px;
}
.input-group {
  margin-bottom: 18px;
}

.input-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
  letter-spacing: 0.2px;
  position: relative;
}

.input-group label.required::after {
  content: "*";
  display: inline-block;
  color: #ff4444;
  font-size: 16px;
  font-weight: 700;
  margin-left: 4px;
  vertical-align: middle;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.input-group input[type="text"],
.input-group input[type="email"],
.input-group input[type="tel"],
.input-group select {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e8f5eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  color: #1a1a1a;
  position: relative;
}

.input-group input:focus,
.input-group select:focus {
  outline: none;
  border-color: #61ce70;
  box-shadow: 0 0 0 3px rgba(97, 206, 112, 0.1);
}

.input-group input::placeholder {
  color: #999;
  font-style: italic;
}

.input-group select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='14' height='9' viewBox='0 0 14 9' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L7 7L13 1' stroke='%2361ce70' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 18px center;
  padding-right: 50px;
  background-color: white;
  font-weight: 500;
}

.input-group select:hover {
  border-color: #61ce70;
}

.input-group select option {
  padding: 12px;
  background: white;
  color: #1a1a1a;
  font-weight: 500;
}

.input-group select option:first-child {
  color: #999;
  font-style: italic;
}

/* Radio Groups */
.radio-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.radio-option {
  position: relative;
  cursor: pointer;
}

.radio-option input[type="radio"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.radio-label {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s ease;
  text-align: center;
  min-height: 48px;
  position: relative;
}

.radio-option:hover .radio-label {
  border-color: #61ce70;
  background: #f0fdf4;
}

.radio-option input[type="radio"]:checked + .radio-label {
  background: linear-gradient(135deg, #61ce70 0%, #23a455 100%);
  color: white;
  border-color: #61ce70;
  box-shadow: 0 4px 12px rgba(97, 206, 112, 0.25);
}

/* Cards Section */
.cards-section {
  margin-top: 20px;
  background: #f0fdf4;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid #e8f5eb;
}

.cards-section h3 {
  position: relative;
}

.info-card {
  background: white;
  border: 2px solid #e8f5eb;
  border-radius: 12px;
  margin-bottom: 18px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.info-card:hover {
  border-color: #61ce70;
  box-shadow: 0 4px 16px rgba(97, 206, 112, 0.1);
}

.info-card:last-child {
  margin-bottom: 0;
}

.card-header {
  background: linear-gradient(135deg, #61ce70 0%, #23a455 100%);
  padding: 14px 20px;
  border-bottom: none;
}

.card-header h4 {
  font-size: 15px;
  font-weight: 600;
  color: white;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.card-body {
  padding: 20px;
  background: white;
}

.input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.input-row:last-child {
  margin-bottom: 0;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 35px;
  padding-top: 30px;
  border-top: 2px solid #f0f0f0;
}

.btn-primary,
.btn-secondary {
  padding: 14px 32px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  border: none;
  letter-spacing: 0.2px;
}

.btn-primary {
  background: linear-gradient(135deg, #61ce70 0%, #23a455 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(97, 206, 112, 0.25);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #23a455 0%, #1a8542 100%);
  box-shadow: 0 6px 20px rgba(35, 164, 85, 0.35);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 4px 14px rgba(97, 206, 112, 0.25);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-secondary {
  background: white;
  color: #1a1a1a;
  border: 2px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.btn-secondary:hover {
  background: #f8f8f8;
  border-color: #1a1a1a;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 0 20px;
  }

  .nav-links {
    display: none;
  }

  .registration-section {
    padding: 100px 0 60px;
  }

  .form-wrapper {
    padding: 30px 20px;
  }

  .form-wrapper::before {
    height: 3px;
  }

  .form-section::before {
    left: -20px;
  }

  .form-header h1 {
    font-size: 26px;
  }

  .form-header p {
    font-size: 14px;
  }

  .form-section h2 {
    font-size: 20px;
  }

  .input-row {
    grid-template-columns: 1fr;
  }

  .radio-group {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .radio-label {
    padding: 10px 12px;
    font-size: 13px;
    min-height: 44px;
  }

  .form-actions {
    flex-direction: column-reverse;
    gap: 10px;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    padding: 12px 24px;
  }

  .cards-section {
    padding: 16px;
  }

  .card-header {
    padding: 12px 16px;
  }

  .card-header h4 {
    font-size: 14px;
  }

  .card-body {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .form-wrapper {
    padding: 25px 16px;
  }

  .form-header h1 {
    font-size: 22px;
  }

  .form-header::after {
    width: 50px;
    height: 2px;
  }

  .form-section {
    margin-bottom: 30px;
    padding-left: 0;
  }

  .form-section::before {
    display: none;
  }

  .form-section h2 {
    font-size: 18px;
    margin-bottom: 16px;
  }

  .radio-group {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .radio-label {
    padding: 10px 12px;
    font-size: 13px;
    min-height: 42px;
  }

  .input-group input[type="text"],
  .input-group input[type="email"],
  .input-group input[type="tel"],
  .input-group select {
    padding: 11px 12px;
    font-size: 13px;
  }

  .cards-section {
    padding: 12px;
  }

  .btn-primary,
  .btn-secondary {
    padding: 11px 20px;
    font-size: 14px;
  }
}
</style>
