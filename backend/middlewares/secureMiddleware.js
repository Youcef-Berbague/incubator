const path = require("path");
const { logEvents } = require("./logEvents");
const { sendTelegramAlert } = require("../config/notifier");
const getRealIP = require("../utils/getRealIP");

const blockedFiles = [
  ".env",
  "server.js",
  "db.js",
  "package.json",
  "package-lock.json",
  ".git",
  ".vscode",
  "config.js",
  "logs",
  "logEvents.js",
  ".gitignore",
];

const forbiddenExt = [
  ".js",
  ".ts",
  ".json",
  ".env",
  ".sql",
  ".db",
  ".log",
  ".gitignore",
  ".prisma",
];
const sensitiveRoutes = [
  "/config",
  "/controllers",
  "/middlewares",
  "/logs",
  "/models",
  "/node_modules",
  "/utils",
  "/prisma",
  "/public",
  "/views",
  "/routes",
  "/views",
];

const suspiciousAgents = [
  "curl",
  "wget",
  "httpclient",
  "httrack",
  "theHarvester",
  "python",
  "go-http",
  "axios",
  "node-fetch",
  "php",
  "perl",
  "libwww",
  "scrapy",
  "java",
  "powershell",
  "httpie",
  "okhttp",
  "restsharp",
  "http-request",
  "sqlmap",
  "nmap",
  "masscan",
  "nikto",
  "dirbuster",
  "gobuster",
  "wpscan",
  "zaproxy",
  "burp",
  "fuzz",
  "scanner",
  "metasploit",
  "acunetix",
  "nessus",
  "hydra",
  "sqlninja",
  "rat",
  "netcat",
  "hackbar",
  "cobalt",
  "intruder",
  "fierce",
  "recon-ng",
  "whatweb",
  "arachni",
];

const temporaryBan = new Map();
const ipAttempts = new Map();
const ATTEMPT_LIMIT = 5;
const BAN_DURATION = 15 * 60 * 1000;
const ATTEMPT_RESET_TIME = 15 * 60 * 1000;

const handleSuspiciousActivity = async (ip, userAgent) => {
  let record = ipAttempts.get(ip);

  if (!record) {
    record = { count: 1, timer: null };
    ipAttempts.set(ip, record);

    record.timer = setTimeout(() => {
      ipAttempts.delete(ip);
    }, ATTEMPT_RESET_TIME);
  } else {
    record.count += 1;
  }

  if (record.count >= ATTEMPT_LIMIT) {
    await sendTelegramAlert(
      `⚠️ Repeated suspicious activity detected (${record.count}x)`,
      ip,
      userAgent
    );
    ipAttempts.delete(ip);
    temporaryBan.set(ip, true);

    setTimeout(() => {
      temporaryBan.delete(ip);
    }, BAN_DURATION);
  }
};

const secureMiddleware = async (req, res, next) => {
  const url = req.url.toLowerCase();
  const pathname = (req.path || "").toLowerCase();
  const base = path.basename(url);
  const ip = getRealIP(req);
  const userAgent = req.headers["user-agent"] || "unknown";

  // Allow application API routes. Authorization and validation are handled
  // by dedicated middleware/controllers.
  if (pathname.startsWith("/api/")) {
    return next();
  }

  const hasForbiddenExt = forbiddenExt.some((ext) => url.endsWith(ext));
  const isBlockedByName = blockedFiles.some((file) => url.includes(file));
  const isDotFile = base.startsWith(".");
  const isSensitivePage = sensitiveRoutes.some((route) =>
    url.startsWith(route)
  );
  const isBotAgent = suspiciousAgents.some((agent) =>
    userAgent.toLowerCase().includes(agent)
  );

  const isSuspicious =
    isBotAgent ||
    isSensitivePage ||
    isDotFile ||
    isBlockedByName ||
    hasForbiddenExt;

  if (temporaryBan.has(ip)) {
    return res.status(403).json({ message: "blocked" });
  }

  if (isSuspicious) {
    // تسجيل في اللوج
    logEvents(
      `Unauthorized access attempt!\n🔗 URL: ${url}\n🌍 IP: ${ip}\nUA: ${userAgent}`,
      "securityLog.txt"
    );

    // تنبيه على التلغرام
    await sendTelegramAlert(
      `🚫 Unauthorized access attempt!\n🔗 URL: ${url}`,
      ip,
      userAgent
    );

    // التعامل مع عدد المحاولات
    let record = ipAttempts.get(ip);
    if (!record) {
      record = { count: 1, timer: null };
      ipAttempts.set(ip, record);

      record.timer = setTimeout(() => {
        ipAttempts.delete(ip);
      }, ATTEMPT_RESET_TIME);
    } else {
      record.count += 1;
    }

    if (record.count >= ATTEMPT_LIMIT) {
      await sendTelegramAlert(
        `⚠️ Repeated suspicious activity detected (${record.count}x)`,
        ip,
        userAgent
      );
      ipAttempts.delete(ip);
      temporaryBan.set(ip, true);

      setTimeout(() => {
        temporaryBan.delete(ip);
      }, BAN_DURATION);

      return res.status(403).json({ message: "blocked" });
    }

    return res.status(404).json({ message: "not found" });
  }

  next();
};

module.exports = { secureMiddleware, handleSuspiciousActivity };
