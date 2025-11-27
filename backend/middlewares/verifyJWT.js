const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const accessToken = req.accessToken;

  

  if (!accessToken) {
    return res.sendStatus(401); // غير مصرح له
  }

  jwt.verify(
    accessToken, 
    process.env.ACCESS_TOKEN_SECRET, 
    (err, decoded) => {
    if (err) {
      return res.sendStatus(403);
    }

    req.id = decoded.userInfos.userId;
    req.roles = decoded.userInfos.roles; 
    next();
  });
};

module.exports = verifyJWT;
