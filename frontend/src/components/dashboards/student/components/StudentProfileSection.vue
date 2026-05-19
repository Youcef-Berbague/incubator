<script setup>
const props = defineProps({
  userName: { type: String, default: "Student" },
  userEmail: { type: String, default: "N/A" },
  currentRoleLabel: { type: String, default: "Student" },
  projectCount: { type: Number, default: 0 },
  sectionId: { type: String, default: "profile-section" },
});

const emit = defineEmits(["account"]);
</script>

<template>
  <section :id="sectionId" class="section-card">
    <div class="section-header">
      <div>
        <h2>Profile Summary</h2>
        <p>Account overview</p>
      </div>
      <button class="btn-view-all" @click="emit('account')">
        Account Settings
      </button>
    </div>

    <div class="registrations-table">
      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Name</td>
            <td>{{ userName }}</td>
          </tr>
          <tr>
            <td>Email</td>
            <td>{{ userEmail }}</td>
          </tr>
          <tr>
            <td>Role</td>
            <td>{{ currentRoleLabel }}</td>
          </tr>
          <tr>
            <td>Linked projects</td>
            <td>{{ projectCount }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
