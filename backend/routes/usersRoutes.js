const express = require("express");
const router = express.Router();
const verifyRoles = require("../middlewares/verifyRoles");
const ROLES = require("../config/rolesList");
const {
  getAll,
  createNew,
  updateuser,
  deleteuser,
  getuser,
  getMe,
  getAvailableRoles,
} = require("../controllers/usersController");

router.get("/me", getMe);
router.get(
  "/roles",
  verifyRoles(ROLES.admin, ROLES.superAdmin),
  getAvailableRoles
);

// داخل routes/UsersRoutes.js
router.get("/all", verifyRoles(ROLES.admin, ROLES.superAdmin), getAll);
router.post("/create", verifyRoles(ROLES.admin, ROLES.superAdmin), createNew);
router.put("/update", verifyRoles(ROLES.admin, ROLES.superAdmin), updateuser);
router.delete("/delete", verifyRoles(ROLES.superAdmin), deleteuser);
router.get("/:id", verifyRoles(ROLES.admin, ROLES.superAdmin), getuser);

module.exports = router;
