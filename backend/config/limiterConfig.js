// config/limiterConfig.js
const rateLimit = require("express-rate-limit");
const getRealIP = require("../utils/getRealIP");
const { sendTelegramAlert } = require("./notifier"); // ✅ استيراد_notifier

/**
 * عام Rate Limiter للحماية من DDoS
 */
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 دقائق
  max: 500,
  message: "🚫 Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const ip = getRealIP(req);
    return (
      ip === "::1" ||
      ip === "127.0.0.1" ||
      ip.startsWith("::ffff:127.0.0.1") ||
      ip.startsWith("::ffff:192.168.") ||
      process.env.NODE_ENV !== "production"
    );
  },
  handler: (req, res, next, options) => {
    const ip = getRealIP(req);
    const userAgent = req.headers["user-agent"] || "unknown";

    // 📢 إرسال تنبيه إلى Telegram
    sendTelegramAlert(
      `⚠️ DDoS Warning: Too many requests\nURL: ${req.url}\nMethod: ${req.method}`,
      ip,
      userAgent
    );

    console.warn(`Rate limit exceeded: ${ip} | URL: ${req.url}`);
    res.status(options.statusCode).json(options.message);
  }
});

/**
 * Login Rate Limiter
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: "Too many login attempts, account temporarily locked. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = req.body?.email;
    return email ? `login_${email.toLowerCase()}` : getRealIP(req);
  },
  handler: (req, res, next, options) => {
    const ip = getRealIP(req);
    const userAgent = req.headers["user-agent"] || "unknown";
    const email = req.body?.email;

    // 📢 تنبيه خاص بتسجيل الدخول
    sendTelegramAlert(
      `🔐 Login Attempt Limit Exceeded\nEmail: ${email || 'N/A'}\nIP: ${ip}`,
      ip,
      userAgent
    );

    console.warn(`Login rate limit hit: IP=${ip}, Email=${email} | URL: ${req.url}`);
    res.status(429).json(options.message);
  }
});

/**
 * Register Rate Limiter
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    error: "Too many registration attempts. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return getRealIP(req);
  },
  handler: (req, res, next, options) => {
    const ip = getRealIP(req);
    const userAgent = req.headers["user-agent"] || "unknown";

    // 📢 تنبيه خاص بالتسجيل
    sendTelegramAlert(
      `📝 Registration Flood Detected\nToo many sign-up attempts from one IP`,
      ip,
      userAgent
    );

    console.warn(`Register rate limit hit: IP=${ip} | URL: ${req.url}`);
    res.status(429).json(options.message);
  }
});

/**
 * Refresh Token Rate Limiter
 */
const refreshTokenLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // ⏱️ 10 دقائق
  max: 20, // ⛔ أقصى عدد محاولات تحديث
  message: {
    error: "Too many refresh attempts. Please wait a few minutes before retrying."
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // ✅ نربط المحاولات إما بـ refresh token ID أو الـ IP
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    return token ? `refresh_${token.slice(0, 20)}` : getRealIP(req);
  },
  handler: (req, res, next, options) => {
    const ip = getRealIP(req);
    const userAgent = req.headers["user-agent"] || "unknown";
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    // 📢 تنبيه خاص بمحاولات refresh الزائدة
    sendTelegramAlert(
      `♻️ Refresh Token Limit Reached\nToken: ${token ? token.slice(0, 30) + '...' : 'N/A'}\nIP: ${ip}`,
      ip,
      userAgent
    );

    console.warn(`Refresh token rate limit hit: IP=${ip} | URL=${req.url}`);
    res.status(429).json(options.message);
  }
});

module.exports = {
  limiter,
  loginLimiter,
  registerLimiter,
  refreshTokenLimiter, // ✅ تمت إضافته هنا
};
