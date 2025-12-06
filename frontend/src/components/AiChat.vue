<script setup>
import { ref, nextTick, onMounted } from "vue";
import DOMPurify from "dompurify";
import api from "../api";
import { marked } from "marked";

const isOpen = ref(false);
const messages = ref([]);
const input = ref("");
const isTyping = ref(false);
const sessionId = ref(localStorage.getItem("chat_session_id") || null);

// ✅ قراءة الرسائل من localStorage
onMounted(() => {
  const saved = localStorage.getItem("chat_messages");
  try {
    messages.value = saved ? JSON.parse(saved) : [];
  } catch {
    messages.value = [];
  }
});

// 💾 حفظ الرسائل
const saveMessages = () => {
  try {
    localStorage.setItem("chat_messages", JSON.stringify(messages.value));
  } catch (e) {
    console.warn(e);
  }
};

// 💾 حفظ sessionId
const saveSession = (id) => {
  sessionId.value = id;
  localStorage.setItem("chat_session_id", id);
};

// 🧠 كتابة تدريجية للرسالة
const typeMessage = (text, sender = "bot") => {
  if (typeof text !== "string") {
    text = JSON.stringify(text);
  }

  messages.value.push({ sender, text: "" });
  const index = messages.value.length - 1;
  let i = 0;

  const typeWriter = setInterval(() => {
    messages.value[index].text = text.substring(0, i + 1);
    scrollToBottom();
    i++;
    if (i >= text.length) {
      clearInterval(typeWriter);
      saveMessages();
    }
  }, 5);
};

// 💬 رسالة ترحيب
const welcomeMessage = () => {
  const text =
    "مرحباً 👋 أنا حاضنة جامعة باجي مختار عنابة، مساعدك الذكي! أخبرني كيف يمكنني مساعدتك اليوم؟";
  typeMessage(text, "bot");
};

// 📩 إرسال رسالة إلى الـ API
const sendMessage = async () => {
  const text = input.value.trim();
  if (!text) return;

  messages.value.push({ sender: "user", text });
  input.value = "";
  isTyping.value = true;

  await nextTick();
  scrollToBottom();

  try {
    const response = await api.post("/ai/chat", {
      message: text,
      sessionId: sessionId.value, // ✅ تمرير الـ sessionId الحالي
    });

    isTyping.value = false;

    // ✅ حفظ sessionId الجديد (أو المحدث)
    if (response.data.sessionId) {
      saveSession(response.data.sessionId);
    }

    // ✅ الرد النصي فقط
    const fullText =
      typeof response.data.reply === "string"
        ? response.data.reply
        : JSON.stringify(response.data);

    typeMessage(fullText, "bot");
  } catch (error) {
    console.error(error);
    isTyping.value = false;
    typeMessage("I have some problems currently, let's talk later", "bot");
  }
};

// 🔽 تمرير للأسفل
const scrollToBottom = () => {
  const container = document.querySelector(".chat-messages");
  if (container) container.scrollTop = container.scrollHeight;
};

// ✏️ إعداد Markdown
marked.setOptions({
  gfm: true,
  breaks: true,
  smartLists: true,
  smartypants: true,
});

// 🔒 تنقية النصوص من أي محتوى خبيث
const formatText = (text) => {
  if (!text) return "";
  const html = marked.parse(text);
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "hr",
      "a",
      "strong",
      "em",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "blockquote",
      "pre",
      "code",
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });
};

// 📤 فتح الشات
const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    if (messages.value.length === 0) {
      isTyping.value = true;
      setTimeout(() => {
        isTyping.value = false;
        welcomeMessage();
      }, 600);
    }
    nextTick(scrollToBottom);
  }
};

// 🔤 اكتشاف اللغة العربية
const isArabic = (text) => /[\u0600-\u06FF]/.test(text);
const getMessageStyle = (text) =>
  isArabic(text)
    ? "direction: rtl; text-align: right;"
    : "direction: ltr; text-align: left;";
</script>

<template>
  <!-- أيقونة الشات -->
  <div class="chat-widget">
    <!-- الأيقونة الطافية -->
    <button
      v-if="!isOpen"
      class="chat-button"
      @click="toggleChat"
      aria-label="افتح محادثة مع Badji Mokhtar University Incubator"
    >
      <img src="/incubator_logo.png" alt="Badji Mokhtar University Incubator Assistant" />
    </button>

    <!-- نافذة الشات -->
    <div v-else class="chat-container">
      <!-- رأس الشات -->
      <div class="chat-header">
        <button @click="toggleChat" class="close-btn" aria-label="إغلاق">
          ✕
        </button>
        <div>
          <img src="/incubator_logo.png" alt="Badji Mokhtar University Incubator Assistant" />
          <span>Badji Mokhtar University Incubator</span>
        </div>
      </div>

      <!-- الرسائل -->
      <div class="chat-messages">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message', msg.sender, isArabic(msg.text) ? 'arabic' : '']"
          :style="getMessageStyle(msg.text)"
          v-html="formatText(msg.text)"
        ></div>

        <!-- مؤشر الكتابة -->
        <div v-if="isTyping" class="message bot typing-indicator">
          <span class="dot"></span>
        </div>
      </div>

      <!-- مدخل النص -->
      <div class="chat-input">
        <input
          v-model="input"
          @keyup.enter="sendMessage"
          placeholder="اكتب رسالتك..."
          type="text"
          aria-label="مدخل الرسالة"
        />
        <button @click="sendMessage" aria-label="إرسال">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            fill="currentColor"
            class="bi bi-send"
            viewBox="0 0 16 16"
          >
            <path
              d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style>
