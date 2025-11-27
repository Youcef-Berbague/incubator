const axios = require("axios");

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_PRINTYDZ_NOTIFIER;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const geoCache = new Map();
const GEO_CACHE_TTL = 60 * 60 * 1000; // ساعة واحدة

// دالة لتأمين MarkdownV2 من الأحرف التي تسبب أخطاء
function escapeMarkdownV2(text = "") {
  if (typeof text !== 'string') text = String(text);
  return text
    .replace(/\\/g, '\\\\') // يجب معالجتها أولًا
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/`/g, '\\`')
    .replace(/>/g, '\\>')
    .replace(/#/g, '\\#')
    .replace(/\+/g, '\\+')
    .replace(/-/g, '\\-')
    .replace(/=/g, '\\=')
    .replace(/\|/g, '\\|')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\./g, '\\.')
    .replace(/!/g, '\\!');
}

function isPublicIp(ip) {
  return ![
    /^127\.|^192\.168\.|^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^::1$|^::ffff:127\.|^::ffff:192\.168\.|^::ffff:10\.|^::ffff:172\.(1[6-9]|2[0-9]|3[0-1])\./
  ].some(regex => regex.test(ip));
}

// ✅ دالة إرسال التنبيه إلى Telegram
const sendTelegramAlert = async (message, ip = "", userAgent = "") => {
  if (!TELEGRAM_TOKEN || !CHAT_ID) return;

  try {
    let geoInfo = "";

    // فقط إذا كان IP عامًا ونظاميًا
    if (ip && isPublicIp(ip)) {
      if (geoCache.has(ip)) {
        geoInfo = geoCache.get(ip);
      } else {
        const { data } = await axios.get(`http://ip-api.com/json/${ip}`);
        if (data && data.status === "success") {
          const info = `🌐 ISP: ${escapeMarkdownV2(data.isp)}\n` +
                       `🏙️ City: ${escapeMarkdownV2(data.city)}, ${escapeMarkdownV2(data.country)}`;
          
          geoCache.set(ip, info);
          setTimeout(() => geoCache.delete(ip), GEO_CACHE_TTL); // حذف بعد انتهاء الصلاحية
          geoInfo = info;
        }
      }
    }

    const fullMessage =
      `🚨 *incubator Alert*\n` +
      `${escapeMarkdownV2(message)}\n` +
      (ip ? `*📍 IP:* ${escapeMarkdownV2(ip)}\n` : "") +
      (userAgent ? `*📱 UA:* ${escapeMarkdownV2(userAgent)}\n` : "") +
      (geoInfo ? `${geoInfo}` : "");

    await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: fullMessage,
      parse_mode: "MarkdownV2",
    });
  } catch (err) {
    console.error("[❌ Telegram Error]:", err.message);
  }
};

module.exports = { sendTelegramAlert };
