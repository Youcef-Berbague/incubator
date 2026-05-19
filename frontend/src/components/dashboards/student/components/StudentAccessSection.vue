<script setup>
const props = defineProps({
  roleSnapshot: { type: Object, default: null },
  currentRoleLabel: { type: String, default: "Student" },
  currentRoleValue: { type: Number, default: 0 },
  sectionId: { type: String, default: "access-section" },
});

const formatYesNo = (value) => (value ? "Yes" : "No");
</script>

<template>
  <section :id="sectionId" class="section-card">
    <div class="section-header">
      <div>
        <h2>Access Snapshot</h2>
        <p>Backend role capabilities</p>
      </div>
    </div>

    <div class="registrations-table">
      <table>
        <thead>
          <tr>
            <th>Capability</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Can self-serve</td>
            <td>
              <span class="badge badge-info">{{
                formatYesNo(roleSnapshot?.canSelfServe)
              }}</span>
            </td>
          </tr>
          <tr>
            <td>Can manage projects</td>
            <td>
              <span class="badge badge-info">{{
                formatYesNo(roleSnapshot?.canManageProjects)
              }}</span>
            </td>
          </tr>
          <tr>
            <td>Role label</td>
            <td>{{ roleSnapshot?.role || currentRoleLabel }}</td>
          </tr>
          <tr>
            <td>Role value</td>
            <td>{{ currentRoleValue }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
