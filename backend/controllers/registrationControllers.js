// controllers/registrationControllers.js
const {
  createRegistration,
  getAllRegistrations,
  getRegistrationById,
  updateRegistrationStatus,
  deleteRegistration,
  verifyFacultyExists,
  verifyDepartmentBelongsToFaculty,
  checkDuplicateTitle,
  createApprovedProject,
} = require("../models/registrationModels");
const { sendTelegramAlert } = require("../config/notifier");

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  if (!email) return true; // Email is optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate academic level
 */
const isValidAcademicLevel = (level) => {
  const validLevels = ["L1", "L2", "L3", "M1", "M2", "PhD"];
  return validLevels.includes(level);
};

/**
 * Validate name (letters, spaces, hyphens, apostrophes only)
 */
const isValidName = (name) => {
  if (!name || name.length < 2 || name.length > 100) return false;
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
  return nameRegex.test(name);
};

/**
 * Create new project registration
 * POST /api/projects/register
 */
const createNewRegistration = async (req, res) => {
  try {
    const {
      projectTitle,
      numberOfStudents,
      numberOfSupervisors,
      facultyId,
      departmentId,
      students,
      supervisors,
    } = req.body;

    // Validation errors array
    const errors = [];

    // Validate project title
    if (!projectTitle || projectTitle.trim().length < 5) {
      errors.push({
        field: "projectTitle",
        message: "Project title must be at least 5 characters",
      });
    }
    if (projectTitle && projectTitle.trim().length > 255) {
      errors.push({
        field: "projectTitle",
        message: "Project title must not exceed 255 characters",
      });
    }

    // Validate number of students
    if (!numberOfStudents || numberOfStudents < 1 || numberOfStudents > 6) {
      errors.push({
        field: "numberOfStudents",
        message: "Number of students must be between 1 and 6",
      });
    }

    // Validate number of supervisors
    if (
      !numberOfSupervisors ||
      numberOfSupervisors < 1 ||
      numberOfSupervisors > 3
    ) {
      errors.push({
        field: "numberOfSupervisors",
        message: "Number of supervisors must be between 1 and 3",
      });
    }

    // Validate students array length matches numberOfStudents
    if (!students || students.length !== numberOfStudents) {
      errors.push({
        field: "students",
        message: "Students array length must match numberOfStudents",
      });
    }

    // Validate supervisors array length matches numberOfSupervisors
    if (!supervisors || supervisors.length !== numberOfSupervisors) {
      errors.push({
        field: "supervisors",
        message: "Supervisors array length must match numberOfSupervisors",
      });
    }

    // Validate faculty and department IDs
    if (!facultyId) {
      errors.push({
        field: "facultyId",
        message: "Faculty ID is required",
      });
    }

    if (!departmentId) {
      errors.push({
        field: "departmentId",
        message: "Department ID is required",
      });
    }

    // Validate each student
    if (students && Array.isArray(students)) {
      students.forEach((student, index) => {
        if (!student.firstName || !isValidName(student.firstName)) {
          errors.push({
            field: `students[${index}].firstName`,
            message: "Invalid first name (2-100 letters only)",
          });
        }
        if (!student.lastName || !isValidName(student.lastName)) {
          errors.push({
            field: `students[${index}].lastName`,
            message: "Invalid last name (2-100 letters only)",
          });
        }
        if (!student.email) {
          errors.push({
            field: `students[${index}].email`,
            message: "Email is required",
          });
        } else if (!isValidEmail(student.email)) {
          errors.push({
            field: `students[${index}].email`,
            message: "Invalid email format",
          });
        }
        if (!student.academicLevel) {
          errors.push({
            field: `students[${index}].academicLevel`,
            message: "Academic level is required",
          });
        } else if (!isValidAcademicLevel(student.academicLevel)) {
          errors.push({
            field: `students[${index}].academicLevel`,
            message:
              "Invalid academic level (must be L1, L2, L3, M1, M2, or PhD)",
          });
        }
      });

      // Check for duplicate emails within students
      const studentEmails = students.map((s) => s.email).filter((e) => e);
      const duplicateStudentEmails = studentEmails.filter(
        (email, index) => studentEmails.indexOf(email) !== index
      );
      if (duplicateStudentEmails.length > 0) {
        errors.push({
          field: "students",
          message: `Duplicate student emails found: ${duplicateStudentEmails.join(
            ", "
          )}`,
        });
      }
    }

    // Validate each supervisor
    if (supervisors && Array.isArray(supervisors)) {
      supervisors.forEach((supervisor, index) => {
        if (!supervisor.firstName || !isValidName(supervisor.firstName)) {
          errors.push({
            field: `supervisors[${index}].firstName`,
            message: "Invalid first name (2-100 letters only)",
          });
        }
        if (!supervisor.lastName || !isValidName(supervisor.lastName)) {
          errors.push({
            field: `supervisors[${index}].lastName`,
            message: "Invalid last name (2-100 letters only)",
          });
        }
        if (!supervisor.email) {
          errors.push({
            field: `supervisors[${index}].email`,
            message: "Email is required",
          });
        } else if (!isValidEmail(supervisor.email)) {
          errors.push({
            field: `supervisors[${index}].email`,
            message: "Invalid email format",
          });
        }
      });

      // Check for duplicate emails within supervisors
      const supervisorEmails = supervisors.map((s) => s.email).filter((e) => e);
      const duplicateSupervisorEmails = supervisorEmails.filter(
        (email, index) => supervisorEmails.indexOf(email) !== index
      );
      if (duplicateSupervisorEmails.length > 0) {
        errors.push({
          field: "supervisors",
          message: `Duplicate supervisor emails found: ${duplicateSupervisorEmails.join(
            ", "
          )}`,
        });
      }
    }

    // Return validation errors if any
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    // Verify faculty exists
    const facultyExists = await verifyFacultyExists(facultyId);
    if (!facultyExists) {
      return res.status(404).json({
        success: false,
        message: "Faculty or department not found",
        error: `The selected faculty ID (${facultyId}) does not exist`,
      });
    }

    // Verify department exists and belongs to faculty
    const departmentValid = await verifyDepartmentBelongsToFaculty(
      departmentId,
      facultyId
    );
    if (!departmentValid) {
      return res.status(404).json({
        success: false,
        message: "Faculty or department not found",
        error: `The selected department ID (${departmentId}) does not belong to faculty ID (${facultyId})`,
      });
    }

    // Check for duplicate project title (optional warning)
    const isDuplicate = await checkDuplicateTitle(projectTitle, facultyId);
    if (isDuplicate) {
      return res.status(409).json({
        success: false,
        message: "Duplicate registration detected",
        error: "A project with this title already exists for this faculty",
      });
    }

    // Create registration with students and supervisors
    const registration = await createRegistration({
      title: projectTitle.trim(),
      facultyId,
      departementId: departmentId,
      students,
      supervisors,
    });

    // Return success response
    return res.status(201).json({
      success: true,
      message: "Project registration submitted successfully",
      data: {
        registrationId: registration.id,
        projectTitle: registration.title,
        status: registration.status,
        submittedAt: registration.submitted_at,
      },
    });
  } catch (error) {
    console.error("Error creating registration:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create registration",
      error: "Internal server error",
    });
  }
};

