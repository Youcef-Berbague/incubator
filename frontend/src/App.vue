<script setup>
import { onMounted } from "vue";
import { useAuthStore } from "./stores/useAuthStore";
import AiChat from "./components/AiChat.vue";

const authStore = useAuthStore();

// Check authentication status when app loads
onMounted(async () => {
  await authStore.checkAuth();
});
</script>

<template>
  <router-view />
  <AiChat />
</template>

<style></style>
