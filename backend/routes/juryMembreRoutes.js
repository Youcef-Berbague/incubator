const express = require("express");
const router = express.Router();
const {
  handleGetAllJuryMembres,
  handleGetJuryMembreById,
  handleCreateJuryMembre,
  handleUpdateJuryMembre,
  handleDeleteJuryMembre,
  handleGetEligibleUsers,
} = require("../controllers/juryMembreController");
const verifyJWT = require("../middlewares/verifyJWT");
const verifyRoles = require("../middlewares/verifyRoles");
const ROLES_LIST = require("../config/rolesList");

// All routes require authentication
router.use(verifyJWT);

// GET eligible users - superAdmin, Admin
router.get(
  "/eligible-users",
  verifyRoles(ROLES_LIST.superAdmin, ROLES_LIST.admin),
  handleGetEligibleUsers
);

// GET all jury members - superAdmin, Admin
router.get(
  "/",
  verifyRoles(ROLES_LIST.superAdmin, ROLES_LIST.admin),
  handleGetAllJuryMembres
);

// GET jury member by ID - superAdmin, Admin
router.get(
  "/:id",
  verifyRoles(ROLES_LIST.superAdmin, ROLES_LIST.admin),
  handleGetJuryMembreById
);

// POST create jury member - superAdmin, Admin
router.post(
  "/",
  verifyRoles(ROLES_LIST.superAdmin, ROLES_LIST.admin),
  handleCreateJuryMembre
);

// PUT update jury member - superAdmin, Admin
router.put(
  "/:id",
  verifyRoles(ROLES_LIST.superAdmin, ROLES_LIST.admin),
  handleUpdateJuryMembre
);

// DELETE jury member - superAdmin only
router.delete(
  "/:id",
  verifyRoles(ROLES_LIST.superAdmin),
  handleDeleteJuryMembre
);

module.exports = router;
