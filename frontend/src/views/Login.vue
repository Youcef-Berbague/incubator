<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/useAuthStore";

const router = useRouter();
const authStore = useAuthStore();

// Form data
const email = ref("");
const password = ref("");
const rememberMe = ref(false);

// UI state
const showPassword = ref(false);
const isSubmitting = ref(false);

// Toggle password visibility
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

// Form submission
const handleLogin = async () => {
  // Clear previous errors
  authStore.error = null;

  // Validate inputs
  if (!email.value.trim() || !password.value.trim()) {
    authStore.error = "Email and password are required.";
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    authStore.error = "Please enter a valid email address.";
    return;
  }

  isSubmitting.value = true;

  try {
    await authStore.login(email.value, password.value, rememberMe.value);

    if (authStore.isAuthenticated) {
      // Check if there's a redirect query parameter
      const redirectPath =
        router.currentRoute.value.query.redirect || "/dashboard";
      router.push(redirectPath);
    }
  } catch (error) {
    console.error("Login error:", error);
  } finally {
    isSubmitting.value = false;
  }
};

const navigateHome = () => {
  router.push("/");
};

const navigateToRegister = () => {
  router.push("/register");
};
</script>

<template>
  <div class="login-page">
    <!-- Navigation -->
    <nav class="navbar">
      <div class="container">
        <div class="logo" @click="navigateHome">
          <span class="logo-text">Badji Mokhtar University</span>
          <span class="logo-sub">Innovation Incubator</span>
        </div>
        <ul class="nav-links">
          <li><router-link to="/">Home</router-link></li>
          <li><router-link to="/register">Register Project</router-link></li>
        </ul>
      </div>
    </nav>

    <!-- Login Section -->
    <div class="login-section">
      <div class="container">
        <div class="login-wrapper">
          <div class="login-card">
            <div class="login-header">
              <h1>Welcome Back</h1>
              <p>Sign in to access your incubator dashboard</p>
            </div>

            <!-- Error Message -->
            <div v-if="authStore.error" class="error-message">
              {{ authStore.error }}
            </div>

            <form @submit.prevent="handleLogin" class="login-form">
              <!-- Email Input -->
              <div class="input-group">
                <label for="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  v-model="email"
                  placeholder="your.email@example.com"
                  autocomplete="email"
                  required
                  :disabled="isSubmitting"
                />
              </div>

              <!-- Password Input -->
              <div class="input-group">
                <label for="password">Password</label>
                <div class="password-input-wrapper">
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    id="password"
                    v-model="password"
                    placeholder="Enter your password"
                    autocomplete="current-password"
                    required
                    :disabled="isSubmitting"
                  />
                  <button
                    type="button"
                    class="toggle-password"
                    @click="togglePasswordVisibility"
                    :disabled="isSubmitting"
                    tabindex="-1"
                  >
                    <span v-if="!showPassword">👁️</span>
                    <span v-else>🙈</span>
                  </button>
                </div>
              </div>

              <!-- Remember Me Checkbox -->
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    v-model="rememberMe"
                    :disabled="isSubmitting"
                  />
                  <span class="checkbox-text">Remember me for 30 days</span>
                </label>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                class="btn-login"
                :disabled="isSubmitting || authStore.isLoading"
              >
                <span v-if="isSubmitting || authStore.isLoading">
                  Signing in...
                </span>
                <span v-else>Sign In</span>
              </button>

              <!-- Register Link -->
              <div class="form-footer">
                <p>Don't have an account?</p>
                <button
                  type="button"
                  class="link-button"
                  @click="navigateToRegister"
                  :disabled="isSubmitting"
                >
                  Create an account
                </button>
              </div>
            </form>
          </div>

          <!-- Side Info -->
          <div class="side-info">
            <div class="info-content">
              <h2>Join Our Innovation Community</h2>
              <p>
                Access exclusive resources, connect with mentors, and bring your
                innovative ideas to life at Badji Mokhtar University's
                Innovation Incubator.
              </p>
              <div class="features">
                <div class="feature-item">
                  <span class="feature-icon">✨</span>
                  <span>Project Management Tools</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">🤝</span>
                  <span>Expert Mentorship</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">🚀</span>
                  <span>Funding Opportunities</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-page {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
}

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 30px;
  width: 100%;
}

/* Navigation */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 20px 0;
  z-index: 1000;
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.5px;
}

