const express = require("express");
const router = express.Router();
const verifyRoles = require("../middlewares/verifyRoles");
const ROLES = require("../config/rolesList");
const {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
} = require("../controllers/locationsController");
const verifyJWT = require("../middlewares/verifyJWT");

// Location routes (public reads, SuperAdmin writes)
router.get("/locations", getAllLocations);
router.get("/locations/:id", getLocationById);

router.use(verifyJWT);

router.post("/locations", verifyRoles(ROLES.superAdmin), createLocation);
router.put("/locations/:id", verifyRoles(ROLES.superAdmin), updateLocation);
router.delete("/locations/:id", verifyRoles(ROLES.superAdmin), deleteLocation);

module.exports = router;
