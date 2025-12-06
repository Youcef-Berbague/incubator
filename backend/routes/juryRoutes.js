const express = require("express");
const router = express.Router();
const {
  handleGetAllJuries,
  handleGetJuryById,
  handleCreateJury,
  handleUpdateJury,
  handleDeleteJury,
  handleAssignMemberToJury,
  handleRemoveMemberFromJury,
  handleGetJuryMembers,
  handleAssignProjectsToJury,
} = require("../controllers/juryController");
const verifyJWT = require("../middlewares/verifyJWT");
const verifyRoles = require("../middlewares/verifyRoles");
const ROLES_LIST = require("../config/rolesList");

// All routes require authentication
router.use(verifyJWT);

// GET all juries - SuperAdmin, Admin
router.get(
  "/",
  verifyRoles(ROLES_LIST.superAdmin, ROLES_LIST.admin),
  handleGetAllJuries
);

// GET jury by ID - SuperAdmin, Admin
router.get(
  "/:id",
  verifyRoles(ROLES_LIST.superAdmin, ROLES_LIST.admin),
  handleGetJuryById
);

// POST create jury - SuperAdmin, Admin
router.post(
  "/",
  verifyRoles(ROLES_LIST.superAdmin, ROLES_LIST.admin),
  handleCreateJury
);

// PUT update jury - SuperAdmin, Admin
router.put(
  "/:id",
  verifyRoles(ROLES_LIST.superAdmin, ROLES_LIST.admin),
  handleUpdateJury
);

// DELETE jury - SuperAdmin only
router.delete("/:id", verifyRoles(ROLES_LIST.superAdmin), handleDeleteJury);

// GET jury members - SuperAdmin, Admin
router.get(
  "/:juryId/members",
  verifyRoles(ROLES_LIST.superAdmin, ROLES_LIST.admin),
  handleGetJuryMembers
);

// POST assign member to jury - SuperAdmin, Admin
router.post(
  "/:juryId/members/:memberId",
  verifyRoles(ROLES_LIST.superAdmin, ROLES_LIST.admin),
  handleAssignMemberToJury
);

// DELETE remove member from jury - SuperAdmin, Admin
router.delete(
  "/:juryId/members/:memberId",
  verifyRoles(ROLES_LIST.superAdmin, ROLES_LIST.admin),
  handleRemoveMemberFromJury
);

// POST assign projects to jury - SuperAdmin, Admin
router.post(
  "/:juryId/projects",
  verifyRoles(ROLES_LIST.superAdmin, ROLES_LIST.admin),
  handleAssignProjectsToJury
);

module.exports = router;
