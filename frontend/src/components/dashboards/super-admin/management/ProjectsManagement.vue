<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import api from "../../../../api.js";

const router = useRouter();

const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const error = ref("");
const successMessage = ref("");

const projects = ref([]);
const departments = ref([]);
const preIncubationStatuses = ref([]);
const accelerationStatuses = ref([]);

const filters = ref({
  search: "",
  departmentId: "",
  incubated: "",
});

const showModal = ref(false);
const isEditMode = ref(false);
const selectedProject = ref(null);
const showDeleteModal = ref(false);
const projectToDelete = ref(null);

const formData = ref({
  title: "",
  project_code: "",
  finalpv: "",
  departement_id: "",
  pre_incubation_status: "",
  acceleration_status: "",
  progress_percent: 0,
  incubated: false,
});

const filteredProjects = computed(() => {
  return projects.value.filter((project) => {
    const search = filters.value.search.trim().toLowerCase();
    const title = (project.title || "").toLowerCase();
    const code = (project.project_code || "").toLowerCase();

    const matchesSearch = !search || title.includes(search) || code.includes(search);
    const matchesDepartment =
      !filters.value.departmentId ||
      String(project.departement_id || "") === String(filters.value.departmentId);
    const matchesIncubated =
      filters.value.incubated === "" ||
      String(Boolean(project.incubated)) === filters.value.incubated;

    return matchesSearch && matchesDepartment && matchesIncubated;
  });
});

const projectStats = computed(() => {
  const total = projects.value.length;
  const incubated = projects.value.filter((p) => Boolean(p.incubated)).length;
  const avgProgress = total
    ? Math.round(
        projects.value.reduce((sum, p) => sum + Number(p.progress_percent || 0), 0) / total
      )
    : 0;
  return { total, incubated, avgProgress };
});

const fetchProjects = async () => {
  loading.value = true;
  error.value = "";
  try {
    const response = await api.get("/projects");
    if (response.data.success) {
      projects.value = response.data.data || [];
    } else {
      projects.value = [];
    }
  } catch (err) {
    console.error("Error fetching projects:", err);
    error.value = err.response?.data?.message || "Failed to load projects.";
  } finally {
    loading.value = false;
  }
};

const fetchFormData = async () => {
  try {
    const [departmentsRes, preRes, accRes] = await Promise.all([
      api.get("/departments"),
      api.get("/pre-incubation-statuses"),
      api.get("/acceleration-statuses"),
    ]);

    departments.value = Array.isArray(departmentsRes.data)
      ? departmentsRes.data
      : departmentsRes.data?.data || [];

    preIncubationStatuses.value = preRes.data?.data || preRes.data || [];
    accelerationStatuses.value = accRes.data?.data || accRes.data || [];
  } catch (err) {
    console.error("Error loading form metadata:", err);
  }
};

const resetForm = () => {
  formData.value = {
    title: "",
    project_code: "",
    finalpv: "",
    departement_id: "",
    pre_incubation_status: "",
    acceleration_status: "",
    progress_percent: 0,
    incubated: false,
  };
};

const openCreateModal = () => {
  isEditMode.value = false;
  selectedProject.value = null;
  resetForm();
  showModal.value = true;
};

const openEditModal = (project) => {
  isEditMode.value = true;
  selectedProject.value = project;
  formData.value = {
    title: project.title || "",
    project_code: project.project_code || "",
    finalpv: project.finalpv || "",
    departement_id: project.departement_id || "",
    pre_incubation_status: project.pre_incubation_status || "",
    acceleration_status: project.acceleration_status || "",
    progress_percent: project.progress_percent ?? 0,
    incubated: Boolean(project.incubated),
  };
  showModal.value = true;
};

