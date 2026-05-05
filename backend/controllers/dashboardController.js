const { prisma } = require("../config/db");
const ROLES = require("../config/rolesList");
const { getAccessibleProjects } = require("../models/projectsModels");
const {
  getRegistrationByParticipantEmail,
} = require("../models/registrationModels");
const { getUserByID } = require("../models/UsersModels");

const roleLabel = (roles = []) => {
  const roleArray = Array.isArray(roles) ? roles : [roles].filter(Boolean);
  if (roleArray.includes(ROLES.superAdmin)) return "superAdmin";
  if (roleArray.includes(ROLES.admin)) return "admin";
  if (roleArray.includes(ROLES.coach)) return "coach";
  if (roleArray.includes(ROLES.supervisor)) return "supervisor";
  if (roleArray.includes(ROLES.student)) return "student";
  return "guest";
};

const buildAdminSummary = async () => {
  const [
    totalUsers,
    totalProjects,
    totalRegistrations,
    pendingRegistrations,
    approvedRegistrations,
    rejectedRegistrations,
    totalJuries,
    totalFaculties,
    totalDepartments,
    totalLocations,
    totalPartners,
    totalFAQs,
    recentProjects,
    recentRegistrations,
  ] = await Promise.all([
    prisma.users.count(),
    prisma.project.count(),
    prisma.project_registrations.count(),
    prisma.project_registrations.count({ where: { status: "pending" } }),
    prisma.project_registrations.count({ where: { status: "approved" } }),
    prisma.project_registrations.count({ where: { status: "rejected" } }),
    prisma.jury.count(),
    prisma.faculties.count(),
    prisma.departements.count(),
    prisma.locations.count(),
    prisma.socio_economic_partner.count(),
    prisma.faq.count(),
    prisma.project.findMany({
      take: 5,
      orderBy: { id: "desc" },
      select: {
        id: true,
        title: true,
        project_code: true,
        progress_percent: true,
        incubated: true,
      },
    }),
    prisma.project_registrations.findMany({
      take: 5,
      orderBy: { submitted_at: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        submitted_at: true,
      },
    }),
  ]);

  return {
    role: "admin",
    counts: {
      totalUsers,
      totalProjects,
      totalRegistrations,
      pendingRegistrations,
      approvedRegistrations,
      rejectedRegistrations,
      totalJuries,
      totalFaculties,
      totalDepartments,
      totalLocations,
      totalPartners,
      totalFAQs,
    },
    recentProjects,
    recentRegistrations,
  };
};

const buildSupervisorOrCoachSummary = async (userId, roles) => {
  const user = await getUserByID(userId);
  const projects = await getAccessibleProjects(userId, roles);

  const latestRegistration = user?.email
    ? await getRegistrationByParticipantEmail(user.email)
    : null;

  return {
    role: roleLabel(roles),
    counts: {
      assignedProjects: projects.length,
      hasRegistration: Boolean(latestRegistration),
    },
    user,
    assignedProjects: projects,
    registration: latestRegistration
      ? {
          id: latestRegistration.id,
          title: latestRegistration.title,
          status: latestRegistration.status,
          submitted_at: latestRegistration.submitted_at,
        }
      : null,
  };
};

const buildStudentSummary = async (userId, roles) => {
  const user = await getUserByID(userId);
  const [projects, registration] = await Promise.all([
    getAccessibleProjects(userId, roles),
    user?.email ? getRegistrationByParticipantEmail(user.email) : null,
  ]);

  return {
    role: "student",
    user,
    counts: {
      assignedProjects: projects.length,
      hasRegistration: Boolean(registration),
    },
    projects,
    registration: registration
      ? {
          id: registration.id,
          title: registration.title,
          status: registration.status,
          submitted_at: registration.submitted_at,
        }
      : null,
  };
};

const getDashboardSummary = async (req, res) => {
  try {
    const roles = Array.isArray(req.roles)
      ? req.roles
      : [req.roles].filter(Boolean);
    if (roles.includes(ROLES.superAdmin) || roles.includes(ROLES.admin)) {
      return res.json({ success: true, data: await buildAdminSummary() });
    }

    if (roles.includes(ROLES.coach) || roles.includes(ROLES.supervisor)) {
      return res.json({
        success: true,
        data: await buildSupervisorOrCoachSummary(req.id, roles),
      });
    }

    if (roles.includes(ROLES.student)) {
      return res.json({
        success: true,
        data: await buildStudentSummary(req.id, roles),
      });
    }

    return res.json({
      success: true,
      data: {
        role: "guest",
        counts: {},
      },
    });
  } catch (error) {
    console.error("[dashboard] summary error", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard summary.",
      error: error.message,
    });
  }
};

const getRoleSnapshot = async (req, res) => {
  try {
    const roles = Array.isArray(req.roles)
      ? req.roles
      : [req.roles].filter(Boolean);
    const label = roleLabel(roles);
    return res.json({
      success: true,
      data: {
        role: label,
        roles,
        canManageUsers: roles.some(
          (role) => role === ROLES.admin || role === ROLES.superAdmin,
        ),
        canManageSystem: roles.includes(ROLES.superAdmin),
        canManageProjects: roles.some((role) =>
          [
            ROLES.superAdmin,
            ROLES.admin,
            ROLES.coach,
            ROLES.supervisor,
          ].includes(role),
        ),
        canSelfServe: roles.some((role) =>
          [
            ROLES.student,
            ROLES.supervisor,
            ROLES.coach,
            ROLES.admin,
            ROLES.superAdmin,
          ].includes(role),
        ),
      },
    });
  } catch (error) {
    console.error("[dashboard] role snapshot error", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load role snapshot.",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardSummary,
  getRoleSnapshot,
};
