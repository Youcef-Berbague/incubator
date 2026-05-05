<script setup>
import { computed } from "vue";
import { useAuthStore } from "../../stores/useAuthStore";

const authStore = useAuthStore();

const userName = computed(() => authStore.userName || "Student");
const hasProject = computed(() => authStore.hasProject === true);
</script>

<template>
  <section class="student-dashboard">
    <div class="card">
      <p class="eyebrow">Student Dashboard</p>
      <h1>Welcome, {{ userName }}</h1>
      <p v-if="hasProject">
        Your project registration is active. You can review your profile and
        project details from your account pages.
      </p>
      <p v-else>
        Your dashboard is ready, but no registered project was found yet.
      </p>
    </div>
  </section>
</template>

<style scoped>
.student-dashboard {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
  background: linear-gradient(180deg, #f6fbf7 0%, #eef8ef 100%);
}

.card {
  width: min(720px, 100%);
  padding: 2rem;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid #e6efe7;
  box-shadow: 0 18px 48px rgba(36, 79, 45, 0.08);
}

.eyebrow {
  margin: 0 0 0.5rem;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #2d7a46;
}

h1 {
  margin: 0 0 0.75rem;
  font-size: 2rem;
  color: #10301b;
}

p {
  margin: 0;
  color: #516055;
  line-height: 1.7;
}
</style>
