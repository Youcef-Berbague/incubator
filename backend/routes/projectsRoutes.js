const express = require("express");
const router = express.Router();
const {
  handleGetAllProjects,
  handleGetProjectById,
  handleGetMyProjects,
  handleCreateProject,
  handleUpdateProject,
  handleDeleteProject,
  handleUpdateProjectStatus,
  handleAssignSupervisorToProject,
  handleRemoveSupervisorFromProject,
} = require("../controllers/projectsController");
const { validateCreateProject } = require("../middlewares/validators");
const verifyJWT = require("../middlewares/verifyJWT");
const verifyRoles = require("../middlewares/verifyRoles");
const ROLES_LIST = require("../config/rolesList");

// All routes require authentication
router.use(verifyJWT);

router.get("/mine", handleGetMyProjects);

// @route   GET /api/projects
// @desc    Get all projects
// @access  Private (SuperAdmin, Admin, Coach, Supervisor)
router.get(
  "/",
  verifyRoles(
    ROLES_LIST.superAdmin,
    ROLES_LIST.admin,
    ROLES_LIST.coach,
    ROLES_LIST.supervisor
  ),
  handleGetAllProjects
);

router.post(
  "/",
  verifyRoles(ROLES_LIST.superAdmin, ROLES_LIST.admin),
  validateCreateProject,
  handleCreateProject
);

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Private (SuperAdmin, Admin, Coach, Supervisor)
router.get(
  "/:id",
  verifyRoles(
    ROLES_LIST.superAdmin,
    ROLES_LIST.admin,
    ROLES_LIST.coach,
    ROLES_LIST.supervisor
  ),
  handleGetProjectById
);

router.put(
  "/:id",
  verifyRoles(ROLES_LIST.superAdmin, ROLES_LIST.admin),
  handleUpdateProject
);

router.patch(
  "/:id/status",
  verifyRoles(
    ROLES_LIST.superAdmin,
    ROLES_LIST.admin,
    ROLES_LIST.coach,
    ROLES_LIST.supervisor
  ),
  handleUpdateProjectStatus
);

router.post(
  "/:id/supervisors/:supervisorId",
  verifyRoles(ROLES_LIST.superAdmin, ROLES_LIST.admin),
  handleAssignSupervisorToProject
);

router.delete(
  "/:id/supervisors/:supervisorId",
  verifyRoles(ROLES_LIST.superAdmin, ROLES_LIST.admin),
  handleRemoveSupervisorFromProject
);

router.delete(
  "/:id",
  verifyRoles(ROLES_LIST.superAdmin, ROLES_LIST.admin),
  handleDeleteProject
);

module.exports = router;
