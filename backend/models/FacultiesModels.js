const { prisma } = require("../config/db");

// Get all faculties with their departments
const getAllFaculties = async () => {
  return await prisma.faculties.findMany({
    include: {
      departements: {
        select: {
          id: true,
          departement_name: true,
        },
      },
    },
    orderBy: {
      faculty_name: "asc",
    },
  });
};

// Get a single faculty by ID with its departments
const getFacultyById = async (facultyId) => {
  return await prisma.faculties.findUnique({
    where: {
      id: facultyId,
    },
    include: {
      departements: {
        select: {
          id: true,
          departement_name: true,
        },
      },
    },
  });
};

// Get all departments with their faculty information
const getAllDepartments = async () => {
  return await prisma.departements.findMany({
    include: {
      faculties: {
        select: {
          id: true,
          faculty_name: true,
        },
      },
    },
    orderBy: {
      departement_name: "asc",
    },
  });
};

// Get a single department by ID with its faculty information
const getDepartmentById = async (departmentId) => {
  return await prisma.departements.findUnique({
    where: {
      id: departmentId,
    },
    include: {
      faculties: {
        select: {
          id: true,
          faculty_name: true,
        },
      },
    },
  });
};

// Get departments by faculty ID
const getDepartmentsByFacultyId = async (facultyId) => {
  return await prisma.departements.findMany({
    where: {
      faculty_id: facultyId,
    },
    select: {
      id: true,
      departement_name: true,
      departement_name_en: true,
      faculty_id: true,
    },
    orderBy: {
      departement_name: "asc",
    },
  });
};

// Create a new faculty
const createFaculty = async (facultyData) => {
  return await prisma.faculties.create({
    data: {
      faculty_name: facultyData.faculty_name,
      faculty_name_en: facultyData.faculty_name_en || null,
    },
  });
};

// Update a faculty
const updateFaculty = async (facultyId, facultyData) => {
  return await prisma.faculties.update({
    where: { id: facultyId },
    data: {
      faculty_name: facultyData.faculty_name,
      faculty_name_en: facultyData.faculty_name_en || null,
    },
  });
};

// Delete a faculty
const deleteFaculty = async (facultyId) => {
  return await prisma.faculties.delete({
    where: { id: facultyId },
  });
};

// Create a new department
const createDepartment = async (departmentData) => {
  return await prisma.departements.create({
    data: {
      departement_name: departmentData.departement_name,
      departement_name_en: departmentData.departement_name_en || null,
      faculty_id: departmentData.faculty_id,
    },
  });
};

// Update a department
const updateDepartment = async (departmentId, departmentData) => {
  return await prisma.departements.update({
    where: { id: departmentId },
    data: {
      departement_name: departmentData.departement_name,
      departement_name_en: departmentData.departement_name_en || null,
      faculty_id: departmentData.faculty_id,
    },
  });
};

// Delete a department
const deleteDepartment = async (departmentId) => {
  return await prisma.departements.delete({
    where: { id: departmentId },
  });
};

module.exports = {
  getAllFaculties,
  getFacultyById,
  getAllDepartments,
  getDepartmentById,
  getDepartmentsByFacultyId,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
