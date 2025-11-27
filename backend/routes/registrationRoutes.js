// routes/registrationRoutes.js
const express = require("express");
const router = express.Router();
const {
  createNewRegistration,
  getAll,
  getOne,
  updateStatus,
  deleteOne,
} = require("../controllers/registrationControllers");
const verifyJWT = require("../middlewares/verifyJWT");
const verifyRoles = require("../middlewares/verifyRoles");
const ROLES = require("../config/rolesList");

/**
 * Public route - Submit new project registration
 * POST /api/projects/register
 */
router.post("/projects/register", createNewRegistration);

/**
 * Protected routes - Require authentication
 */

/**
 * Get all registrations with optional filters
 * GET /api/registrations?status=pending&facultyId=1&page=1&limit=10
 * Requires: Admin or SuperAdmin role
 */
router.get(
  "/registrations",
  verifyJWT,
  verifyRoles(ROLES.admin, ROLES.superAdmin),
  getAll
);

/**
 * Get single registration by ID
 * GET /api/registrations/:id
 * Requires: Admin or SuperAdmin role
 */
router.get(
  "/registrations/:id",
  verifyJWT,
  verifyRoles(ROLES.admin, ROLES.superAdmin),
  getOne
);

/**
 * Update registration status
 * PATCH /api/registrations/:id/status
 * Requires: Admin or SuperAdmin role
 */
router.patch(
  "/registrations/:id/status",
  verifyJWT,
  verifyRoles(ROLES.admin, ROLES.superAdmin),
  updateStatus
);

/**
 * Delete registration
 * DELETE /api/registrations/:id
 * Requires: SuperAdmin role only
 */
router.delete(
  "/registrations/:id",
  verifyJWT,
  verifyRoles(ROLES.superAdmin),
  deleteOne
);

module.exports = router;