.logo-sub {
  font-size: 12px;
  font-weight: 500;
  color: #666;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 35px;
  align-items: center;
}

.nav-links a {
  text-decoration: none;
  color: #1a1a1a;
  font-weight: 500;
  font-size: 15px;
  transition: color 0.3s ease;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: #0066ff;
}

/* Login Section */
.login-section {
  padding: 120px 0 80px;
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.login-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  max-width: 1000px;
  margin: 0 auto;
}

/* Login Card */
.login-card {
  background: white;
  border-radius: 16px;
  padding: 50px 45px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
}

.login-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: #0066ff;
}

.login-header {
  text-align: center;
  margin-bottom: 35px;
}

.login-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 10px;
  letter-spacing: -0.5px;
}

.login-header p {
  font-size: 15px;
  color: #666;
  line-height: 1.5;
}

/* Error Message */
.error-message {
  background: #fff5f5;
  border: 2px solid #ffcccc;
  border-left: 4px solid #ff4444;
  color: #cc0000;
  padding: 14px 18px;
  border-radius: 8px;
  margin-bottom: 25px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(255, 68, 68, 0.1);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Form Styles */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: 0.2px;
}

.input-group input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e6edff;
  border-radius: 8px;
  font-size: 15px;
  font-family: inherit;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  color: #1a1a1a;
}

.input-group input:focus {
  outline: none;
  border-color: #0066ff;
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
  transform: translateY(-1px);
}

.input-group input::placeholder {
  color: #999;
}

.input-group input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Password Input Wrapper */
.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrapper input {
  padding-right: 50px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.toggle-password:hover {
  transform: scale(1.1);
}

.toggle-password:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Checkbox Group */
.checkbox-group {
  margin: 5px 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #0066ff;
}

.checkbox-label input[type="checkbox"]:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.checkbox-text {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

/* Login Button */
.btn-login {
  width: 100%;
  padding: 16px 32px;
  background: #0066ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
  margin-top: 10px;
  box-shadow: 0 4px 14px rgba(0, 102, 255, 0.25);
  position: relative;
  overflow: hidden;
}

.btn-login::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn-login:hover:not(:disabled)::before {
  width: 300px;
  height: 300px;
}

.btn-login:hover:not(:disabled) {
  background: #0052cc;
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(0, 102, 255, 0.4);
}

.btn-login:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 6px 20px rgba(0, 102, 255, 0.3);
}

.btn-login:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

/* Form Footer */
.form-footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #f0f0f0;
}

.form-footer p {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.link-button {
  background: none;
  border: none;
  color: #0066ff;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}

.link-button:hover:not(:disabled) {
  color: #0052cc;
  text-decoration-thickness: 3px;
}

.link-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Side Info */
.side-info {
  background: #0066ff;
  border-radius: 16px;
  padding: 50px 40px;
  color: white;
  position: relative;
  overflow: hidden;
}

.side-info::before {
  content: "";
  position: absolute;
  top: -100px;
  right: -100px;
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.info-content {
  position: relative;
  z-index: 1;
}

.info-content h2 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 15px;
  line-height: 1.3;
  letter-spacing: -0.5px;
}

.info-content p {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 30px;
  opacity: 0.95;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 15px;
  font-weight: 500;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(5px);
}

.feature-icon {
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}

/* Responsive */
@media (max-width: 968px) {
  .login-wrapper {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .side-info {
    order: -1;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 20px;
  }

  .nav-links {
    display: none;
  }

  .login-section {
    padding: 100px 0 60px;
  }

  .login-card {
    padding: 40px 30px;
  }

  .login-header h1 {
    font-size: 28px;
  }

  .side-info {
    padding: 40px 30px;
  }

  .info-content h2 {
    font-size: 24px;
  }

  .info-content p {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 30px 20px;
  }

  .login-header h1 {
    font-size: 24px;
  }

  .login-header p {
    font-size: 14px;
  }

  .btn-login {
    padding: 14px 28px;
    font-size: 15px;
  }

  .side-info {
    padding: 30px 20px;
  }

  .info-content h2 {
    font-size: 22px;
  }

  .feature-item {
    font-size: 14px;
    padding: 10px;
  }

  .feature-icon {
    width: 36px;
    height: 36px;
    font-size: 20px;
  }
}
</style>
