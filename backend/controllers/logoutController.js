// controllers/logoutController.js
const { deleteSingleRefreshToken, findUserByRefreshTokenId } = require("../models/tokensModels");
const { clearCookie } = require("../utils/tokensAndCookiesUtils");
const jwt = require("jsonwebtoken");

const handleLogout = async (req, res, next) => {
  try {
    const cookies = req.cookies;

    // لا يوجد refresh token -> لا محتوى
    if (!cookies?.jwt) {
      return res.sendStatus(204);
    }

    const refreshToken = cookies.jwt;

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // هل التوكن موجود في الـ DB؟
    const tokenOwner = await findUserByRefreshTokenId(decoded.id);

    // لو مش موجود: نمسح الكوكي ونرجع 204
    if (!tokenOwner) {
      clearCookie(res);
      return res.sendStatus(204);
    }

    // امسح التوكن المعروض فقط (logout من هذا الجهاز)
    await deleteSingleRefreshToken(decoded.id);

    // امسح الكوكي من العميل
    clearCookie(res);

    return res.sendStatus(204); // No Content
  } catch (err) {
    // مرر الخطأ إلى errorHandler المركزي
    return next(err);
  }
};

module.exports = { handleLogout };
