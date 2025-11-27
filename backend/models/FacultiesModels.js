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
      faculty_id: true,
    },
    orderBy: {
      departement_name: "asc",
    },
  });
};

module.exports = {
  getAllFaculties,
  getFacultyById,
  getAllDepartments,
  getDepartmentById,
  getDepartmentsByFacultyId,
};
