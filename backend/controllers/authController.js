const bcrypt = require("bcrypt");
const { findUserByEmail } = require("../models/UsersModels");
const { deleteSingleRefreshToken } = require("../models/tokensModels");
const {
  clearCookie,
  generateCookieAndSaveRefreshToken,
} = require("../utils/tokensAndCookiesUtils");
const { getFingerPrint } = require("../utils/fingerprintUtils");

const jwt = require("jsonwebtoken");

const handleLogin = async (req, res) => {
  const cookies = req.cookies;
  const { email, password, rememberMe } = req.body;

  const fingerprint = getFingerPrint(req);

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: "User not found." });
  }

  // Compare password with password field in database
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid password try again." });
  }

  // في حالة عندو jwt قديم نمسحو
  if (cookies?.jwt) {
    try {
      const decoded = jwt.verify(cookies.jwt, process.env.REFRESH_TOKEN_SECRET);
      await deleteSingleRefreshToken(decoded.id);
    } catch (err) {
      console.error("[handleLogin] Invalid or expired refresh token");
    } finally {
      clearCookie(res);
    }
  }

  await generateCookieAndSaveRefreshToken(
    user,
    rememberMe,
    fingerprint,
    req,
    res
  );

  // الرد على الواجهة بدون accessToken
  return res.status(200).json({
    status: "success",
    message: "Login with success",
  });
};

module.exports = { handleLogin };
