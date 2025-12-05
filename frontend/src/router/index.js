import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/useAuthStore";
import Home from "../views/Home.vue";
import Register from "../views/Register.vue";
import Login from "../views/Login.vue";
import Dashboard from "../views/Dashboard.vue";
import RegistrationSuccess from "../views/RegistrationSuccess.vue";
import RegistrationsManagement from "../components/dashboards/RegistrationsManagement.vue";
import UsersManagement from "../components/dashboards/UsersManagement.vue";
import FacultiesManagement from "../components/dashboards/FacultiesManagement.vue";
import MyAccountSettings from "../components/dashboards/MyAccountSettings.vue";

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
    path: "/registration-success",
    name: "RegistrationSuccess",
    component: RegistrationSuccess,
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
  {
    path: "/dashboard/registrations",
    name: "RegistrationsManagement",
    component: RegistrationsManagement,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/dashboard/users",
    name: "UsersManagement",
    component: UsersManagement,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/dashboard/faculties",
    name: "FacultiesManagement",
    component: FacultiesManagement,
    meta: { requiresAuth: true, requiresSuperAdmin: true },
  },
  {
    path: "/dashboard/account",
    name: "MyAccountSettings",
    component: MyAccountSettings,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard for authentication
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Wait for auth store to initialize/check authentication status
  if (!authStore.isInitialized) {
    await authStore.checkAuth();
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // Redirect to login if not authenticated
      next({ name: "Login", query: { redirect: to.fullPath } });
    } else {
      // Check if route requires super admin role
      if (to.meta.requiresSuperAdmin) {
        const userRole = authStore.user?.role || [];
        const isSuperAdmin = userRole.includes(100); // SuperAdmin only

        if (!isSuperAdmin) {
          // Redirect to dashboard if not super admin
          next({ name: "Dashboard" });
        } else {
          next();
        }
      }
      // Check if route requires admin role
      else if (to.meta.requiresAdmin) {
        const userRole = authStore.user?.role || [];
        const isAdmin = userRole.includes(90) || userRole.includes(100); // Admin or SuperAdmin

        if (!isAdmin) {
          // Redirect to dashboard if not admin
          next({ name: "Dashboard" });
        } else {
          next();
        }
      } else {
        next();
      }
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
