const express = require("express");
const router = express.Router();
const verifyRoles = require("../middlewares/verifyRoles");
const ROLES = require("../config/rolesList");
const {
  getAllAccelerationStatuses,
  getAccelerationStatusById,
  createAccelerationStatus,
  updateAccelerationStatus,
  deleteAccelerationStatus,
} = require("../controllers/accelerationStatusController");
const verifyJWT = require("../middlewares/verifyJWT");

// Acceleration Status routes (public reads, SuperAdmin writes)
router.get("/acceleration-statuses", getAllAccelerationStatuses);
router.get("/acceleration-statuses/:id", getAccelerationStatusById);

router.use(verifyJWT);

router.post(
  "/acceleration-statuses",
  verifyRoles(ROLES.superAdmin),
  createAccelerationStatus
);
router.put(
  "/acceleration-statuses/:id",
  verifyRoles(ROLES.superAdmin),
  updateAccelerationStatus
);
router.delete(
  "/acceleration-statuses/:id",
  verifyRoles(ROLES.superAdmin),
  deleteAccelerationStatus
);

module.exports = router;
