// middlewares/optionalJwt.js
const jwt = require("jsonwebtoken");
const { generateAccessToken } = require("../utils/tokensAndCookiesUtils");
const ROLES = require("../config/rolesList");

const optionalJWT = async (req, res, next) => {
  try {
    // ✅ استخدم التوكن الجديد في نفس الطلب (في حال حدث دوران للتوكن)
    const refreshToken = req.cookies?.jwt;
    if (!refreshToken) {
      req.roles = ROLES.guest;
      req.accessToken = null;
      return next();
    }

    // 🧩 تحقق من صحة الـ JWT فقط (توقيع + صلاحية)
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
      req.roles = ROLES.guest;
      req.accessToken = null;
      return next();
    }

    // ✅ توليد Access Token جديد في الواجهة الخلفية فقط
    const accessToken = await generateAccessToken(decoded.userInfos.userId);
    req.accessToken = accessToken;

    return next();
  } catch (err) {
    req.roles = ROLES.guest;
    req.accessToken = null;
    return next();
  }
};

module.exports = optionalJWT;
