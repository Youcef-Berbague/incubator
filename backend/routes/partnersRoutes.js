const express = require("express");
const router = express.Router();
const verifyRoles = require("../middlewares/verifyRoles");
const ROLES = require("../config/rolesList");
const {
  getAllPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
} = require("../controllers/partnersController");

// Socio-Economic Partner routes (public reads, SuperAdmin writes)
router.get("/partners", getAllPartners);
router.get("/partners/:id", getPartnerById);

const verifyJWT = require("../middlewares/verifyJWT");

router.use(verifyJWT);
router.post("/partners", verifyRoles(ROLES.superAdmin), createPartner);
router.put("/partners/:id", verifyRoles(ROLES.superAdmin), updatePartner);
router.delete("/partners/:id", verifyRoles(ROLES.superAdmin), deletePartner);

module.exports = router;
