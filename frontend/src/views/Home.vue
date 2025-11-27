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
    name: "Sarah Mitchell",
    role: "Founder, EcoTech Solutions",
    quote:
      "The incubator provided the perfect environment to transform our sustainable technology concept into a thriving business. The mentorship was invaluable.",
  },
  {
    name: "David Chen",
    role: "CEO, HealthAI",
    quote:
      "From ideation to market launch, the support we received was exceptional. We secured funding within six months of joining the program.",
  },
  {
    name: "Amira Hassan",
    role: "Co-founder, EduConnect",
    quote:
      "The connections we made and the resources we accessed through the incubator accelerated our growth by years. Best decision we ever made.",
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
            <span class="logo-text">Badji Mokhtar University</span>
            <span class="logo-sub">Innovation Incubator</span>
          </router-link>
        </div>
        <ul class="nav-links">
          <li><router-link to="/">Home</router-link></li>
          <li><a href="#programs">Programs</a></li>
          <li><a href="#impact">Impact</a></li>
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
          <span class="badge">Empowering Innovation Since 2020</span>
          <h1 class="hero-title">Where Ideas Become Reality</h1>
          <p class="hero-subtitle">
            Join a community of visionaries, innovators, and entrepreneurs
            transforming groundbreaking ideas into successful ventures with
            world-class support and resources.
          </p>
          <div class="hero-actions">
            <button class="btn-primary" @click="navigateToRegister">
              Apply Now
            </button>
            <a href="#programs" class="btn-secondary">Explore Programs</a>
          </div>
        </div>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-number">250+</span>
            <span class="stat-label">Projects Launched</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">80+</span>
            <span class="stat-label">Startups Created</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">$5M+</span>
            <span class="stat-label">Funding Raised</span>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="about-section">
      <div class="container">
        <div class="about-grid">
          <div class="about-content">
            <h2 class="section-title">Nurturing Tomorrow's Innovators</h2>
            <p class="section-text">
              At Badji Mokhtar University Innovation Incubator, we believe every
              great company starts with a bold idea. Our mission is to provide
              aspiring entrepreneurs with the tools, knowledge, and network they
              need to turn their visions into thriving businesses.
            </p>
            <p class="section-text">
              We offer more than just workspace—we provide a comprehensive
              ecosystem designed to accelerate growth, foster innovation, and
              create lasting impact in the entrepreneurial landscape.
            </p>
            <div class="about-features">
              <div class="feature-item">
                <h4>Expert Mentorship</h4>
                <p>
                  Learn from successful entrepreneurs and industry leaders who
                  guide you every step of the way.
                </p>
              </div>
              <div class="feature-item">
                <h4>Strategic Resources</h4>
                <p>
                  Access cutting-edge tools, technology, and facilities to bring
                  your ideas to life.
                </p>
              </div>
              <div class="feature-item">
                <h4>Investor Network</h4>
                <p>
                  Connect with venture capitalists and angel investors ready to
                  fund promising ventures.
                </p>
              </div>
            </div>
          </div>
          <div class="about-visual">
            <div class="visual-box box-1"></div>
            <div class="visual-box box-2"></div>
            <div class="visual-box box-3"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Programs Section -->
    <section id="programs" class="programs-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Our Programs</h2>
          <p class="section-subtitle">
            Tailored pathways designed to support entrepreneurs at every stage
            of their journey
          </p>
        </div>
        <div class="programs-grid">
          <div
            v-for="(program, index) in programs"
            :key="index"
            class="program-card"
          >
            <div class="program-duration">{{ program.duration }}</div>
            <h3 class="program-title">{{ program.title }}</h3>
            <p class="program-description">{{ program.description }}</p>
            <a href="#" class="program-link">Learn More →</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Impact Section -->
    <section id="impact" class="impact-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Our Impact</h2>
          <p class="section-subtitle">
            Measuring success through the achievements of our community
          </p>
        </div>
        <div class="impact-grid">
          <div class="impact-card">
            <h3 class="impact-number">{{ counters.projects }}+</h3>
            <p class="impact-label">Innovative Projects</p>
            <p class="impact-desc">
              Ideas transformed into market-ready solutions
            </p>
          </div>
          <div class="impact-card">
            <h3 class="impact-number">{{ counters.startups }}+</h3>
            <p class="impact-label">Successful Startups</p>
            <p class="impact-desc">
              Companies generating revenue and creating jobs
            </p>
          </div>
          <div class="impact-card">
            <h3 class="impact-number">{{ counters.entrepreneurs }}+</h3>
            <p class="impact-label">Entrepreneurs Supported</p>
            <p class="impact-desc">
              Visionaries empowered to pursue their dreams
            </p>
          </div>
          <div class="impact-card">
            <h3 class="impact-number">${{ counters.funding }}M+</h3>
            <p class="impact-label">Capital Raised</p>
            <p class="impact-desc">
              Investment secured for portfolio companies
            </p>
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
          <h2 class="cta-title">Ready to Build Something Amazing?</h2>
          <p class="cta-text">
            Join hundreds of entrepreneurs who have launched successful ventures
            through our incubator. Your journey to innovation starts here.
          </p>
          <button class="btn-cta" @click="navigateToRegister">
            Start Your Application
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
              Badji Mokhtar University's premier platform for nurturing
              entrepreneurship, fostering innovation, and building the next
              generation of successful businesses.
            </p>
          </div>
          <div class="footer-col">
            <h4 class="footer-heading">Quick Links</h4>
            <ul class="footer-links">
              <li><a href="#programs">Programs</a></li>
              <li><a href="#impact">Impact</a></li>
              <li><a href="#testimonials">Success Stories</a></li>
              <li><a href="#">Apply Now</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4 class="footer-heading">Resources</h4>
            <ul class="footer-links">
              <li><a href="#">Mentorship</a></li>
              <li><a href="#">Workshops</a></li>
              <li><a href="#">Events</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4 class="footer-heading">Get in Touch</h4>
            <ul class="footer-contact">
              <li>Badji Mokhtar University</li>
              <li>Annaba, Algeria</li>
              <li>incubator@univ-annaba.dz</li>
              <li>+213 123 456 789</li>
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
  padding: 20px 0;
  z-index: 1000;
  transition: all 0.3s ease;
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo a {
  text-decoration: none;
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

.nav-links a:hover {
  color: #0066ff;
}

.btn-register {
  background: #0066ff;
  color: white !important;
  padding: 10px 24px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-register:hover {
  background: #0052cc !important;
  color: white !important;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 102, 255, 0.3);
}

.btn-login-nav {
  background: white;
  color: #0066ff !important;
  padding: 10px 24px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  border: 2px solid #0066ff;
  transition: all 0.3s ease;
}

.btn-login-nav:hover {
  background: #0066ff !important;
  color: white !important;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 102, 255, 0.3);
}

/* User Menu */
.user-menu-wrapper {
  position: relative;
}

.user-menu-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  border: 2px solid #e6edff;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.user-menu-btn:hover {
  border-color: #0066ff;
  background: #f8f9ff;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #0066ff;
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
  font-size: 14px;
  color: #1a1a1a;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  font-size: 10px;
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
  border: 2px solid #e6edff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
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
  background: #f8f9ff;
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
  background: #e6edff;
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
  background: #f8f9ff;
  color: #0066ff;
}

