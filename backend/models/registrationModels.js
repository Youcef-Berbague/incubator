// models/registrationModels.js
const { prisma } = require("../config/db");

/**
 * Create a new project registration with students and supervisors
 * Uses transaction to ensure data consistency
 */
const createRegistration = async (registrationData) => {
  const { title, facultyId, departementId, students, supervisors } =
    registrationData;

  return await prisma.$transaction(async (tx) => {
    // Create the main registration
    const registration = await tx.project_registrations.create({
      data: {
        title,
        faculty_id: facultyId,
        departement_id: departementId,
        status: "pending",
      },
    });

    // Create students with proper order
    const studentsData = students.map((student, index) => ({
      registration_id: registration.id,
      first_name: student.firstName,
      last_name: student.lastName,
      email: student.email || null,
      phone: student.phone || null,
      academic_level: student.academicLevel,
    }));

    await tx.registration_students.createMany({
      data: studentsData,
    });

    // Create supervisors with proper order
    const supervisorsData = supervisors.map((supervisor, index) => ({
      registration_id: registration.id,
      first_name: supervisor.firstName,
      last_name: supervisor.lastName,
      email: supervisor.email || null,
      phone: supervisor.phone || null,
    }));

    await tx.registration_supervisors.createMany({
      data: supervisorsData,
    });

    return registration;
  });
};

/**
 * Get all registrations with optional filters and pagination
 */
const getAllRegistrations = async (filters = {}) => {
  const { status, facultyId, departementId, page = 1, limit = 10 } = filters;

  const skip = (page - 1) * limit;
  const take = parseInt(limit);

  // Build where clause
  const where = {};
  if (status) where.status = status;
  if (facultyId) where.faculty_id = parseInt(facultyId);
  if (departementId) where.departement_id = parseInt(departementId);

  const [registrations, total] = await Promise.all([
    prisma.project_registrations.findMany({
      where,
      skip,
      take,
      include: {
        faculties: {
          select: {
            id: true,
            faculty_name: true,
            faculty_name_en: true,
          },
        },
        departements: {
          select: {
            id: true,
            departement_name: true,
            departement_name_en: true,
          },
        },
        registration_students: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
            academic_level: true,
          },
        },
        registration_supervisors: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        submitted_at: "desc",
      },
    }),
    prisma.project_registrations.count({ where }),
  ]);

  return {
    registrations,
    total,
    page: parseInt(page),
    limit: take,
    totalPages: Math.ceil(total / take),
  };
};

/**
 * Get a single registration by ID with all related data
 */
const getRegistrationById = async (id) => {
  return await prisma.project_registrations.findUnique({
    where: { id: parseInt(id) },
    include: {
      faculties: {
        select: {
          id: true,
          faculty_name: true,
          faculty_name_en: true,
        },
      },
      departements: {
        select: {
          id: true,
          departement_name: true,
          departement_name_en: true,
        },
      },
      registration_students: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone: true,
          academic_level: true,
        },
      },
      registration_supervisors: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone: true,
        },
      },
    },
  });
};

/**
 * Update registration status
 */
const updateRegistrationStatus = async (id, status, reviewerNotes = null) => {
  return await prisma.project_registrations.update({
    where: { id: parseInt(id) },
    data: {
      status,
      // Note: reviewer_notes field doesn't exist in schema, skipping it
    },
  });
};

/**
 * Delete a registration (cascading delete will remove students and supervisors)
 */
const deleteRegistration = async (id) => {
  return await prisma.project_registrations.delete({
    where: { id: parseInt(id) },
  });
};

/**
 * Verify faculty exists
 */
const verifyFacultyExists = async (facultyId) => {
  const faculty = await prisma.faculties.findUnique({
    where: { id: parseInt(facultyId) },
  });
  return faculty !== null;
};

/**
 * Verify department exists and belongs to faculty
 */
const verifyDepartmentBelongsToFaculty = async (departementId, facultyId) => {
  const department = await prisma.departements.findFirst({
    where: {
      id: parseInt(departementId),
      faculty_id: parseInt(facultyId),
    },
  });
  return department !== null;
};

/**
 * Check for duplicate project title in same faculty
 */
const checkDuplicateTitle = async (title, facultyId) => {
  const existing = await prisma.project_registrations.findFirst({
    where: {
      title: title.trim(),
      faculty_id: parseInt(facultyId),
    },
  });
  return existing !== null;
};

module.exports = {
  createRegistration,
  getAllRegistrations,
  getRegistrationById,
  updateRegistrationStatus,
  deleteRegistration,
  verifyFacultyExists,
  verifyDepartmentBelongsToFaculty,
  checkDuplicateTitle,
};
