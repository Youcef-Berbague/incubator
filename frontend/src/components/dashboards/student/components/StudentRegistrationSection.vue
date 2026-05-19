<script setup>
const props = defineProps({
  registration: { type: Object, default: null },
  registrationStatusLabel: { type: String, default: "No registration" },
  sectionId: { type: String, default: "registration-section" },
  formatDateTime: { type: Function, required: true },
});

const emit = defineEmits(["action"]);

const statusColors = {
  pending: "#ff9800",
  in_review: "#2196f3",
  approved: "#4caf50",
  rejected: "#f44336",
  revision_required: "#ff5722",
  withdrawn: "#9e9e9e",
};

const getStatusColor = (status) => statusColors[status] || "#666";
</script>

<template>
  <section :id="sectionId" class="section-card">
    <div class="section-header">
      <div>
        <h2>Latest Registration</h2>
        <p>Your most recent project submission</p>
      </div>
      <button class="btn-view-all" @click="emit('action')">Refresh</button>
    </div>

    <div v-if="!registration" class="empty-state">
      <span class="empty-icon">--</span>
      <p>No registration found</p>
    </div>

    <div v-else class="registrations-table">
      <table>
        <thead>
          <tr>
            <th>Project Title</th>
            <th>Faculty</th>
            <th>Department</th>
            <th>Status</th>
            <th>Submitted</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="project-title">{{ registration.title }}</div>
            </td>
            <td>{{ registration.facultyName || "N/A" }}</td>
            <td>{{ registration.departmentName || "N/A" }}</td>
            <td>
              <span
                class="status-badge"
                :style="{ background: getStatusColor(registration.status) }"
              >
                {{ registrationStatusLabel }}
              </span>
            </td>
            <td>
              <span class="date-text">{{
                formatDateTime(registration.submittedAt)
              }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
