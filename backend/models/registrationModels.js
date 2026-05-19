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
const checkDuplicateTitle = async (title, facultyId, excludeId = null) => {
  const where = {
    title: title.trim(),
    faculty_id: parseInt(facultyId),
  };

  if (excludeId) {
    where.NOT = { id: parseInt(excludeId) };
  }

  const existing = await prisma.project_registrations.findFirst({ where });
  return existing !== null;
};

const findActiveRegistrationByStudentEmails = async (
  emails = [],
  activeStatuses = []
) => {
  if (!Array.isArray(emails) || emails.length === 0) return null;

  return await prisma.project_registrations.findFirst({
    where: {
      status: activeStatuses.length > 0 ? { in: activeStatuses } : undefined,
      registration_students: {
        some: {
          email: { in: emails },
        },
      },
    },
  });
};

const getRegistrationByParticipantEmail = async (email) => {
  return await prisma.project_registrations.findFirst({
    where: {
      OR: [
        {
          registration_students: {
            some: {
              email,
            },
          },
        },
        {
          registration_supervisors: {
            some: {
              email,
            },
          },
        },
      ],
    },
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

const updateRegistrationDetails = async (
  registrationId,
  { title, facultyId, departementId, students, supervisors }
) => {
  return await prisma.$transaction(async (tx) => {
    const registration = await tx.project_registrations.update({
      where: { id: parseInt(registrationId, 10) },
      data: {
        title: title.trim(),
        faculty_id: parseInt(facultyId, 10),
        departement_id: parseInt(departementId, 10),
      },
    });

    await tx.registration_students.deleteMany({
      where: { registration_id: registration.id },
    });
    await tx.registration_supervisors.deleteMany({
      where: { registration_id: registration.id },
    });

    if (Array.isArray(students) && students.length > 0) {
      await tx.registration_students.createMany({
        data: students.map((student) => ({
          registration_id: registration.id,
          first_name: student.firstName,
          last_name: student.lastName,
          email: student.email || null,
          phone: student.phone || null,
          academic_level: student.academicLevel,
        })),
      });
    }

    if (Array.isArray(supervisors) && supervisors.length > 0) {
      await tx.registration_supervisors.createMany({
        data: supervisors.map((supervisor) => ({
          registration_id: registration.id,
          first_name: supervisor.firstName,
          last_name: supervisor.lastName,
          email: supervisor.email || null,
          phone: supervisor.phone || null,
        })),
      });
    }

    return registration;
  });
};

/**
 * Generate random password (8 characters: letters + numbers)
 */
const generateRandomPassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

/**
 * Create approved project with all relationships
 * - Creates project in project table
 * - Creates project_team
 * - Creates users for students and supervisors
 * - Links students to team via p_team_id
 * - Links supervisors to project via supervising table
 */
const createApprovedProject = async (registrationId) => {
  const bcrypt = require("bcrypt");
  const ROLES = require("../config/rolesList");

  // Get full registration details
  const registration = await getRegistrationById(registrationId);
  if (!registration) {
    throw new Error("Registration not found");
  }

  const userCredentials = []; // Store plain passwords for notification

  return await prisma.$transaction(async (tx) => {
    // 1. Create project_team first
    const projectTeam = await tx.project_team.create({
      data: {},
    });

    // 2. Create the project
    const project = await tx.project.create({
      data: {
        title: registration.title,
        project_code: `PRJ-${Date.now()}-${registration.id}`,
        departement_id: registration.departement_id || null,
        team_id: projectTeam.id,
        incubated: true,
        progress_percent: 0,
      },
    });

    // 3. Create users for students and link to team
    for (const student of registration.registration_students) {
      const plainPassword = generateRandomPassword();
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const user = await tx.users.create({
        data: {
          first_name: student.first_name,
          last_name: student.last_name,
          email: student.email,
          phone_number:
            student.phone || `05${Math.floor(Math.random() * 100000000)}`,
          password: hashedPassword,
          role: [ROLES.student],
          academic_level: student.academic_level,
          p_team_id: projectTeam.id, // Link student to team
          status: "active",
        },
      });

      userCredentials.push({
        type: "Student",
        name: `${student.first_name} ${student.last_name}`,
        email: student.email,
        password: plainPassword,
      });
    }

    // 4. Create users for supervisors and link via supervising table
    for (const supervisor of registration.registration_supervisors) {
      const plainPassword = generateRandomPassword();
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const user = await tx.users.create({
        data: {
          first_name: supervisor.first_name,
          last_name: supervisor.last_name,
          email: supervisor.email,
          phone_number:
            supervisor.phone || `05${Math.floor(Math.random() * 100000000)}`,
          password: hashedPassword,
          role: [ROLES.supervisor],
          departement_id: registration.departements?.id || null,
          status: "active",
        },
      });

      // Link supervisor to project via supervising table
      await tx.supervising.create({
        data: {
          project_id: project.id,
          supervisor_id: user.id,
        },
      });

      userCredentials.push({
        type: "Supervisor",
        name: `${supervisor.first_name} ${supervisor.last_name}`,
        email: supervisor.email,
        password: plainPassword,
      });
    }

    return {
      project,
      projectTeam,
      userCredentials,
    };
  });
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
  findActiveRegistrationByStudentEmails,
  getRegistrationByParticipantEmail,
  updateRegistrationDetails,
  createApprovedProject,
};
