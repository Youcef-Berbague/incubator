const {
  findUserByRefreshTokenId,
  deleteAllRefreshTokens,
  deleteSingleRefreshToken,
} = require("../models/tokensModels");

const {
  clearCookie,
  generateCookieAndSaveRefreshToken,
} = require("../utils/tokensAndCookiesUtils");

const { getFingerPrint } = require("../utils/fingerprintUtils");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const handleRefreshToken = async (req, res) => {
  try {
    const cookies = req.cookies;

    // Validate required fields
    if (!cookies?.jwt) {
      return res.sendStatus(401);
    }

    const oldRefreshToken = cookies.jwt;

    clearCookie(res);

    // فك التوكن لمعرفة الـ id (الـ uuid المحفوظ داخل الـ payload)
    let decoded;
    try {
      decoded = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      return res.sendStatus(403);
    }

    const tokenRecord = await findUserByRefreshTokenId(decoded.id);

    // detected refresh token reuse !!!!!!
    if (!tokenRecord) {
      jwt.verify(
        oldRefreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
          if (err) return res.sendStatus(403);
          else {
            // حذف جميع التوكنات الخاصة بالمستخدم بسبب اكتشاف استخدام غير مصرح
            await deleteAllRefreshTokens(decoded.userInfos.userId);
          }
        }
      );
      return res.sendStatus(403);
    }

    // التحقق من تطابق الـ JWT الأصلي مع الـ hash الموجود في قاعدة البيانات
    const isMatch = await bcrypt.compare(oldRefreshToken, tokenRecord.token);
    if (!isMatch) {
      await deleteAllRefreshTokens(tokenRecord.user_id);
      return res.sendStatus(403);
    }

    const user = tokenRecord.users;
    const rememberMe = tokenRecord.remembreme;

    // Check the token validity
    jwt.verify(
      oldRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decodedPayload) => {
        if (err) {
          await deleteSingleRefreshToken(oldRefreshToken);
        }

        if (err || user.id !== decodedPayload.userInfos.userId) {
          return res.sendStatus(403);
        }

        const fingerprint = getFingerPrint(req);

        await deleteSingleRefreshToken(decoded.id);
        await generateCookieAndSaveRefreshToken(
          user,
          rememberMe,
          fingerprint,
          req,
          res
        );

        return res.status(200).json({
          status: "success",
          message: "Refresh token refreshed successfully",
        });
      }
    );
  } catch (error) {
    console.error("[handleRefreshToken]", error);
    return res.sendStatus(500);
  }
};

module.exports = { handleRefreshToken };