.chat-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
}

.chat-button {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  padding: 2px;
  background: linear-gradient(135deg, #61ce70 0%, #23a455 100%);
  border: none;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(97, 206, 112, 0.4);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.chat-button img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  background: white;
  padding: 2px;
}

.chat-button:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 32px rgba(97, 206, 112, 0.5);
}

.chat-container {
  width: 380px;
  height: 550px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 2px solid #e8f5eb;
  direction: rtl;
  font-size: 14px;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.chat-header {
  background: linear-gradient(135deg, #23a455 0%, #61ce70 100%);
  color: white;
  padding: 16px 18px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  box-shadow: 0 2px 8px rgba(35, 164, 85, 0.2);
}

.chat-header div {
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  gap: 10px;
}

.chat-header div img {
  width: 32px;
  height: 32px;
  background-color: #fff;
  padding: 4px;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 22px;
  cursor: pointer;
  padding: 6px;
  height: 36px;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.chat-messages {
  flex: 1;
  padding: 18px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #61ce70 #f0fdf4;
  scroll-behavior: smooth;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f0fdf4;
  border-radius: 10px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #61ce70;
  border-radius: 10px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #23a455;
}

.message {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.6;
  word-wrap: break-word;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  animation: messageSlide 0.3s ease;
}

@keyframes messageSlide {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.user {
  align-self: flex-end;
  background: linear-gradient(135deg, #61ce70 0%, #23a455 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.message.bot {
  align-self: flex-start;
  max-width: 100%;
  background: white;
  color: #1a1a1a;
  font-size: 14px;
  border: 1px solid #e8f5eb;
  border-bottom-left-radius: 4px;
}

/* العناوين */
.message.bot h3 {
  font-size: 16px;
  font-weight: 700;
  color: #23a455;
  margin: 16px 0 10px 0;
  padding-bottom: 6px;
  border-bottom: 2px solid #e8f5eb;
}

/* القوائم المرقمة */
.message.bot ol {
  margin: 12px 0;
  list-style-type: none;
}

.message.bot ol > li {
  margin: 8px 0;
  counter-increment: step-counter;
  position: relative;
  padding-inline-start: 15px;
}

.message.bot ol > li::before {
  content: counter(step-counter) ".";
  position: absolute;
  left: 0;
  top: 0;
  color: #23a455;
  font-size: 14px;
  font-weight: bold;
  border-radius: 50%;
  text-align: center;
  line-height: 20px;
}

.message.bot.arabic ol > li::before {
  left: auto;
  right: 0;
}

/* القوائم غير المرقمة */
.message.bot ul {
  list-style-type: none;
  padding-right: 15px;
  margin: 10px 0;
}

.message.bot.arabic ul {
  padding: 0;
  padding-left: 15px;
}

.message.bot ul > li {
  position: relative;
  padding-left: 10px;
}

.message.bot.arabic ul > li {
  padding-left: 0;
  padding-right: 10px;
}

.message.bot ul > li::before {
  content: "•";
  position: absolute;
  left: -3px;
  top: 2px;
  color: #23a455;
  font-size: 20px;
  line-height: 1;
}

.message.bot.arabic ul > li::before {
  left: auto;
  right: -3px;
}

/* الفقرات */
.message.bot p {
  margin: 10px 0;
}

.chat-input {
  position: relative;
  display: flex;
  padding: 14px;
  background: white;
  border-top: 2px solid #e8f5eb;
}

.chat-input input {
  width: 100%;
  padding: 12px 16px;
  padding-left: 45px;
  border: 2px solid #e8f5eb;
  border-radius: 24px;
  outline: none;
  font-size: 14px;
  direction: rtl;
  transition: all 0.3s ease;
  background: #fafafa;
}

.chat-input input:focus {
  border-color: #61ce70;
  box-shadow: 0 0 0 3px rgba(97, 206, 112, 0.1);
  background: white;
}

.chat-input button {
  margin-right: 8px;
  color: #61ce70;
  background: none;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 22px;
  padding: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-input button:hover {
  color: #23a455;
  background: #f0fdf4;
  transform: translateY(-50%) scale(1.1);
}

.typing-indicator {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e8f5eb;
  border-radius: 12px;
  max-width: 80px;
  align-self: flex-start;
  font-size: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.dot {
  width: 8px;
  height: 8px;
  background: #61ce70;
  border-radius: 50%;
  animation: breathe 1.2s infinite ease-in-out;
  box-shadow: 0 0 8px rgba(97, 206, 112, 0.5);
}

@keyframes breathe {
  0%,
  100% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}
</style>
