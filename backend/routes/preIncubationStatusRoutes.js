const express = require("express");
const router = express.Router();
const verifyRoles = require("../middlewares/verifyRoles");
const ROLES = require("../config/rolesList");
const {
  getAllPreIncubationStatuses,
  getPreIncubationStatusById,
  createPreIncubationStatus,
  updatePreIncubationStatus,
  deletePreIncubationStatus,
} = require("../controllers/preIncubationStatusController");
const verifyJWT = require("../middlewares/verifyJWT");

// Pre-Incubation Status routes (public reads, SuperAdmin writes)
router.get("/pre-incubation-statuses", getAllPreIncubationStatuses);
router.get("/pre-incubation-statuses/:id", getPreIncubationStatusById);

router.use(verifyJWT);

router.post(
  "/pre-incubation-statuses",
  verifyRoles(ROLES.superAdmin),
  createPreIncubationStatus
);
router.put(
  "/pre-incubation-statuses/:id",
  verifyRoles(ROLES.superAdmin),
  updatePreIncubationStatus
);
router.delete(
  "/pre-incubation-statuses/:id",
  verifyRoles(ROLES.superAdmin),
  deletePreIncubationStatus
);

module.exports = router;