/**
 * Get all registrations with filters
 * GET /api/registrations?status=pending&facultyId=1&page=1&limit=10
 */
const getAll = async (req, res) => {
  try {
    const { status, facultyId, departmentId, page, limit } = req.query;

    const result = await getAllRegistrations({
      status,
      facultyId,
      departementId: departmentId,
      page,
      limit,
    });

    // Format response
    const formattedRegistrations = result.registrations.map((reg) => ({
      id: reg.id,
      projectTitle: reg.title,
      status: reg.status,
      submittedAt: reg.submitted_at,
      faculty: reg.faculties
        ? {
            id: reg.faculties.id,
            name: reg.faculties.faculty_name,
            nameEn: reg.faculties.faculty_name_en,
          }
        : null,
      department: reg.departements
        ? {
            id: reg.departements.id,
            name: reg.departements.departement_name,
            nameEn: reg.departements.departement_name_en,
          }
        : null,
      numberOfStudents: reg.registration_students.length,
      numberOfSupervisors: reg.registration_supervisors.length,
    }));

    return res.json({
      success: true,
      data: {
        registrations: formattedRegistrations,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch registrations",
      error: "Internal server error",
    });
  }
};

/**
 * Get single registration by ID
 * GET /api/registrations/:id
 */
const getOne = async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await getRegistrationById(id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
        error: `Registration with ID ${id} does not exist`,
      });
    }

    // Format response
    const formattedData = {
      id: registration.id,
      projectTitle: registration.title,
      status: registration.status,
      submittedAt: registration.submitted_at,
      faculty: registration.faculties
        ? {
            id: registration.faculties.id,
            name: registration.faculties.faculty_name,
            nameEn: registration.faculties.faculty_name_en,
          }
        : null,
      department: registration.departements
        ? {
            id: registration.departements.id,
            name: registration.departements.departement_name,
            nameEn: registration.departements.departement_name_en,
          }
        : null,
      students: registration.registration_students.map((student) => ({
        id: student.id,
        firstName: student.first_name,
        lastName: student.last_name,
        email: student.email,
        phone: student.phone,
        academicLevel: student.academic_level,
      })),
      supervisors: registration.registration_supervisors.map((supervisor) => ({
        id: supervisor.id,
        firstName: supervisor.first_name,
        lastName: supervisor.last_name,
        email: supervisor.email,
        phone: supervisor.phone,
      })),
    };

    return res.json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error("Error fetching registration:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch registration",
      error: "Internal server error",
    });
  }
};

