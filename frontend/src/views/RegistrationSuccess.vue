<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const countdown = ref(15);

// Countdown timer
let countdownInterval;

onMounted(() => {
  // Start countdown
  countdownInterval = setInterval(() => {
    countdown.value--;

    if (countdown.value <= 0) {
      clearInterval(countdownInterval);
      redirectToHome();
    }
  }, 1000);
});

const redirectToHome = () => {
  router.push("/");
};

// Manual redirect option
const goToHomeNow = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  redirectToHome();
};
</script>

<template>
  <div class="success-page">
    <div class="success-container">
      <!-- Success Icon -->
      <div class="success-icon-wrapper">
        <div class="success-checkmark">
          <svg
            class="checkmark"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 52 52"
          >
            <circle
              class="checkmark-circle"
              cx="26"
              cy="26"
              r="25"
              fill="none"
            />
            <path
              class="checkmark-check"
              fill="none"
              d="M14.1 27.2l7.1 7.2 16.7-16.8"
            />
          </svg>
        </div>
      </div>

      <!-- Success Message -->
      <div class="success-content">
        <h1 class="success-title">Registration Successful!</h1>
        <p class="success-message">
          Your project has been registered successfully. We will review your
          submission and contact you soon.
        </p>

        <!-- Countdown -->
        <div class="countdown-box">
          <p class="countdown-text">
            Redirecting to home page in
            <span class="countdown-number">{{ countdown }}</span> seconds...
          </p>
        </div>

        <!-- Action Button -->
        <div class="action-buttons">
          <button class="btn-primary" @click="goToHomeNow">
            Go to Home Page
          </button>
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

.success-page {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  min-height: 100vh;
  background: #fafbfc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  direction: ltr;
  text-align: center;
  position: relative;
}

.success-page::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 300px;
  background: linear-gradient(180deg, #f0f4ff 0%, transparent 100%);
  z-index: 0;
}

.success-container {
  max-width: 550px;
  width: 100%;
  background: white;
  border-radius: 24px;
  padding: 60px 50px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06), 0 0 1px rgba(0, 0, 0, 0.04);
  text-align: center;
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  z-index: 1;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Success Icon Animation */
.success-icon-wrapper {
  margin-bottom: 32px;
}

.success-checkmark {
  width: 100px;
  height: 100px;
  margin: 0 auto;
  position: relative;
  background: #f0fdf4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 12px rgba(34, 197, 94, 0.1);
}

.checkmark {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: block;
  stroke-width: 4;
  stroke: #22c55e;
  stroke-miterlimit: 10;
  animation: scale 0.4s ease-in-out 0.5s both;
}

.checkmark-circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 4;
  stroke-miterlimit: 10;
  stroke: #22c55e;
  fill: none;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark-check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  stroke: #22c55e;
  stroke-width: 4;
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

@keyframes stroke {
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes scale {
  0%,
  100% {
    transform: none;
  }
  50% {
    transform: scale3d(1.08, 1.08, 1);
  }
}

@keyframes fill {
  100% {
    box-shadow: inset 0 0 0 60px #4caf50;
  }
}

/* Success Content */
.success-content {
  animation: fadeIn 0.8s ease 0.3s backwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-title {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.success-message {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 36px;
  font-weight: 400;
}

/* Countdown Box */
.countdown-box {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 18px 24px;
  margin-bottom: 32px;
}

.countdown-text {
  font-size: 15px;
  color: #4b5563;
  font-weight: 500;
  margin: 0;
}

.countdown-number {
  display: inline-block;
  background: #111827;
  color: white;
  padding: 4px 14px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 18px;
  margin: 0 4px;
  min-width: 38px;
  text-align: center;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: center;
}

.btn-primary {
  padding: 13px 36px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
  border: none;
  background: #111827;
  color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  letter-spacing: -0.01em;
}

.btn-primary:hover {
  background: #1f2937;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .success-container {
    padding: 50px 35px;
  }

  .success-title {
    font-size: 26px;
  }

  .success-message {
    font-size: 15px;
  }

  .btn-primary {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .success-page::before {
    height: 200px;
  }

  .success-container {
    padding: 40px 28px;
    border-radius: 20px;
  }

  .success-checkmark {
    width: 90px;
    height: 90px;
    box-shadow: 0 0 0 10px rgba(34, 197, 94, 0.1);
  }

  .checkmark {
    width: 55px;
    height: 55px;
  }

  .success-title {
    font-size: 24px;
  }

  .success-message {
    font-size: 15px;
    margin-bottom: 32px;
  }

  .countdown-box {
    padding: 16px 20px;
  }

  .countdown-text {
    font-size: 14px;
  }

  .countdown-number {
    font-size: 17px;
    padding: 3px 12px;
    min-width: 34px;
  }

  .btn-primary {
    padding: 12px 28px;
    font-size: 15px;
  }
}
</style>
