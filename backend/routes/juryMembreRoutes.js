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

// Matrix target: jury member management is SuperAdmin-only

// GET eligible users - SuperAdmin only
router.get(
  "/eligible-users",
  verifyRoles(ROLES_LIST.superAdmin),
  handleGetEligibleUsers
);

// GET all jury members - SuperAdmin only
router.get("/", verifyRoles(ROLES_LIST.superAdmin), handleGetAllJuryMembres);

// GET jury member by ID - SuperAdmin only
router.get("/:id", verifyRoles(ROLES_LIST.superAdmin), handleGetJuryMembreById);

// POST create jury member - SuperAdmin only
router.post("/", verifyRoles(ROLES_LIST.superAdmin), handleCreateJuryMembre);

// PUT update jury member - SuperAdmin only
router.put("/:id", verifyRoles(ROLES_LIST.superAdmin), handleUpdateJuryMembre);

// DELETE jury member - superAdmin only
router.delete(
  "/:id",
  verifyRoles(ROLES_LIST.superAdmin),
  handleDeleteJuryMembre
);

module.exports = router;
