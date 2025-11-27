const { format } = require("date-fns");
const { v4: uuid } = require("uuid");
const { promises: fsPromises, existsSync } = require("fs");
const path = require("path");
const whitelist = require("../config/allowedOrigins");
const { sendTelegramAlert } = require("../config/notifier");

const logsDir = path.join(__dirname, "..", "logs");

const ensureLogsDirExists = async () => {
  if (!existsSync(logsDir)) {
    await fsPromises.mkdir(logsDir, { recursive: true });
  }
};

const lastRequests = new Map();

const logEvents = async (message, logName) => {
  const key = `${message}-${Date.now()}`;
  if (!lastRequests.has(key)) {
    lastRequests.set(key, true);
    setTimeout(() => lastRequests.delete(key), 3000);

    try {
      await ensureLogsDirExists();

      const dateTime = format(new Date(), "yyyy-MM-dd\tHH:mm:ss");
      const logItem = `[${dateTime}]\t${uuid()}\t${message}\n`;

      await fsPromises.appendFile(path.join(logsDir, logName), logItem);
    } catch (err) {
      console.error("[Logger Error]", err);
    }
  }
};

const logger = (req, res, next) => {
  const getRealIP = require("../utils/getRealIP");
  const ip = getRealIP(req);
  const origin = req.headers.origin || "no-origin";
  const logMessage = `${req.method}\t${ip}\t${origin}\t${req.url}`;

  // تسجيل دائم لكل الطلبات
  logEvents(logMessage, "reqLog.txt");

  // تسجيل إضافي إذا origin غير موجود في whitelist
  if (origin !== "no-origin" && !whitelist.includes(origin)) {
    logEvents(`❌ Unauthorized origin: ${origin}\t${logMessage}`, "unauthorizedReqLog.txt");

    // تنبيه تيليجرام (اختياري)
    sendTelegramAlert(
      `🚨 Unauthorized request detected!\nOrigin: ${origin}\nURL: ${req.url}`,
      ip,
      req.headers["user-agent"] || "unknown"
    );
  }

  next();
};

module.exports = { logger, logEvents };
