<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/useAuthStore";

const router = useRouter();
const authStore = useAuthStore();
const showMenu = ref(false);
const showUserMenu = ref(false);

const navigateToRegister = () => {
  router.push("/register");
};

const navigateToLogin = () => {
  router.push("/login");
};

const handleLogout = async () => {
  await authStore.logout();
  showUserMenu.value = false;
  router.push("/");
};

// Counter animation
const counters = ref({
  projects: 0,
  startups: 0,
  entrepreneurs: 0,
  funding: 0,
});

const animateCounters = () => {
  const targets = {
    projects: 250,
    startups: 80,
    entrepreneurs: 1200,
    funding: 5,
  };

  const duration = 2000;
  const steps = 60;
  const stepDuration = duration / steps;

  Object.keys(targets).forEach((key) => {
    const increment = targets[key] / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= targets[key]) {
        counters.value[key] = targets[key];
        clearInterval(interval);
      } else {
        counters.value[key] = Math.floor(current);
      }
    }, stepDuration);
  });
};

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounters();
        observer.disconnect();
      }
    });
  });

  const statsSection = document.querySelector(".impact-section");
  if (statsSection) observer.observe(statsSection);
});

const programs = [
  {
    title: "Ideation Lab",
    description:
      "Transform your vision into a viable business model with expert guidance and structured workshops.",
    duration: "8 weeks",
  },
  {
    title: "Growth Accelerator",
    description:
      "Scale your startup with advanced strategies, mentorship, and access to industry networks.",
    duration: "12 weeks",
  },
  {
    title: "Tech Innovation",
    description:
      "Develop cutting-edge technology solutions with access to labs, tools, and technical expertise.",
    duration: "16 weeks",
  },
  {
    title: "Market Launch",
    description:
      "Perfect your go-to-market strategy and connect with investors, partners, and early adopters.",
    duration: "10 weeks",
  },
];

const testimonials = [
  {
    name: "Amina Benali",
    role: "Founder, Smart Agriculture Solutions",
    quote:
      "Badji Mokhtar University Incubator gave us the foundation to transform our agricultural technology idea into a successful startup. The mentorship from experienced entrepreneurs was exceptional.",
  },
  {
    name: "Karim Meziane",
    role: "CEO, TechMed Algeria",
    quote:
      "The incubator provided us with workspace, technical resources, and invaluable connections. Within months, we launched our healthcare platform and secured our first partnerships.",
  },
  {
    name: "Yasmine Touati",
    role: "Co-founder, EduLink",
    quote:
      "As a student entrepreneur at Badji Mokhtar University, the incubator gave me the confidence and tools to turn my educational platform idea into reality. The support has been tremendous.",
  },
];
</script>

