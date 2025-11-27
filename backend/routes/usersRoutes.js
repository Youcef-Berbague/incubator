const express = require("express");
const router = express.Router();
const verifyRoles = require("../middlewares/verifyRoles");
const ROLES = require("../config/rolesList");
const {
  getAll,
  updateuser,
  deleteuser,
  getuser,
  getMe
} = require("../controllers/usersController");

router.get("/me", getMe);

// داخل routes/UsersRoutes.js
router.get("/all", verifyRoles(ROLES.admin, ROLES.superAdmin), getAll);
router.put("/update", verifyRoles(ROLES.admin, ROLES.superAdmin), updateuser);
router.delete("/delete", verifyRoles(ROLES.superAdmin), deleteuser);
router.get("/:id", verifyRoles(ROLES.admin, ROLES.superAdmin), getuser);

module.exports = router;

