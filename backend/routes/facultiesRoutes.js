const express = require("express");
const router = express.Router();
const verifyRoles = require("../middlewares/verifyRoles");
const ROLES = require("../config/rolesList");
const {
  getAllFaculties,
  getFacultyById,
  getAllDepartments,
  getDepartmentById,
  getDepartmentsByFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/facultiesController");
const verifyJWT = require("../middlewares/verifyJWT");

// Faculty routes (public reads, SuperAdmin writes)
router.get("/faculties", getAllFaculties);
router.get("/faculties/:id", getFacultyById);
router.get("/faculties/:facultyId/departments", getDepartmentsByFaculty);
router.get("/departments", getAllDepartments);
router.get("/departments/:id", getDepartmentById);

router.use(verifyJWT);

const { validateCreateFaculty } = require("../middlewares/validators");

router.post(
  "/faculties",
  verifyRoles(ROLES.superAdmin),
  validateCreateFaculty,
  createFaculty,
);
router.put("/faculties/:id", verifyRoles(ROLES.superAdmin), updateFaculty);
router.delete("/faculties/:id", verifyRoles(ROLES.superAdmin), deleteFaculty);

// Department routes (public reads, SuperAdmin writes)
router.post("/departments", verifyRoles(ROLES.superAdmin), createDepartment);
router.put("/departments/:id", verifyRoles(ROLES.superAdmin), updateDepartment);
router.delete(
  "/departments/:id",
  verifyRoles(ROLES.superAdmin),
  deleteDepartment
);

module.exports = router;
