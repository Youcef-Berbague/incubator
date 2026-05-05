// middlewares/refreshOnRequest.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
  findUserByRefreshTokenId,
  deleteSingleRefreshToken,
  deleteAllRefreshTokens,
  incrementRequestCount,
} = require("../models/tokensModels");

const {
  generateCookieAndSaveRefreshToken,
  clearCookie,
} = require("../utils/tokensAndCookiesUtils");

const {
  getFingerPrint,
  getFingerprintSimilarity,
} = require("../utils/fingerprintUtils");
const { sendTelegramAlert } = require("../config/notifier");
const getRealIp = require("../utils/getRealIP");

// 🧠 refresh configs
const ROTATE_THRESHOLD_MS = parseInt(
  process.env.ROTATE_THRESHOLD_MS || "86400000",
  10,
); // 24h

const ROTATE_AFTER_N_REQUESTS = parseInt(
  process.env.ROTATE_AFTER_N_REQUESTS || "50",
  10,
);

const PROBABILISTIC_ROTATE_PERCENT = parseFloat(
  process.env.PROB_ROTATE_PCT || "0",
);

const FINGERPRINT_MIN_SIMILARITY = parseFloat(
  process.env.FINGERPRINT_MIN_SIMILARITY || "70",
);

const FINGERPRINT_SOFT_FAIL = String(
  process.env.FINGERPRINT_SOFT_FAIL ?? "true",
).toLowerCase() === "true";

const getRefreshTokenTimeLeft = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded?.exp) return null;
    return decoded.exp * 1000 - Date.now();
  } catch {
    return null;
  }
};

const refreshOnRequest = (options = {}) => {
  return async (req, res, next) => {
    try {
      if (req.path?.startsWith("/api/auth/")) return next();

      const cookies = req.cookies;
      if (!cookies?.jwt) return next();
      const oldRefreshToken = cookies.jwt;

      // compute IP and UA once for all alerts
      const ip = getRealIp(req) || "";
      const ua = req.headers["user-agent"] || "";

      // 🧩 step 1: checking the health of the jwt token
      let decoded;
      try {
        decoded = jwt.decode(oldRefreshToken);
      } catch {
        await sendTelegramAlert(
          `🔴 محاولة تمرير Refresh Token غير قابل للفك\nURL: ${
            req.originalUrl || req.url
          }\n`,
          ip,
          ua,
        );
        clearCookie(res);
        return next();
      }
      if (!decoded?.id) return next();

      // 🧩 المرحلة 2: التحقق من وجود سجل في قاعدة البيانات
      const tokenRecord = await findUserByRefreshTokenId(decoded.id);
      if (!tokenRecord) {
        // Likely concurrent request during token rotation; do not clear cookie here.
        console.warn(
          "[refreshOnRequest] refresh token id not found (possible concurrent rotation):",
          decoded.id,
        );
        return next();
      }

      // 🧩 المرحلة 3: فحص بصمة الجهاز (fingerprint)
      const currentFp = getFingerPrint(req);
      const { similarity } = getFingerprintSimilarity(
        currentFp,
        tokenRecord.fingerprint,
        {},
      );

      if (similarity < FINGERPRINT_MIN_SIMILARITY) {
        await sendTelegramAlert(
          `🚨 محاولة استخدام Refresh Token من جهاز مختلف!\nuserId: ${
            tokenRecord.user_id
          }\nsimilarity: ${similarity}%\n\nStoredFingerprint:\n\n ${JSON.stringify(
            tokenRecord.fingerprint || {},
          )}\n\n CurrentFingerprint:\n\n ${JSON.stringify(
            currentFp || {},
          )} \n\n`,
          ip,
          ua,
        );

        if (!FINGERPRINT_SOFT_FAIL) {
          await deleteSingleRefreshToken(tokenRecord.uuid);
          clearCookie(res);
          return next();
        }

        console.warn(
          `[refreshOnRequest] low fingerprint similarity (${similarity}%), soft-fail enabled`,
        );
      }

      // 🧩 المرحلة 4: التحقق من سلامة التوقيع JWT
      let payload;
      try {
        payload = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET);
      } catch (err) {
        await deleteSingleRefreshToken(tokenRecord.uuid);
        await sendTelegramAlert(
          `🔴 Refresh Token غير صالح (توقيع مزيف)\nuserId: ${tokenRecord.user_id}\nreason: ${err.message}\n`,
          ip,
          ua,
        );
        clearCookie(res);
        return next();
      }

      // 🧩 المرحلة 5: مقارنة المستخدم بين الـ payload و DB
      if (
        !tokenRecord.users ||
        tokenRecord.users.id !== payload.userInfos.userId
      ) {
        await deleteAllRefreshTokens(
          payload.userInfos?.userId || tokenRecord.user_id,
        );
        await sendTelegramAlert(
          `⚠️ محاولة انتحال هوية (User Mismatch)\ntokenUser: ${
            payload.userInfos?.userId || "N/A"
          }\ndbUser: ${tokenRecord.user_id}\n`,
          ip,
          ua,
        );
        clearCookie(res);
        return next();
      }

      // 🧩 المرحلة 6: التحقق من الـ hash
      const isMatch = await bcrypt.compare(oldRefreshToken, tokenRecord.token);
      if (!isMatch) {
        await deleteSingleRefreshToken(tokenRecord.uuid);
        await sendTelegramAlert(
          `🔴 محاولة استخدام Refresh Token غير مطابق (هاش مزور)\nuserId: ${tokenRecord.user_id}\n`,
          ip,
          ua,
        );
        clearCookie(res);
        return next();
      }

      // 🧩 المرحلة 7: احتساب الوقت المتبقي ودورات التحديث
      const timeLeftMs = getRefreshTokenTimeLeft(oldRefreshToken);
      const shouldRotateByTTL =
        timeLeftMs !== null && timeLeftMs < ROTATE_THRESHOLD_MS;
      const shouldRotateByRequests =
        tokenRecord.request_count >= ROTATE_AFTER_N_REQUESTS;
      const shouldRotateByProb = Math.random() < PROBABILISTIC_ROTATE_PERCENT;

      // تحديث عداد الطلبات (لو موجود)
      await incrementRequestCount(tokenRecord.uuid);

      // 🧩 المرحلة 8: تنفيذ الدوران (Rotation)
      if (shouldRotateByTTL || shouldRotateByRequests || shouldRotateByProb) {
        const fingerprint = currentFp || tokenRecord.fingerprint;
        try {
          await generateCookieAndSaveRefreshToken(
            tokenRecord.users,
            !!tokenRecord.remembreme,
            fingerprint,
            req,
            res,
          );

          await deleteSingleRefreshToken(tokenRecord.uuid);
        } catch (e) {
          console.error("[refreshOnRequest] rotation failed", e);
          // Keep existing cookie if rotation fails to avoid forced logout.
        }
      }

      next();
    } catch (err) {
      console.error("[refreshOnRequest] error", err);
      return next();
    }
  };
};

module.exports = refreshOnRequest;
