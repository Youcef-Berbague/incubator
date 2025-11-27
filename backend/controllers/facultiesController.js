const {
  getAllFaculties: getAllFacultiesModel,
  getFacultyById: getFacultyByIdModel,
  getAllDepartments: getAllDepartmentsModel,
  getDepartmentById: getDepartmentByIdModel,
  getDepartmentsByFacultyId,
} = require("../models/FacultiesModels");

// Get all faculties with their departments
const getAllFaculties = async (req, res) => {
  try {
    const faculties = await getAllFacultiesModel();
    res.json(faculties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching faculties." });
  }
};

// Get a single faculty by ID with its departments
const getFacultyById = async (req, res) => {
  const facultyId = parseInt(req.params.id);

  if (isNaN(facultyId)) {
    return res.status(400).json({ message: "Invalid faculty ID." });
  }

  try {
    const faculty = await getFacultyByIdModel(facultyId);

    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found." });
    }

    res.json(faculty);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching faculty." });
  }
};

// Get all departments
const getAllDepartments = async (req, res) => {
  try {
    const departments = await getAllDepartmentsModel();
    res.json(departments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching departments." });
  }
};

// Get a single department by ID
const getDepartmentById = async (req, res) => {
  const departmentId = parseInt(req.params.id);

  if (isNaN(departmentId)) {
    return res.status(400).json({ message: "Invalid department ID." });
  }

  try {
    const department = await getDepartmentByIdModel(departmentId);

    if (!department) {
      return res.status(404).json({ message: "Department not found." });
    }

    res.json(department);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching department." });
  }
};

// Get departments by faculty ID
const getDepartmentsByFaculty = async (req, res) => {
  const facultyId = parseInt(req.params.facultyId);

  if (isNaN(facultyId)) {
    return res.status(400).json({ message: "Invalid faculty ID." });
  }

  try {
    const departments = await getDepartmentsByFacultyId(facultyId);
    res.json(departments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching departments." });
  }
};

module.exports = {
  getAllFaculties,
  getFacultyById,
  getAllDepartments,
  getDepartmentById,
  getDepartmentsByFaculty,
};
