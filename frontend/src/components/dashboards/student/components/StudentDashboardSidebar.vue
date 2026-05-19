<script setup>
const props = defineProps({
  projectCount: { type: Number, default: 0 },
  hasRegistration: { type: Boolean, default: false },
  registrationStatusLabel: { type: String, default: "No registration" },
});

const emit = defineEmits(["scroll", "account", "home", "refresh", "register"]);

const goSection = (sectionId) => {
  emit("scroll", sectionId);
};
</script>

<template>
  <aside class="dashboard-sidebar">
    <div class="sidebar-header">
      <h3>Quick Actions</h3>
      <p>Student tools</p>
    </div>

    <nav class="sidebar-nav">
      <button class="sidebar-item" @click="goSection('projects-section')">
        <div class="sidebar-icon">📁</div>
        <div class="sidebar-content">
          <h4>Projects</h4>
          <p>
            {{ projectCount }} linked project{{ projectCount === 1 ? "" : "s" }}
          </p>
        </div>
      </button>

      <button class="sidebar-item" @click="goSection('registration-section')">
        <div class="sidebar-icon">📝</div>
        <div class="sidebar-content">
          <h4>Registration</h4>
          <p>{{ registrationStatusLabel }}</p>
        </div>
      </button>

      <button class="sidebar-item" @click="emit('register')">
        <div class="sidebar-icon">🧾</div>
        <div class="sidebar-content">
          <h4>Register Project</h4>
          <p>Submit or update</p>
        </div>
      </button>

      <button class="sidebar-item" @click="goSection('profile-section')">
        <div class="sidebar-icon">👤</div>
        <div class="sidebar-content">
          <h4>Profile</h4>
          <p>Account snapshot</p>
        </div>
      </button>

      <div class="sidebar-divider"></div>
      <div class="sidebar-section-title">Account</div>

      <button class="sidebar-item" @click="emit('account')">
        <div class="sidebar-icon">⚙️</div>
        <div class="sidebar-content">
          <h4>My Account</h4>
          <p>Update settings</p>
        </div>
      </button>

      <button class="sidebar-item" @click="emit('refresh')">
        <div class="sidebar-icon">🔄</div>
        <div class="sidebar-content">
          <h4>Refresh</h4>
          <p>Sync latest data</p>
        </div>
      </button>

      <button class="sidebar-item" @click="emit('home')">
        <div class="sidebar-icon">🏠</div>
        <div class="sidebar-content">
          <h4>Home</h4>
          <p>Return to website</p>
        </div>
      </button>
    </nav>
  </aside>
</template>
