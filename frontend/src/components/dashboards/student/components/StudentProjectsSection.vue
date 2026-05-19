<script setup>
const props = defineProps({
  projects: { type: Array, default: () => [] },
  sectionId: { type: String, default: "projects-section" },
});

const emit = defineEmits(["viewAll"]);

const getProgressLabel = (progress) => {
  const value = Math.min(Number(progress || 0), 100);
  return `${value}%`;
};

const getStatusLabel = (project) =>
  project?.incubated ? "Incubated" : "In progress";

const getStatusColor = (project) =>
  project?.incubated ? "#4caf50" : "#2196f3";
</script>

<template>
  <section :id="sectionId" class="section-card">
    <div class="section-header">
      <div>
        <h2>My Projects</h2>
        <p>Projects linked to your student profile</p>
      </div>
      <button class="btn-view-all" @click="emit('viewAll')">View All</button>
    </div>

    <div v-if="projects.length === 0" class="empty-state">
      <span class="empty-icon">📭</span>
      <p>No linked projects yet</p>
    </div>

    <div v-else class="registrations-table">
      <table>
        <thead>
          <tr>
            <th>Project</th>
            <th>Faculty</th>
            <th>Department</th>
            <th>Progress</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="project in projects" :key="project.id">
            <td>
              <div class="project-title">
                {{ project.title }}
                <span v-if="project.code && project.code !== 'N/A'">
                  ({{ project.code }})
                </span>
              </div>
            </td>
            <td>{{ project.facultyName || "N/A" }}</td>
            <td>{{ project.departmentName || "N/A" }}</td>
            <td>
              <span class="badge badge-info">{{
                getProgressLabel(project.progress)
              }}</span>
            </td>
            <td>
              <span
                class="status-badge"
                :style="{ background: getStatusColor(project) }"
              >
                {{ getStatusLabel(project) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
