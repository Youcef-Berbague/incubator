import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/useAuthStore";
import { ROLES, getHighestRole } from "../config/roles";
import Home from "../views/Home.vue";
import Register from "../views/Register.vue";
import Login from "../views/Login.vue";
import Dashboard from "../views/Dashboard.vue";
import RegistrationSuccess from "../views/RegistrationSuccess.vue";
import RegistrationsManagement from "../components/dashboards/RegistrationsManagement.vue";
import UsersManagement from "../components/dashboards/UsersManagement.vue";
import FacultiesManagement from "../components/dashboards/FacultiesManagement.vue";
import MyAccountSettings from "../components/dashboards/MyAccountSettings.vue";
import FAQManagement from "../components/dashboards/FAQManagement.vue";
import AccelerationStatusManagement from "../components/dashboards/AccelerationStatusManagement.vue";
import LocationsManagement from "../components/dashboards/LocationsManagement.vue";
import PartnersManagement from "../components/dashboards/PartnersManagement.vue";
import PreIncubationStatusManagement from "../components/dashboards/PreIncubationStatusManagement.vue";
import JuryMemberRolesManagement from "../components/dashboards/JuryMemberRolesManagement.vue";
import JuriesManagement from "../components/dashboards/JuriesManagement.vue";

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
  {
    path: "/dashboard/faqs",
    name: "FAQManagement",
    component: FAQManagement,
    meta: { requiresAuth: true, requiresSuperAdmin: true },
  },
  {
    path: "/dashboard/acceleration-statuses",
    name: "AccelerationStatusManagement",
    component: AccelerationStatusManagement,
    meta: { requiresAuth: true, requiresSuperAdmin: true },
  },
  {
    path: "/dashboard/locations",
    name: "LocationsManagement",
    component: LocationsManagement,
    meta: { requiresAuth: true, requiresSuperAdmin: true },
  },
  {
    path: "/dashboard/partners",
    name: "PartnersManagement",
    component: PartnersManagement,
    meta: { requiresAuth: true, requiresSuperAdmin: true },
  },
  {
    path: "/dashboard/pre-incubation-statuses",
    name: "PreIncubationStatusManagement",
    component: PreIncubationStatusManagement,
    meta: { requiresAuth: true, requiresSuperAdmin: true },
  },
  {
    path: "/dashboard/jury-member-roles",
    name: "JuryMemberRolesManagement",
    component: JuryMemberRolesManagement,
    meta: { requiresAuth: true, requiresSuperAdmin: true },
  },
  {
    path: "/dashboard/juries",
    name: "JuriesManagement",
    component: JuriesManagement,
    meta: { requiresAuth: true, requiresSuperAdmin: true },
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
        const isSuperAdmin = userRole.includes(ROLES.superAdmin);

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
        const isAdmin = getHighestRole(userRole) >= ROLES.admin;

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