.logout-btn {
  color: #ff4444;
}

.logout-btn:hover {
  background: #fff5f5;
  color: #cc0000;
}

.btn-login {
  background: #1a1a1a;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.btn-login:hover {
  background: #000;
  transform: translateY(-2px);
}

/* Hero Section */
.hero {
  padding: 180px 0 120px;
  background: #fafafa;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.badge {
  display: inline-block;
  background: #f0f0f0;
  color: #1a1a1a;
  padding: 8px 20px;
  border-radius: 50px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 30px;
  text-transform: uppercase;
}

.hero-title {
  font-size: 68px;
  font-weight: 800;
  color: #1a1a1a;
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
  margin-bottom: 80px;
}

.btn-primary {
  background: #0066ff;
  color: white;
  border: none;
  padding: 16px 36px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.btn-primary:hover {
  background: #0052cc;
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 102, 255, 0.3);
}

.btn-secondary {
  background: transparent;
  color: #1a1a1a;
  border: 2px solid #1a1a1a;
  padding: 14px 34px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-secondary:hover {
  background: #1a1a1a;
  color: white;
  transform: translateY(-2px);
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

/* About Section */
.about-section {
  padding: 120px 0;
  background: white;
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
  background: #fafafa;
  border-radius: 12px;
  border-left: 4px solid #0066ff;
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
}

.visual-box:hover {
  transform: translateY(-8px);
}

.box-1 {
  grid-column: 1 / 2;
  grid-row: 1 / 3;
  background: #0066ff;
}

.box-2 {
  grid-column: 2 / 3;
  grid-row: 1 / 2;
  background: #1a1a1a;
}

.box-3 {
  grid-column: 2 / 3;
  grid-row: 2 / 3;
  background: #f0f0f0;
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
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
}

.program-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.program-duration {
  display: inline-block;
  background: #f0f0f0;
  color: #1a1a1a;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 20px;
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
  color: #0066ff;
  font-weight: 600;
  text-decoration: none;
  font-size: 15px;
  transition: all 0.3s ease;
}

.program-link:hover {
  color: #0052cc;
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
  background: #fafafa;
  padding: 40px 30px;
  border-radius: 16px;
  text-align: center;
  transition: all 0.3s ease;
}

.impact-card:hover {
  transform: translateY(-8px);
  background: #f0f0f0;
}

.impact-number {
  font-size: 48px;
  font-weight: 800;
  color: #1a1a1a;
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
  background: #fafafa;
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
  border: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 30px;
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
  background: #0066ff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  flex-shrink: 0;
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
  padding: 120px 0;
  background: #1a1a1a;
  color: white;
  text-align: center;
}

.cta-title {
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 20px;
  letter-spacing: -1px;
}

.cta-text {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  max-width: 650px;
  margin: 0 auto 40px;
  line-height: 1.6;
}

.btn-cta {
  background: white;
  color: #1a1a1a;
  border: none;
  padding: 18px 40px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.btn-cta:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(255, 255, 255, 0.2);
}

/* Footer */
.footer {
  padding: 80px 0 40px;
  background: #f0f0f0;
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
  color: #1a1a1a;
  margin-bottom: 16px;
}

.footer-text {
  font-size: 15px;
  color: #666;
  line-height: 1.7;
}

.footer-heading {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a1a;
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
  color: #666;
  text-decoration: none;
  font-size: 15px;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: #0066ff;
}

.footer-contact {
  list-style: none;
}

.footer-contact li {
  color: #666;
  font-size: 15px;
  margin-bottom: 10px;
  line-height: 1.6;
}

.footer-bottom {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 30px;
  text-align: center;
}

.footer-bottom p {
  color: #999;
  font-size: 14px;
}

/* Smooth Scroll */
html {
  scroll-behavior: smooth;
}

/* Selection */
::selection {
  background: #0066ff;
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
    padding: 15px 0;
  }

  .nav-links {
    display: none;
  }

  .hero {
    padding: 140px 0 80px;
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