<template>
  <div class="home-page">
    <!-- Navigation -->
    <nav class="navbar">
      <div class="container">
        <div class="logo">
          <router-link to="/">
            <img
              src="/incubator_logo.png"
              alt="Badji Mokhtar University Incubator"
              class="logo-img"
            />
            <div class="logo-text-container">
              <span class="logo-text">Badji Mokhtar University</span>
              <span class="logo-sub">Innovation Incubator</span>
            </div>
          </router-link>
        </div>
        <ul class="nav-links">
          <li><router-link to="/">Home</router-link></li>
          <li><a href="#testimonials">Stories</a></li>
          <li><a href="#contact">Contact</a></li>

          <!-- Show Login/Register buttons when NOT authenticated -->
          <template v-if="!authStore.isAuthenticated">
            <li>
              <router-link to="/login" class="btn-login-nav">Login</router-link>
            </li>
            <li>
              <router-link to="/register" class="btn-register"
                >Register Project</router-link
              >
            </li>
          </template>

          <!-- Show User menu when authenticated -->
          <template v-else>
            <li class="user-menu-wrapper">
              <button
                class="user-menu-btn"
                @click="showUserMenu = !showUserMenu"
              >
                <span class="user-avatar">{{
                  authStore.userName?.charAt(0) || "U"
                }}</span>
                <span class="user-name">{{ authStore.userName }}</span>
                <span class="dropdown-arrow">▼</span>
              </button>

              <div v-if="showUserMenu" class="user-dropdown">
                <div class="user-info">
                  <p class="user-full-name">{{ authStore.userName }}</p>
                  <p class="user-email">{{ authStore.userEmail }}</p>
                </div>
                <div class="dropdown-divider"></div>
                <button
                  class="dropdown-item"
                  @click="router.push('/dashboard')"
                >
                  Dashboard
                </button>
                <button class="dropdown-item" @click="router.push('/register')">
                  Register Project
                </button>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item logout-btn" @click="handleLogout">
                  Logout
                </button>
              </div>
            </li>
          </template>
        </ul>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <span class="badge">Empowering Algerian Innovation Since 2020</span>
          <h1 class="hero-title">
            Transform Your Ideas into Successful Startups
          </h1>
          <p class="hero-subtitle">
            Badji Mokhtar University Incubator supports Algerian entrepreneurs,
            students, and innovators in building the next generation of
            successful tech startups with mentorship, resources, and a vibrant
            community in Annaba.
          </p>
          <div class="hero-actions">
            <button class="btn-primary" @click="navigateToRegister">
              Start Your Journey
            </button>
            <a href="#testimonials" class="btn-secondary">Success Stories</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Gradient Transition -->
    <div class="gradient-transition"></div>

    <!-- About Section -->
    <section class="about-section">
      <div class="container">
        <div class="about-grid">
          <div class="about-content">
            <h2 class="section-title">Building Algeria's Startup Ecosystem</h2>
            <p class="section-text">
              Badji Mokhtar University Innovation Incubator is committed to
              fostering entrepreneurship in Algeria. We provide students,
              graduates, and aspiring entrepreneurs with comprehensive support
              to transform innovative ideas into viable businesses that
              contribute to Algeria's economic development.
            </p>
            <p class="section-text">
              Located in the heart of Annaba, we offer state-of-the-art
              facilities, expert mentorship from successful Algerian
              entrepreneurs, access to funding opportunities, and a
              collaborative environment where innovation thrives and startups
              grow.
            </p>
          </div>
          <div class="about-visual">
            <div class="visual-box box-1">
              <div class="box-content">
                <div class="box-icon">💡</div>
                <h3 class="box-title">Innovation Hub</h3>
                <p class="box-text">Where creativity meets opportunity</p>
              </div>
            </div>
            <div class="visual-box box-2">
              <div class="box-content">
                <div class="box-icon">🚀</div>
                <h3 class="box-title">Launch Pad</h3>
                <p class="box-text">Accelerate your startup journey</p>
              </div>
            </div>
            <div class="visual-box box-3">
              <div class="box-content">
                <div class="box-icon">🎯</div>
                <h3 class="box-title">Success Path</h3>
                <p class="box-text">Guided mentorship programs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section id="testimonials" class="testimonials-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Success Stories</h2>
          <p class="section-subtitle">
            Hear from entrepreneurs who transformed their ideas into reality
          </p>
        </div>
        <div class="testimonials-grid">
          <div
            v-for="(testimonial, index) in testimonials"
            :key="index"
            class="testimonial-card"
          >
            <p class="testimonial-quote">"{{ testimonial.quote }}"</p>
            <div class="testimonial-author">
              <div class="author-avatar">{{ testimonial.name.charAt(0) }}</div>
              <div class="author-info">
                <h4 class="author-name">{{ testimonial.name }}</h4>
                <p class="author-role">{{ testimonial.role }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2 class="cta-title">Ready to Launch Your Algerian Startup?</h2>
          <p class="cta-text">
            Join Badji Mokhtar University's thriving entrepreneurial community.
            Get access to mentorship, resources, and funding opportunities to
            turn your innovative idea into a successful business in Algeria.
          </p>
          <button class="btn-cta" @click="navigateToRegister">
            Apply to the Incubator
          </button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer id="contact" class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col">
            <h3 class="footer-title">Innovation Incubator</h3>
            <p class="footer-text">
              Badji Mokhtar University Annaba's innovation hub dedicated to
              supporting Algerian entrepreneurs and students in transforming
              their ideas into successful startups that drive economic growth
              and technological advancement in Algeria.
            </p>
          </div>
          <div class="footer-col">
            <h4 class="footer-heading">Quick Links</h4>
            <ul class="footer-links">
              <li><a href="#testimonials">Success Stories</a></li>
              <li><a href="#">Apply Now</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4 class="footer-heading">Resources</h4>
            <ul class="footer-links">
              <li><a href="#">Mentorship Programs</a></li>
              <li><a href="#">Training Workshops</a></li>
              <li><a href="#">Startup Events</a></li>
              <li><a href="#">Funding Support</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4 class="footer-heading">Contact Us</h4>
            <ul class="footer-contact">
              <li>Badji Mokhtar University</li>
              <li>BP 12, Annaba 23000, Algeria</li>
              <li>incubator@univ-annaba.dz</li>
              <li>+213 (0)38 87 54 21</li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>
            &copy; 2025 Badji Mokhtar University Innovation Incubator. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.home-page {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  direction: ltr;
  overflow-x: hidden;
  background: #ffffff;
  width: 100%;
  min-height: 100vh;
  color: #1a1a1a;
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
  padding: 12px 0;
  z-index: 1000;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo a {
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-img {
  height: 50px;
  width: auto;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.logo-img:hover {
  transform: scale(1.05);
}

.logo-text-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.logo-text {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.3px;
}

.logo-sub {
  font-size: 11px;
  font-weight: 600;
  color: #23a455;
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

.nav-links a:hover {
  color: #61ce70;
}

.btn-register {
  background: linear-gradient(135deg, #61ce70 0%, #23a455 100%);
  color: white !important;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(97, 206, 112, 0.25);
}

.btn-register:hover {
  background: linear-gradient(135deg, #23a455 0%, #1a8542 100%) !important;
  color: white !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(35, 164, 85, 0.4);
}

.btn-login-nav {
  background: white;
  color: #54595f !important;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  border: 2px solid #54595f;
  transition: all 0.3s ease;
}

.btn-login-nav:hover {
  background: #54595f !important;
  color: white !important;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(84, 89, 95, 0.3);
}

/* User Menu */
.user-menu-wrapper {
  position: relative;
}

.user-menu-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 2px solid #e8f5eb;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.user-menu-btn:hover {
  border-color: #61ce70;
  background: #f0fdf4;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #61ce70 0%, #23a455 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
}

.user-name {
  font-weight: 600;
  font-size: 13px;
  color: #1a1a1a;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  font-size: 9px;
  color: #666;
  transition: transform 0.3s ease;
}

.user-menu-btn:hover .dropdown-arrow {
  transform: translateY(2px);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: white;
  border: 2px solid #e8f5eb;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(97, 206, 112, 0.15);
  min-width: 250px;
  z-index: 1000;
  animation: dropdownSlide 0.3s ease;
}

@keyframes dropdownSlide {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-info {
  padding: 16px;
  background: linear-gradient(135deg, #f0fdf4 0%, #e8f5eb 100%);
  border-radius: 10px 10px 0 0;
}

.user-full-name {
  font-weight: 700;
  font-size: 15px;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.user-email {
  font-size: 13px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-divider {
  height: 1px;
  background: #e8f5eb;
  margin: 8px 0;
}

.dropdown-item {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.dropdown-item:hover {
  background: #f0fdf4;
  color: #23a455;
}

.logout-btn {
  color: #ff6b6b;
}

.logout-btn:hover {
  background: #fff5f5;
  color: #e05555;
}

.btn-login {
  background: #54595f;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.btn-login:hover {
  background: #3d4146;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(84, 89, 95, 0.3);
}

/* Hero Section */
.hero {
  padding: 100px 0 50px;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #ffffff 100%);
  position: relative;
  overflow: visible;
}

.hero::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 600px;
  height: 600px;
  background: radial-gradient(
    circle,
    rgba(97, 206, 112, 0.1) 0%,
    transparent 70%
  );
  border-radius: 50%;
}

.hero::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 300px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(255, 245, 245, 0.3) 40%,
    rgba(255, 245, 245, 0.5) 60%,
    rgba(255, 245, 245, 0.7) 80%,
    #fff5f5 100%
  );
  pointer-events: none;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 1;
}

.badge {
  display: inline-block;
  background: linear-gradient(135deg, #e8f5eb 0%, #f0fdf4 100%);
  color: #23a455;
  padding: 10px 24px;
  border-radius: 50px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-bottom: 30px;
  text-transform: uppercase;
  border: 2px solid rgba(97, 206, 112, 0.2);
  box-shadow: 0 4px 15px rgba(97, 206, 112, 0.1);
}

.hero-title {
  font-size: 68px;
  font-weight: 800;
  background: linear-gradient(135deg, #23a455 0%, #61ce70 50%, #54595f 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
  margin-bottom: 24px;
  letter-spacing: -2px;
}

.hero-subtitle {
  font-size: 20px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 40px;
  max-width: 650px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 60px;
}

.btn-primary {
  background: linear-gradient(135deg, #61ce70 0%, #23a455 100%);
  color: white;
  border: none;
  padding: 16px 36px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  box-shadow: 0 8px 25px rgba(97, 206, 112, 0.3);
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #23a455 0%, #1a8542 100%);
  transition: left 0.4s ease;
}

.btn-secondary {
  background: transparent;
  color: #54595f;
  border: 2px solid #54595f;
  padding: 14px 34px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-secondary:hover {
  background: #54595f;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(84, 89, 95, 0.25);
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 50px;
  max-width: 700px;
  margin: 0 auto;
  padding: 40px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 36px;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.stat-label {
  display: block;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

/* Gradient Transition */
.gradient-transition {
  height: 250px;
  background: linear-gradient(
    to bottom,
    #fff5f5 0%,
    rgba(255, 247, 247, 1) 12%,
    rgba(255, 249, 249, 1) 24%,
    rgba(255, 251, 251, 1) 36%,
    rgba(255, 252, 252, 1) 48%,
    rgba(255, 253, 253, 1) 60%,
    rgba(255, 254, 254, 1) 72%,
    rgba(255, 255, 255, 0.8) 84%,
    #ffffff 100%
  );
  position: relative;
  margin-top: -50px;
  z-index: 2;
}

/* About Section */
.about-section {
  padding: 120px 0;
  background: linear-gradient(to bottom, #ffffff 0%, #fefefe 50%, #fdfdfd 100%);
}

.about-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 80px;
  align-items: center;
}

.section-title {
  font-size: 48px;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 24px;
  line-height: 1.2;
  letter-spacing: -1px;
}

.section-text {
  font-size: 18px;
  color: #666;
  line-height: 1.8;
  margin-bottom: 20px;
}

.about-features {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.feature-item {
  padding: 24px;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
  border-radius: 12px;
  border-left: 4px solid #61ce70;
  box-shadow: 0 4px 15px rgba(97, 206, 112, 0.1);
  transition: all 0.3s ease;
}

.feature-item:hover {
  transform: translateX(8px);
  border-left-width: 6px;
  box-shadow: 0 6px 20px rgba(97, 206, 112, 0.2);
}

.feature-item h4 {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.feature-item p {
  font-size: 15px;
  color: #666;
  line-height: 1.6;
}

.about-visual {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  height: 500px;
}

.visual-box {
  background: #f0f0f0;
  border-radius: 16px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.visual-box::after {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.visual-box:hover::after {
  opacity: 1;
}

.visual-box:hover {
  transform: translateY(-8px);
}

.box-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 30px;
  color: white;
}

.box-icon {
  font-size: 60px;
  margin-bottom: 16px;
  display: block;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.box-title {
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 8px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.box-text {
  font-size: 14px;
  font-weight: 500;
  opacity: 0.95;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.box-1 {
  grid-column: 1 / 2;
  grid-row: 1 / 3;
  background: linear-gradient(
      135deg,
      rgba(97, 206, 112, 0.95) 0%,
      rgba(35, 164, 85, 0.95) 100%
    ),
    url("https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=800&fit=crop")
      center/cover;
  box-shadow: 0 10px 30px rgba(97, 206, 112, 0.3);
}

.box-2 {
  grid-column: 2 / 3;
  grid-row: 1 / 2;
  background: linear-gradient(
      135deg,
      rgba(84, 89, 95, 0.9) 0%,
      rgba(61, 65, 70, 0.9) 100%
    ),
    url("https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop")
      center/cover;
  box-shadow: 0 10px 30px rgba(84, 89, 95, 0.3);
}

.box-3 {
  grid-column: 2 / 3;
  grid-row: 2 / 3;
  background: linear-gradient(
      135deg,
      rgba(255, 107, 107, 0.85) 0%,
      rgba(230, 85, 85, 0.85) 100%
    ),
    url("https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop")
      center/cover;
  border: 2px solid #ff6b6b;
  box-shadow: 0 10px 30px rgba(255, 107, 107, 0.2);
}

/* Programs Section */
.programs-section {
  padding: 120px 0;
  background: #fafafa;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-subtitle {
  font-size: 18px;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.programs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
}

.program-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  border: 2px solid transparent;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
}

.program-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #61ce70 0%, #23a455 100%);
  transform: scaleX(0);
  transition: transform 0.4s ease;
}

.program-card:hover::before {
  transform: scaleX(1);
}

.program-card:hover {
  transform: translateY(-8px);
  border-color: rgba(97, 206, 112, 0.3);
  box-shadow: 0 20px 60px rgba(97, 206, 112, 0.15);
}

.program-duration {
  display: inline-block;
  background: linear-gradient(135deg, #e8f5eb 0%, #f0fdf4 100%);
  color: #23a455;
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 20px;
  border: 1px solid rgba(97, 206, 112, 0.3);
}

.program-title {
  font-size: 26px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.program-description {
  font-size: 16px;
  color: #666;
  line-height: 1.7;
  margin-bottom: 24px;
}

.program-link {
  color: #23a455;
  font-weight: 700;
  text-decoration: none;
  font-size: 15px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.program-link::after {
  content: "→";
  transition: transform 0.3s ease;
}

.program-link:hover {
  color: #61ce70;
}

.program-link:hover::after {
  transform: translateX(4px);
}

/* Impact Section */
.impact-section {
  padding: 120px 0;
  background: white;
}

.impact-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.impact-card {
  background: white;
  padding: 40px 30px;
  border-radius: 16px;
  text-align: center;
  transition: all 0.4s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.impact-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #61ce70 0%, #23a455 50%, #ff6b6b 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.impact-card:hover::before {
  opacity: 1;
}

.impact-card:nth-child(1):hover {
  border-color: rgba(97, 206, 112, 0.3);
  box-shadow: 0 15px 45px rgba(97, 206, 112, 0.2);
}

.impact-card:nth-child(2):hover {
  border-color: rgba(35, 164, 85, 0.3);
  box-shadow: 0 15px 45px rgba(35, 164, 85, 0.2);
}

.impact-card:nth-child(3):hover {
  border-color: rgba(255, 107, 107, 0.3);
  box-shadow: 0 15px 45px rgba(255, 107, 107, 0.2);
}

.impact-card:nth-child(4):hover {
  border-color: rgba(84, 89, 95, 0.3);
  box-shadow: 0 15px 45px rgba(84, 89, 95, 0.2);
}

.impact-card:hover {
  transform: translateY(-8px);
  background: #fafafa;
}

.impact-number {
  font-size: 48px;
  font-weight: 800;
  background: linear-gradient(135deg, #23a455 0%, #61ce70 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
}

.impact-label {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.impact-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

/* Testimonials Section */
.testimonials-section {
  padding: 120px 0;
  background: linear-gradient(to bottom, #fdfdfd 0%, #fafafa 100%);
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.testimonial-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
  gap: 30px;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
}

.testimonial-card::before {
  content: '"';
  position: absolute;
  top: 20px;
  right: 30px;
  font-size: 120px;
  font-weight: 800;
  color: rgba(97, 206, 112, 0.05);
  font-family: Georgia, serif;
}

.testimonial-card:hover {
  border-color: rgba(97, 206, 112, 0.3);
  box-shadow: 0 15px 45px rgba(97, 206, 112, 0.15);
  transform: translateY(-8px);
}

.testimonial-quote {
  font-size: 17px;
  color: #1a1a1a;
  line-height: 1.7;
  font-weight: 500;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 16px;
}

.author-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #61ce70 0%, #23a455 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 4px 15px rgba(97, 206, 112, 0.3);
}

.author-name {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.author-role {
  font-size: 14px;
  color: #666;
}
/* CTA Section */
.cta-section {
  padding: 0;
  background: linear-gradient(
    to bottom,
    #fafafa 0%,
    #e5e5e5 8%,
    #d0d0d0 16%,
    #b8b8b8 24%,
    #a0a0a0 32%,
    #888888 40%,
    #707070 48%,
    #585858 56%,
    #404040 64%,
    #2a2a2a 72%,
    #1a1a1a 80%,
    #0d0d0d 88%,
    #000000 100%
  );
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.cta-section::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.05) 1px,
    transparent 1px
  );
  background-size: 50px 50px;
  animation: movePattern 20s linear infinite;
  pointer-events: none;
  z-index: 1;
}

.cta-section::after {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.1) 1px,
    transparent 1px
  );
  background-size: 50px 50px;
  animation: movePattern 20s linear infinite;
  z-index: 0;
}

@keyframes movePattern {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(50px, 50px);
  }
}

.cta-content {
  position: relative;
  z-index: 2;
  padding: 120px 0;
}

.cta-title {
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 20px;
  letter-spacing: -1px;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.cta-text {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.95);
  max-width: 650px;
  margin: 0 auto 40px;
  line-height: 1.6;
}

.btn-cta {
  background: white;
  color: #222;
  border: none;
  padding: 18px 40px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.btn-cta:hover {
  background: #f0fdf4;
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.3);
}

/* Footer */
.footer {
  padding: 30px 0 0;
  background: #000000;
  position: relative;
  color: #ffffff;
}

.footer::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(97, 206, 112, 0.05) 50%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 1;
}

.footer .container {
  position: relative;
  z-index: 2;
  padding-top: 80px;
  padding-bottom: 40px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 60px;
  margin-bottom: 60px;
}

.footer-title {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 16px;
}

.footer-text {
  font-size: 15px;
  color: #ffffff;
  line-height: 1.7;
  opacity: 0.9;
}

.footer-heading {
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.footer-links {
  list-style: none;
}

.footer-links li {
  margin-bottom: 12px;
}

.footer-links a {
  color: #ffffff;
  text-decoration: none;
  font-size: 15px;
  transition: color 0.3s ease;
  opacity: 0.9;
}

.footer-links a:hover {
  color: #61ce70;
  opacity: 1;
}

.footer-contact {
  list-style: none;
}

.footer-contact li {
  color: #ffffff;
  font-size: 15px;
  margin-bottom: 10px;
  line-height: 1.6;
  opacity: 0.9;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 30px;
  text-align: center;
}

.footer-bottom p {
  color: #ffffff;
  font-size: 14px;
  opacity: 0.7;
}

/* Smooth Scroll */
html {
  scroll-behavior: smooth;
}

/* Selection */
::selection {
  background: #61ce70;
  color: white;
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-title {
    font-size: 56px;
  }

  .about-grid {
    grid-template-columns: 1fr;
    gap: 60px;
  }

  .programs-grid {
    grid-template-columns: 1fr;
  }

  .impact-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .testimonials-grid {
    grid-template-columns: 1fr;
  }

  .footer-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 40px;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 20px;
  }

  .navbar {
    padding: 10px 0;
  }

  .logo-img {
    height: 40px;
  }

  .logo-text {
    font-size: 14px;
  }

  .logo-sub {
    font-size: 10px;
  }

  .nav-links {
    display: none;
  }

  .hero {
    padding: 100px 0 60px;
  }

  .hero-title {
    font-size: 42px;
  }

  .hero-subtitle {
    font-size: 18px;
  }

  .hero-stats {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .hero-actions {
    flex-direction: column;
    margin-bottom: 60px;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    text-align: center;
  }

  .section-title {
    font-size: 36px;
  }

  .about-visual {
    height: 300px;
  }

  .impact-grid {
    grid-template-columns: 1fr;
  }

  .footer-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .cta-title {
    font-size: 36px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 32px;
  }

  .section-title {
    font-size: 28px;
  }

  .program-card,
  .impact-card,
  .testimonial-card {
    padding: 30px 24px;
  }
}
</style>
