<script setup>
import { onMounted } from "vue";
import { useAuthStore } from "./stores/useAuthStore";

const authStore = useAuthStore();

// Check authentication status when app loads
onMounted(async () => {
  await authStore.checkAuth();
});
</script>

<template>
  <router-view />
</template>

<style></style>
