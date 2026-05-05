const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");
const verifyRoles = require("../middlewares/verifyRoles");
const ROLES = require("../config/rolesList");
const {
  getDashboardSummary,
  getRoleSnapshot,
} = require("../controllers/dashboardController");

router.use(verifyJWT);

router.get(
  "/summary",
  verifyRoles(
    ROLES.student,
    ROLES.supervisor,
    ROLES.coach,
    ROLES.admin,
    ROLES.superAdmin,
  ),
  getDashboardSummary,
);
router.get(
  "/role",
  verifyRoles(
    ROLES.student,
    ROLES.supervisor,
    ROLES.coach,
    ROLES.admin,
    ROLES.superAdmin,
  ),
  getRoleSnapshot,
);

module.exports = router;
