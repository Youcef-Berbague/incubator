const jwt = require("jsonwebtoken");

// ✅ route جديد للتحقق من حالة المستخدم
const checkAuth = (req, res) => {
  const accessToken = req.accessToken;

  if (!accessToken) {
    return res.json({ authenticated: false });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded?.userInfos?.userId) {
      return res.json({ authenticated: false });
    }

    return res.json({ authenticated: true });
  } catch (err) {
    return res.json({ authenticated: false });
  }
};

module.exports = checkAuth;

