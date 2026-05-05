const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");
const verifyRoles = require("../middlewares/verifyRoles");
const ROLES = require("../config/rolesList");
const {
  getSystemConfig,
  updateSystemConfig,
  getAuditSummary,
  getAuditLog,
} = require("../controllers/systemController");

router.use(verifyJWT);
router.use(verifyRoles(ROLES.superAdmin));

router.get("/config", getSystemConfig);
router.patch("/config", updateSystemConfig);
router.get("/audit/summary", getAuditSummary);
router.get("/audit/logs", getAuditLog);

module.exports = router;