/**
 * Update registration status
 * PATCH /api/registrations/:id/status
 */
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewerNotes } = req.body;

    // Validate status
    const validStatuses = [
      "pending",
      "in_review",
      "approved",
      "rejected",
      "revision_required",
      "withdrawn",
    ];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: [
          {
            field: "status",
            message: `Invalid status. Must be one of: ${validStatuses.join(
              ", "
            )}`,
          },
        ],
      });
    }

    // Check if registration exists
    const existingRegistration = await getRegistrationById(id);
    if (!existingRegistration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
        error: `Registration with ID ${id} does not exist`,
      });
    }

    // Prevent re-approval of already approved registrations
    if (status === "approved" && existingRegistration.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "Registration is already approved",
        error: "Cannot approve an already approved registration",
      });
    }

    // Update status
    const updatedRegistration = await updateRegistrationStatus(
      id,
      status,
      reviewerNotes
    );

    // If status is "approved", create project and users
    if (status === "approved") {
      try {
        const result = await createApprovedProject(id);

        // Send Telegram notification with credentials
        let notificationMessage = `✅ *Project Approved & Created*\n\n`;
        notificationMessage += `*Project:* ${existingRegistration.title}\n`;
        notificationMessage += `*Project ID:* ${result.project.id}\n`;
        notificationMessage += `*Team ID:* ${result.projectTeam.id}\n\n`;
        notificationMessage += `*User Credentials Created:*\n\n`;

        result.userCredentials.forEach((cred, index) => {
          notificationMessage += `${index + 1}\\. *${cred.type}:* ${
            cred.name
          }\n`;
          notificationMessage += `   📧 Email: ${cred.email}\n`;
          notificationMessage += `   🔑 Password: \`${cred.password}\`\n\n`;
        });

        notificationMessage += `⚠️ *Important:* These passwords are shown only once\\. Please save them securely\\.\n`;

        // Send notification without IP/UA (this is an admin action)
        await sendTelegramAlert(notificationMessage);

        return res.json({
          success: true,
          message: "Registration approved and project created successfully",
          data: {
            id: updatedRegistration.id,
            status: updatedRegistration.status,
            projectId: result.project.id,
            teamId: result.projectTeam.id,
            usersCreated: result.userCredentials.length,
            credentials: result.userCredentials, // Return credentials in response too
          },
        });
      } catch (approvalError) {
        console.error("Error creating approved project:", approvalError);

        // Rollback status update if project creation fails
        await updateRegistrationStatus(id, existingRegistration.status);

        return res.status(500).json({
          success: false,
          message: "Failed to create project after approval",
          error: approvalError.message,
        });
      }
    }

    return res.json({
      success: true,
      message: "Registration status updated successfully",
      data: {
        id: updatedRegistration.id,
        status: updatedRegistration.status,
      },
    });
  } catch (error) {
    console.error("Error updating registration status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update registration status",
      error: "Internal server error",
    });
  }
};

/**
 * Delete registration
 * DELETE /api/registrations/:id
 */
const deleteOne = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if registration exists
    const existingRegistration = await getRegistrationById(id);
    if (!existingRegistration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
        error: `Registration with ID ${id} does not exist`,
      });
    }

    // Delete registration (cascade will delete students and supervisors)
    await deleteRegistration(id);

    return res.json({
      success: true,
      message: "Registration deleted successfully",
      data: {
        id: parseInt(id),
      },
    });
  } catch (error) {
    console.error("Error deleting registration:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete registration",
      error: "Internal server error",
    });
  }
};

module.exports = {
  createNewRegistration,
  getAll,
  getOne,
  updateStatus,
  deleteOne,
};
