const express = require("express");
const router = express.Router();
const {
  handleGetAllProjects,
  handleGetProjectById,
} = require("../controllers/projectsController");
const verifyJWT = require("../middlewares/verifyJWT");
const verifyRoles = require("../middlewares/verifyRoles");
const ROLES_LIST = require("../config/rolesList");

// All routes require authentication
router.use(verifyJWT);

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

module.exports = router;
