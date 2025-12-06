const express = require("express");
const router = express.Router();
const {
  handleGetAllJuryMembreRoles,
  handleGetJuryMembreRoleById,
  handleCreateJuryMembreRole,
  handleUpdateJuryMembreRole,
  handleDeleteJuryMembreRole,
} = require("../controllers/juryMembreRoleController");
const verifyJWT = require("../middlewares/verifyJWT");
const verifyRoles = require("../middlewares/verifyRoles");
const ROLES_LIST = require("../config/rolesList");

// All routes require authentication
router.use(verifyJWT);

// GET all jury member roles - SuperAdmin, Admin
router.get(
  "/",
  verifyRoles(ROLES_LIST.superAdmin, ROLES_LIST.admin),
  handleGetAllJuryMembreRoles
);

// GET jury member role by ID - SuperAdmin, Admin
router.get(
  "/:id",
  verifyRoles(ROLES_LIST.superAdmin, ROLES_LIST.admin),
  handleGetJuryMembreRoleById
);

// POST create jury member role - SuperAdmin only
router.post(
  "/",
  verifyRoles(ROLES_LIST.superAdmin),
  handleCreateJuryMembreRole
);

// PUT update jury member role - SuperAdmin only
router.put(
  "/:id",
  verifyRoles(ROLES_LIST.superAdmin),
  handleUpdateJuryMembreRole
);

// DELETE jury member role - SuperAdmin only
router.delete(
  "/:id",
  verifyRoles(ROLES_LIST.superAdmin),
  handleDeleteJuryMembreRole
);

module.exports = router;
