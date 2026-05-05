const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");
const verifyRoles = require("../middlewares/verifyRoles");
const ROLES = require("../config/rolesList");
const {
  getAll,
  createNew,
  updateuser,
  deleteuser,
  getuser,
  getMe,
  updateMe,
  getMeProjects,
  getMeRegistration,
  getMeSummary,
  getAvailableRoles,
} = require("../controllers/usersController");

// Ensure all user routes require a valid access token (defense-in-depth)
router.use(verifyJWT);

router.get("/me", getMe);
router.get("/me/projects", getMeProjects);
router.get("/me/registration", getMeRegistration);
router.get("/me/summary", getMeSummary);
router.patch("/me", updateMe);
router.get(
  "/roles",
  verifyRoles(ROLES.admin, ROLES.superAdmin),
  getAvailableRoles
);

// داخل routes/UsersRoutes.js
router.get("/all", verifyRoles(ROLES.admin, ROLES.superAdmin), getAll);
const { validateCreateUser } = require("../middlewares/validators");

router.post(
  "/create",
  verifyRoles(ROLES.admin, ROLES.superAdmin),
  validateCreateUser,
  createNew,
);
router.put("/update", verifyRoles(ROLES.admin, ROLES.superAdmin), updateuser);
router.delete("/delete", verifyRoles(ROLES.superAdmin), deleteuser);
router.get("/:id", verifyRoles(ROLES.admin, ROLES.superAdmin), getuser);

module.exports = router;
