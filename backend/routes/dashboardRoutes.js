const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");
const {
  getDashboardSummary,
  getRoleSnapshot,
} = require("../controllers/dashboardController");

router.use(verifyJWT);

router.get("/summary", getDashboardSummary);
router.get("/role", getRoleSnapshot);

module.exports = router;
