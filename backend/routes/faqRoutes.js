const express = require("express");
const router = express.Router();
const verifyRoles = require("../middlewares/verifyRoles");
const ROLES = require("../config/rolesList");
const {
  getAllFAQs,
  getActiveFAQs,
  getFAQById,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getFAQCategories,
} = require("../controllers/faqController");
const verifyJWT = require("../middlewares/verifyJWT");

// FAQ routes (public reads active FAQs, SuperAdmin manages all)
router.get("/faqs/active", getActiveFAQs); // Public endpoint for active FAQs
router.get("/faqs/categories", getFAQCategories); // Public endpoint for categories
router.get("/faqs", getAllFAQs); // Get all FAQs (with filters)
router.get("/faqs/:id", getFAQById);

router.use(verifyJWT);

router.post("/faqs", verifyRoles(ROLES.superAdmin), createFAQ);
router.put("/faqs/:id", verifyRoles(ROLES.superAdmin), updateFAQ);
router.delete("/faqs/:id", verifyRoles(ROLES.superAdmin), deleteFAQ);

module.exports = router;
