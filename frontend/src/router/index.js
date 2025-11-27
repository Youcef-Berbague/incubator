import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/useAuthStore";
import Home from "../views/Home.vue";
import Register from "../views/Register.vue";
import Login from "../views/Login.vue";
import Dashboard from "../views/Dashboard.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { requiresGuest: true },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // Redirect to login if not authenticated
      next({ name: "Login", query: { redirect: to.fullPath } });
    } else {
      next();
    }
  }
  // Check if route is for guests only (login page)
  else if (to.meta.requiresGuest) {
    if (authStore.isAuthenticated) {
      // Redirect to dashboard if already authenticated
      next({ name: "Dashboard" });
    } else {
      next();
    }
  }
  // Public routes
  else {
    next();
  }
});

export default router;
