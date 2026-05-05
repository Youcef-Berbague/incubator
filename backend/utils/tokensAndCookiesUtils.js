const jwt = require("jsonwebtoken");
const getRealIP = require("./getRealIP");
const { addNewRefreshToken } = require("../models/tokensModels");
const { getUserRoles } = require("../models/UsersModels");
const { v4: uuid } = require("uuid");
const bcrypt = require("bcrypt");

const ACCESS_TOKEN_EXPIRE = "15m";
const REFRESH_TOKEN_EXPIRE = "7d";
const WRM_REFRESH_TOKEN_EXPIRE = "4h";
const REFRESH_COOKIE_AGE = 7 * 24 * 60 * 60 * 1000;
const WRM_REFRESH_COOKIE_AGE = 4 * 60 * 60 * 1000;

const isProduction = process.env.NODE_ENV === "production";
const normalizeSameSite = (value) => {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "strict") return "Strict";
  if (normalized === "none") return "None";
  return "Lax";
};
const configuredSameSite = normalizeSameSite(
  process.env.COOKIE_SAMESITE || (isProduction ? "Strict" : "Lax"),
);
const isSameSiteNone = configuredSameSite.toLowerCase() === "none";

const cookieOption = () => ({
  httpOnly: true,
  secure: isProduction || isSameSiteNone,
  sameSite: configuredSameSite,
});

const clearCookie = (res) => {
  res.clearCookie("jwt", {
    ...cookieOption(),
    maxAge: 0,
  });
};

const generateAccessToken = async (id) => {
  const roles = await getUserRoles(parseInt(id));

  return jwt.sign(
    {
      userInfos: {
        userId: id,
        roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRE }
  );
};

const generateRefreshToken = (user, rememberMe, tokenid) => {
  return jwt.sign(
    {
      userInfos: {
        userId: user.id,
      },
      id: tokenid,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: rememberMe ? REFRESH_TOKEN_EXPIRE : WRM_REFRESH_TOKEN_EXPIRE }
  );
};

const generateRefreshTokenCookie = (res, newRefreshToken, rememberMe) => {
  res.cookie("jwt", newRefreshToken, {
    ...cookieOption(),
    path: "/",
    maxAge: rememberMe ? REFRESH_COOKIE_AGE : WRM_REFRESH_COOKIE_AGE,
  });
};

const generateCookieAndSaveRefreshToken = async (user, rememberMe, fingerprint, req, res) => {
  const tokenid = uuid();

  const newRefreshToken = generateRefreshToken(user, rememberMe, tokenid);
  generateRefreshTokenCookie(res, newRefreshToken, rememberMe);
  const hashedToken = await bcrypt.hash(newRefreshToken, 10);

  // حفظ التوكن في DB
  const ip = getRealIP(req);
  const userAgent = req.headers["user-agent"] || "unknown";
  await addNewRefreshToken(
    user.id,
    hashedToken,
    ip,
    userAgent,
    tokenid,
    fingerprint,
    rememberMe,
    req
  );
};

module.exports = {
  ACCESS_TOKEN_EXPIRE,
  REFRESH_TOKEN_EXPIRE,
  REFRESH_COOKIE_AGE,
  WRM_REFRESH_TOKEN_EXPIRE,
  WRM_REFRESH_COOKIE_AGE,
  cookieOption,
  clearCookie,
  generateAccessToken,
  generateRefreshToken,
  generateRefreshTokenCookie,
  generateCookieAndSaveRefreshToken,
};
