const express = require("express");
const router = express.Router();
const { chatWithAI } = require("../controllers/aiControllers");
const { aiLimiter } = require("../config/limiterConfig");

// Protect AI endpoint with a lightweight rate limiter (optional auth applied globally)
router.post("/chat", aiLimiter, chatWithAI);

module.exports = router;
