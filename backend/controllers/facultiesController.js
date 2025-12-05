const {
  getAllFaculties: getAllFacultiesModel,
  getFacultyById: getFacultyByIdModel,
  getAllDepartments: getAllDepartmentsModel,
  getDepartmentById: getDepartmentByIdModel,
  getDepartmentsByFacultyId,
  createFaculty: createFacultyModel,
  updateFaculty: updateFacultyModel,
  deleteFaculty: deleteFacultyModel,
  createDepartment: createDepartmentModel,
  updateDepartment: updateDepartmentModel,
  deleteDepartment: deleteDepartmentModel,
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

// Create a new faculty
const createFaculty = async (req, res) => {
  const { faculty_name, faculty_name_en } = req.body;

  if (!faculty_name) {
    return res.status(400).json({
      success: false,
      message: "Faculty name is required.",
    });
  }

  try {
    const newFaculty = await createFacultyModel({
      faculty_name,
      faculty_name_en,
    });

    res.status(201).json({
      success: true,
      message: "Faculty created successfully",
      data: newFaculty,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error creating faculty.",
    });
  }
};

// Update a faculty
const updateFaculty = async (req, res) => {
  const facultyId = parseInt(req.params.id);
  const { faculty_name, faculty_name_en } = req.body;

  if (isNaN(facultyId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid faculty ID.",
    });
  }

  if (!faculty_name) {
    return res.status(400).json({
      success: false,
      message: "Faculty name is required.",
    });
  }

  try {
    const updatedFaculty = await updateFacultyModel(facultyId, {
      faculty_name,
      faculty_name_en,
    });

    res.json({
      success: true,
      message: "Faculty updated successfully",
      data: updatedFaculty,
    });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error updating faculty.",
    });
  }
};

// Delete a faculty
const deleteFaculty = async (req, res) => {
  const facultyId = parseInt(req.params.id);

  if (isNaN(facultyId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid faculty ID.",
    });
  }

  try {
    await deleteFacultyModel(facultyId);
    res.json({
      success: true,
      message: "Faculty deleted successfully",
    });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }
    if (err.code === "P2003") {
      return res.status(409).json({
        success: false,
        message: "Cannot delete faculty. It has associated departments.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error deleting faculty.",
    });
  }
};

// Create a new department
const createDepartment = async (req, res) => {
  const { departement_name, departement_name_en, faculty_id } = req.body;

  if (!departement_name || !faculty_id) {
    return res.status(400).json({
      success: false,
      message: "Department name and faculty ID are required.",
    });
  }

  try {
    const newDepartment = await createDepartmentModel({
      departement_name,
      departement_name_en,
      faculty_id: parseInt(faculty_id),
    });

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: newDepartment,
    });
  } catch (err) {
    console.error(err);
    if (err.code === "P2003") {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error creating department.",
    });
  }
};

// Update a department
const updateDepartment = async (req, res) => {
  const departmentId = parseInt(req.params.id);
  const { departement_name, departement_name_en, faculty_id } = req.body;

  if (isNaN(departmentId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid department ID.",
    });
  }

  if (!departement_name || !faculty_id) {
    return res.status(400).json({
      success: false,
      message: "Department name and faculty ID are required.",
    });
  }

  try {
    const updatedDepartment = await updateDepartmentModel(departmentId, {
      departement_name,
      departement_name_en,
      faculty_id: parseInt(faculty_id),
    });

    res.json({
      success: true,
      message: "Department updated successfully",
      data: updatedDepartment,
    });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Department not found.",
      });
    }
    if (err.code === "P2003") {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error updating department.",
    });
  }
};

// Delete a department
const deleteDepartment = async (req, res) => {
  const departmentId = parseInt(req.params.id);

  if (isNaN(departmentId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid department ID.",
    });
  }

  try {
    await deleteDepartmentModel(departmentId);
    res.json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Department not found.",
      });
    }
    if (err.code === "P2003") {
      return res.status(409).json({
        success: false,
        message: "Cannot delete department. It has associated records.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error deleting department.",
    });
  }
};

module.exports = {
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
};