const saveProject = async () => {
  if (!formData.value.title || formData.value.title.trim().length < 5) {
    error.value = "Project title must be at least 5 characters.";
    return;
  }
  if (!formData.value.departement_id) {
    error.value = "Department is required.";
    return;
  }

  saving.value = true;
  error.value = "";

  try {
    const payload = {
      title: formData.value.title,
      project_code: formData.value.project_code || null,
      finalpv: formData.value.finalpv || null,
      departement_id: Number(formData.value.departement_id),
      pre_incubation_status: formData.value.pre_incubation_status
        ? Number(formData.value.pre_incubation_status)
        : null,
      acceleration_status: formData.value.acceleration_status
        ? Number(formData.value.acceleration_status)
        : null,
      progress_percent: Number(formData.value.progress_percent || 0),
      incubated: Boolean(formData.value.incubated),
    };

    if (isEditMode.value) {
      await api.put(`/projects/${selectedProject.value.id}`, payload);
      successMessage.value = "Project updated successfully.";
    } else {
      await api.post("/projects", payload);
      successMessage.value = "Project created successfully.";
    }

    showModal.value = false;
    await fetchProjects();
    setTimeout(() => (successMessage.value = ""), 3000);
  } catch (err) {
    console.error("Error saving project:", err);
    error.value = err.response?.data?.message || "Failed to save project.";
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (project) => {
  projectToDelete.value = project;
  showDeleteModal.value = true;
};

const deleteProject = async () => {
  if (!projectToDelete.value) return;

  deleting.value = true;
  error.value = "";
  try {
    await api.delete(`/projects/${projectToDelete.value.id}`);
    successMessage.value = "Project deleted successfully.";
    showDeleteModal.value = false;
    projectToDelete.value = null;
    await fetchProjects();
    setTimeout(() => (successMessage.value = ""), 3000);
  } catch (err) {
    console.error("Error deleting project:", err);
    error.value = err.response?.data?.message || "Failed to delete project.";
    showDeleteModal.value = false;
  } finally {
    deleting.value = false;
  }
};

const getDepartmentName = (project) => {
  const dep = departments.value.find((d) => d.id === project.departement_id);
  return dep?.departement_name_en || dep?.departement_name || `#${project.departement_id}`;
};

onMounted(async () => {
  await Promise.all([fetchProjects(), fetchFormData()]);
});
</script>

<template>
  <div class="projects-management">
    <div class="header">
      <div>
        <h1>Projects Management</h1>
        <p>Manage all incubator projects as Super Admin</p>
      </div>
      <div class="actions">
        <button class="btn-secondary" @click="router.push('/dashboard')">Back</button>
        <button class="btn-primary" @click="openCreateModal">+ New Project</button>
      </div>
    </div>

    <div v-if="error" class="alert error">{{ error }}</div>
    <div v-if="successMessage" class="alert success">{{ successMessage }}</div>

    <div class="stats">
      <div class="stat">
        <span>Total</span>
        <strong>{{ projectStats.total }}</strong>
      </div>
      <div class="stat">
        <span>Incubated</span>
        <strong>{{ projectStats.incubated }}</strong>
      </div>
      <div class="stat">
        <span>Avg Progress</span>
        <strong>{{ projectStats.avgProgress }}%</strong>
      </div>
    </div>

    <div class="filters">
      <input v-model="filters.search" placeholder="Search by title or code" aria-label="Search projects" />
      <select v-model="filters.departmentId">
        <option value="">All Departments</option>
        <option v-for="department in departments" :key="department.id" :value="department.id">
          {{ department.departement_name_en || department.departement_name }}
        </option>
      </select>
      <select v-model="filters.incubated">
        <option value="">All</option>
        <option value="true">Incubated</option>
        <option value="false">Not Incubated</option>
      </select>
    </div>

    <div v-if="loading" class="loading">Loading projects...</div>

    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Code</th>
            <th>Department</th>
            <th>Progress</th>
            <th>Incubated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="project in filteredProjects" :key="project.id">
            <td>{{ project.id }}</td>
            <td>{{ project.title }}</td>
            <td>{{ project.project_code || 'N/A' }}</td>
            <td>{{ getDepartmentName(project) }}</td>
            <td>
              <div class="progress-cell">
                <div class="progress-track">
                  <span :style="{ width: `${project.progress_percent ?? 0}%` }"></span>
                </div>
                <small>{{ project.progress_percent ?? 0 }}%</small>
              </div>
            </td>
            <td><span class="badge" :class="project.incubated ? 'ok' : 'muted'">{{ project.incubated ? 'Yes' : 'No' }}</span></td>
            <td class="row-actions">
              <button class="mini" @click="openEditModal(project)">Edit</button>
              <button class="mini danger" @click="confirmDelete(project)">Delete</button>
            </td>
          </tr>
          <tr v-if="filteredProjects.length === 0">
            <td colspan="7" class="empty">No projects found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="modal-overlay" @click="showModal = false">
      <div class="modal" @click.stop>
        <h3>{{ isEditMode ? 'Edit Project' : 'Create Project' }}</h3>

        <label>Title</label>
        <input v-model="formData.title" maxlength="250" />

        <label>Project Code</label>
        <input v-model="formData.project_code" />

        <label>Final PV</label>
        <input v-model="formData.finalpv" />

        <label>Department</label>
        <select v-model="formData.departement_id">
          <option value="">Select department</option>
          <option v-for="department in departments" :key="department.id" :value="department.id">
            {{ department.departement_name_en || department.departement_name }}
          </option>
        </select>

        <label>Pre-Incubation Status</label>
        <select v-model="formData.pre_incubation_status">
          <option value="">None</option>
          <option v-for="status in preIncubationStatuses" :key="status.id" :value="status.id">
            {{ status.status_name }}
          </option>
        </select>

        <label>Acceleration Status</label>
        <select v-model="formData.acceleration_status">
          <option value="">None</option>
          <option v-for="status in accelerationStatuses" :key="status.id" :value="status.id">
            {{ status.acceleration_name }}
          </option>
        </select>

        <label>Progress (%)</label>
        <input v-model.number="formData.progress_percent" type="number" min="0" max="100" />

        <label class="checkbox">
          <input v-model="formData.incubated" type="checkbox" /> Incubated
        </label>

        <div class="modal-actions">
          <button class="btn-secondary" :disabled="saving" @click="showModal = false">Cancel</button>
          <button class="btn-primary" :disabled="saving" @click="saveProject">
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal" @click.stop>
        <h3>Delete Project</h3>
        <p>Are you sure you want to delete <strong>{{ projectToDelete?.title }}</strong>?</p>
        <div class="modal-actions">
          <button class="btn-secondary" :disabled="deleting" @click="showDeleteModal = false">Cancel</button>
          <button class="btn-danger" :disabled="deleting" @click="deleteProject">
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.projects-management { padding: 24px; background: linear-gradient(180deg, #f8fbff 0%, #f6f9f7 100%); min-height: 100vh; }
.header { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 16px; align-items: end; }
.actions { display: flex; gap: 10px; align-items: center; }
.alert { padding: 10px 14px; border-radius: 8px; margin-bottom: 12px; }
.alert.error { background: #fdecec; color: #b42318; }
.alert.success { background: #edfdf3; color: #027a48; }
.stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-bottom: 12px; }
.stat { background: #fff; border: 1px solid #e7eefb; border-radius: 12px; padding: 12px; display: grid; gap: 4px; }
.stat span { color: #667085; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; }
.stat strong { color: #101828; font-size: 22px; }
.filters { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 10px; margin-bottom: 14px; }
input, select { width: 100%; padding: 10px; border: 1px solid #d0d5dd; border-radius: 8px; background: #fff; }
input:focus, select:focus { outline: none; border-color: #0c7a43; box-shadow: 0 0 0 3px rgba(12, 122, 67, 0.15); }
.table-wrap { background: #fff; border: 1px solid #eaecf0; border-radius: 12px; overflow: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 12px; border-bottom: 1px solid #f2f4f7; text-align: left; vertical-align: middle; }
th { font-size: 12px; color: #475467; letter-spacing: .04em; text-transform: uppercase; }
.row-actions { display: flex; gap: 8px; }
.empty { text-align: center; color: #667085; }
.btn-primary, .btn-secondary, .btn-danger, .mini { border: none; border-radius: 8px; padding: 9px 12px; cursor: pointer; transition: .2s ease; }
.btn-primary { background: #0c7a43; color: #fff; }
.btn-secondary { background: #f2f4f7; color: #101828; }
.btn-danger, .mini.danger { background: #d92d20; color: #fff; }
.mini { background: #344054; color: #fff; padding: 6px 10px; }
.btn-primary:hover, .btn-secondary:hover, .btn-danger:hover, .mini:hover { transform: translateY(-1px); }
.btn-primary:disabled, .btn-secondary:disabled, .btn-danger:disabled, .mini:disabled { opacity: .65; cursor: not-allowed; transform: none; }
.loading { padding: 20px; background: #fff; border-radius: 10px; border: 1px solid #eaecf0; color: #475467; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: grid; place-items: center; padding: 16px; z-index: 1000; }
.modal { width: min(640px, 100%); background: #fff; border-radius: 12px; padding: 18px; display: grid; gap: 8px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
.checkbox { display: flex; align-items: center; gap: 8px; }
.progress-cell { display: grid; gap: 4px; min-width: 120px; }
.progress-track { height: 8px; border-radius: 999px; background: #eef2f7; overflow: hidden; }
.progress-track span { display: block; height: 100%; background: linear-gradient(90deg, #0c7a43, #2da562); }
.badge { display: inline-flex; padding: 4px 8px; border-radius: 999px; font-size: 12px; font-weight: 600; }
.badge.ok { background: #e8f8ee; color: #0c7a43; }
.badge.muted { background: #f2f4f7; color: #344054; }
@media (max-width: 900px) { .filters { grid-template-columns: 1fr; } .header { flex-direction: column; align-items: flex-start; } .stats { grid-template-columns: 1fr; } }
</style>
