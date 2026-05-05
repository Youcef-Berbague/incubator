// routes/registrationRoutes.js
const express = require("express");
const router = express.Router();
const { registerLimiter } = require("../config/limiterConfig");
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
// Protect public registration endpoint from spam
router.post("/projects/register", registerLimiter, createNewRegistration);

// Apply JWT verification to all routes below (protected routes)
router.use(verifyJWT);

/**
 * Protected routes - Require authentication
 */
router.get(
  "/registrations",
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
  verifyRoles(ROLES.superAdmin),
  deleteOne
);

module.exports = router;
