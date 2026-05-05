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

    // فك التوكن لمعرفة الـ id (الـ uuid المحفوظ داخل الـ payload)
    let decoded;
    try {
      decoded = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      clearCookie(res);
      return res.sendStatus(403);
    }

    const tokenRecord = await findUserByRefreshTokenId(decoded.id);

    // Token can be absent during concurrent rotation; do not revoke all sessions here.
    if (!tokenRecord) {
      console.warn(
        "[handleRefreshToken] token id not found (possible concurrent rotation):",
        decoded.id,
      );
      return res.status(409).json({
        status: "error",
        code: "REFRESH_TOKEN_RACE",
        message: "Refresh token rotation in progress. Retry request.",
      });
    }

    // التحقق من تطابق الـ JWT الأصلي مع الـ hash الموجود في قاعدة البيانات
    const isMatch = await bcrypt.compare(oldRefreshToken, tokenRecord.token);
    if (!isMatch) {
      await deleteAllRefreshTokens(tokenRecord.user_id);
      clearCookie(res);
      return res.sendStatus(403);
    }

    const user = tokenRecord.users;
    const rememberMe = tokenRecord.remembreme;

    if (!user || user.id !== decoded.userInfos?.userId) {
      await deleteSingleRefreshToken(decoded.id);
      clearCookie(res);
      return res.sendStatus(403);
    }

    clearCookie(res);

    const fingerprint = getFingerPrint(req);

    await deleteSingleRefreshToken(decoded.id);
    await generateCookieAndSaveRefreshToken(
      user,
      rememberMe,
      fingerprint,
      req,
      res,
    );

    return res.status(200).json({
      status: "success",
      message: "Refresh token refreshed successfully",
    });
  } catch (error) {
    console.error("[handleRefreshToken]", error);
    return res.sendStatus(500);
  }
};

module.exports = { handleRefreshToken };
