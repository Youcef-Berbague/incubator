<script setup>
const props = defineProps({
  summary: { type: Object, required: true },
  registrationStatusLabel: { type: String, default: "No registration" },
  currentRoleLabel: { type: String, default: "Student" },
});
</script>

<template>
  <section class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon" style="background: #e3f2fd">
        <span style="color: #2196f3">📁</span>
      </div>
      <div class="stat-content">
        <h3>Linked Projects</h3>
        <p class="stat-number">{{ summary.projectCount }}</p>
        <span class="stat-label">Projects tied to your account</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon" style="background: #fff3e0">
        <span style="color: #ff9800">📝</span>
      </div>
      <div class="stat-content">
        <h3>Registration Status</h3>
        <p class="stat-number">{{ registrationStatusLabel }}</p>
        <span class="stat-label">Latest submission</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon" style="background: #e8f5e9">
        <span style="color: #4caf50">🔐</span>
      </div>
      <div class="stat-content">
        <h3>Self Service</h3>
        <p class="stat-number">
          {{ summary.canSelfServe ? "Enabled" : "Limited" }}
        </p>
        <span class="stat-label">Student access status</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon" style="background: #f3e5f5">
        <span style="color: #9c27b0">🎓</span>
      </div>
      <div class="stat-content">
        <h3>Role Snapshot</h3>
        <p class="stat-number">{{ currentRoleLabel }}</p>
        <span class="stat-label">Current role level</span>
      </div>
    </div>
  </section>
</template>
