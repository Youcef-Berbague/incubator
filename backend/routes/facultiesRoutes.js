const express = require("express");
const router = express.Router();
const {
  getAllFaculties,
  getFacultyById,
  getAllDepartments,
  getDepartmentById,
  getDepartmentsByFaculty,
} = require("../controllers/facultiesController");

// Faculty routes
router.get("/faculties", getAllFaculties);
router.get("/faculties/:id", getFacultyById);
router.get("/faculties/:facultyId/departments", getDepartmentsByFaculty);

// Department routes
router.get("/departments", getAllDepartments);
router.get("/departments/:id", getDepartmentById);

module.exports = router;
