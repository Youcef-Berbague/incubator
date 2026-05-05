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

// Matrix target: jury management is SuperAdmin-only

// GET all juries - SuperAdmin only
router.get("/", verifyRoles(ROLES_LIST.superAdmin), handleGetAllJuries);

// GET jury by ID - SuperAdmin only
router.get("/:id", verifyRoles(ROLES_LIST.superAdmin), handleGetJuryById);

// POST create jury - SuperAdmin only
router.post("/", verifyRoles(ROLES_LIST.superAdmin), handleCreateJury);

// PUT update jury - SuperAdmin only
router.put("/:id", verifyRoles(ROLES_LIST.superAdmin), handleUpdateJury);

// DELETE jury - SuperAdmin only
router.delete("/:id", verifyRoles(ROLES_LIST.superAdmin), handleDeleteJury);

// GET jury members - SuperAdmin only
router.get(
  "/:juryId/members",
  verifyRoles(ROLES_LIST.superAdmin),
  handleGetJuryMembers
);

// POST assign member to jury - SuperAdmin only
router.post(
  "/:juryId/members/:memberId",
  verifyRoles(ROLES_LIST.superAdmin),
  handleAssignMemberToJury
);

// DELETE remove member from jury - SuperAdmin only
router.delete(
  "/:juryId/members/:memberId",
  verifyRoles(ROLES_LIST.superAdmin),
  handleRemoveMemberFromJury
);

// POST assign projects to jury - SuperAdmin only
router.post(
  "/:juryId/projects",
  verifyRoles(ROLES_LIST.superAdmin),
  handleAssignProjectsToJury
);

module.exports = router;
