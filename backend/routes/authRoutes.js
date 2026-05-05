const express = require("express");
const { loginLimiter, registerLimiter, refreshTokenLimiter } = require("../config/limiterConfig");

const { handleLogin } = require("../controllers/authController");
const { handleLogout } = require("../controllers/logoutController");
const { handleRefreshToken } = require("../controllers/refreshTokenController");
const { handleNewUser } = require("../controllers/registerController");

const router = express.Router();

router.post("/login", loginLimiter, handleLogin);
router.post("/register", registerLimiter, handleNewUser);
router.post("/logout", refreshTokenLimiter, handleLogout);

router.get("/refresh", refreshTokenLimiter, handleRefreshToken);
router.get("/status", require("../controllers/userStatusController"));

module.exports = router;

