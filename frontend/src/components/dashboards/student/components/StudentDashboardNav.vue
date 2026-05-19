<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  userName: { type: String, default: "Student" },
  userEmail: { type: String, default: "N/A" },
  roleLabel: { type: String, default: "Student" },
});

const emit = defineEmits(["home", "account", "logout"]);

const showUserMenu = ref(false);
const userInitial = computed(() =>
  (props.userName?.charAt(0) || "U").toUpperCase(),
);

const handleHome = () => {
  emit("home");
  showUserMenu.value = false;
};

const handleAccount = () => {
  emit("account");
  showUserMenu.value = false;
};

const handleLogout = () => {
  emit("logout");
  showUserMenu.value = false;
};
</script>

<template>
  <nav class="dashboard-navbar">
    <div class="container">
      <div class="logo" @click="handleHome">
        <img
          src="/incubator_logo.png"
          alt="Badji Mokhtar University Incubator"
          class="logo-img"
        />
        <div class="logo-text-container">
          <span class="logo-text">Badji Mokhtar University</span>
          <span class="logo-sub">Student Panel</span>
        </div>
      </div>

      <div class="nav-right">
        <div class="user-menu-wrapper">
          <button class="user-menu-btn" @click="showUserMenu = !showUserMenu">
            <span class="user-avatar">{{ userInitial }}</span>
            <span class="user-name">{{ userName }}</span>
            <span class="dropdown-arrow">▼</span>
          </button>

          <div v-if="showUserMenu" class="user-dropdown">
            <div class="user-info">
              <p class="user-full-name">{{ userName }}</p>
              <p class="user-email">{{ userEmail }}</p>
              <p class="user-role">{{ roleLabel }}</p>
            </div>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" @click="handleAccount">
              My Account Settings
            </button>
            <button class="dropdown-item" @click="handleHome">
              View Website
            </button>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item logout-btn" @click="handleLogout">
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
