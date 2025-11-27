<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();

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
    const response = await axios.get("http://localhost:3000/api/faculties");
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
      const response = await axios.get(
        `http://localhost:3000/api/faculties/${facultyId}/departments`
      );
      departments.value = response.data;
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
    const response = await axios.post(
      "http://localhost:3000/api/projects/register",
      formData
    );

    if (response.data.success) {
      // Show success message
      successMessage.value = `Success! Your project "${response.data.data.projectTitle}" has been submitted successfully. Registration ID: ${response.data.data.registrationId}. You will be notified once your project is reviewed.`;

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

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Navigate to home page after delay
      setTimeout(() => {
        router.push("/");
      }, 5000);
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
        <div class="logo" @click="navigateHome">
          <span class="logo-text">Badji Mokhtar University</span>
          <span class="logo-sub">Innovation Incubator</span>
        </div>
        <ul class="nav-links">
          <li><router-link to="/">Home</router-link></li>
          <li><router-link to="/register">Register Project</router-link></li>
          <li><router-link to="/login">Login</router-link></li>
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
                <label for="project-title">Project Title *</label>
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
                <label>Number of Students *</label>
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
                        <label :for="`student-${index}-firstname`"
                          >First Name *</label
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
                        <label :for="`student-${index}-lastname`"
                          >Last Name *</label
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
                        <label :for="`student-${index}-email`">Email *</label>
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
                          placeholder="+213 XXX XXX XXX"
                        />
                      </div>
                    </div>
                    <div class="input-row">
                      <div class="input-group">
                        <label :for="`student-${index}-level`"
                          >Academic Level *</label
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
                <label>Number of Supervisors *</label>
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
                        <label :for="`supervisor-${index}-firstname`"
                          >First Name *</label
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
                        <label :for="`supervisor-${index}-lastname`"
                          >Last Name *</label
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
                        <label :for="`supervisor-${index}-email`"
                          >Email *</label
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
                          placeholder="+213 XXX XXX XXX"
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
                <label for="faculty">Faculty *</label>
                <select id="faculty" v-model="selectedFaculty" required>
                  <option :value="null">Select a faculty</option>
                  <option
                    v-for="faculty in faculties"
                    :key="faculty.id"
                    :value="faculty.id"
                  >
                    {{ faculty.faculty_name }}
                  </option>
                </select>
              </div>

              <div class="input-group" v-if="selectedFaculty">
                <label for="department">Department *</label>
                <select id="department" v-model="selectedDepartment" required>
                  <option :value="null">Select a department</option>
                  <option
                    v-for="dept in departments"
                    :key="dept.id"
                    :value="dept.id"
                  >
                    {{ dept.departement_name }}
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
  background: #fafafa;
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
  padding: 20px 0;
  z-index: 1000;
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.5px;
}

.logo-sub {
  font-size: 12px;
  font-weight: 500;
  color: #666;
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
  color: #0066ff;
}

/* Registration Section */
.registration-section {
  padding: 120px 0 80px;
  min-height: 100vh;
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

.form-wrapper::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: #0066ff;
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
}

.form-header::after {
  content: "";
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: #0066ff;
  border-radius: 2px;
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
  background: #e6edff;
  border-radius: 2px;
}

.form-section h2 {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #0066ff;
  position: relative;
  display: inline-block;
}

.form-section h2::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 50px;
  height: 2px;
  background: #1a1a1a;
}

.form-section h3 {
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
  letter-spacing: 0.3px;
}

/* Input Groups */
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
}

.input-group label::after {
  content: "";
  display: inline-block;
  width: 3px;
  height: 3px;
  background: #0066ff;
  border-radius: 50%;
  margin-left: 4px;
  vertical-align: middle;
}

.input-group input[type="text"],
.input-group input[type="email"],
.input-group input[type="tel"],
.input-group select {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e6edff;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  color: #1a1a1a;
}

.input-group input:focus,
.input-group select:focus {
  outline: none;
  border-color: #0066ff;
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
  transform: translateY(-1px);
}

.input-group input::placeholder {
  color: #999;
}

.input-group select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='14' height='9' viewBox='0 0 14 9' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L7 7L13 1' stroke='%230066ff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 18px center;
  padding-right: 50px;
}

.input-group select:hover {
  border-color: #0066ff;
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  min-height: 48px;
  position: relative;
  overflow: hidden;
}

.radio-label::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #0066ff;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.radio-option:hover .radio-label {
  border-color: #0066ff;
  background: #f8f9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 102, 255, 0.15);
}

.radio-option input[type="radio"]:checked + .radio-label {
  background: #0066ff;
  color: white;
  border-color: #0066ff;
  box-shadow: 0 6px 20px rgba(0, 102, 255, 0.3);
}

.radio-option input[type="radio"]:checked + .radio-label::before {
  transform: scaleX(1);
}

/* Cards Section */
.cards-section {
  margin-top: 20px;
  background: #f8f9ff;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #e6edff;
}

.info-card {
  background: white;
  border: 2px solid #e6edff;
  border-radius: 10px;
  margin-bottom: 18px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.info-card:hover {
  border-color: #0066ff;
  box-shadow: 0 8px 24px rgba(0, 102, 255, 0.12);
  transform: translateY(-2px);
}

.info-card:last-child {
  margin-bottom: 0;
}

.card-header {
  background: #0066ff;
  padding: 14px 20px;
  border-bottom: none;
}

.card-header h4 {
  font-size: 15px;
  font-weight: 600;
  color: white;
  letter-spacing: 0.2px;
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
  border: none;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.2px;
}

.btn-primary::before,
.btn-secondary::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn-primary:hover::before,
.btn-secondary:hover::before {
  width: 300px;
  height: 300px;
}

.btn-primary {
  background: #0066ff;
  color: white;
  box-shadow: 0 4px 14px rgba(0, 102, 255, 0.25);
}

.btn-primary:hover:not(:disabled) {
  background: #0052cc;
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(0, 102, 255, 0.4);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 102, 255, 0.3);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.btn-secondary {
  background: white;
  color: #1a1a1a;
  border: 2px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.btn-secondary::before {
  background: rgba(0, 0, 0, 0.05);
}

.btn-secondary:hover {
  background: #f8f8f8;
  border-color: #1a1a1a;
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
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
