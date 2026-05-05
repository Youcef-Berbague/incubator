const { prisma } = require("../config/db");
const ROLES = require("../config/rolesList");

const projectListSelect = {
  id: true,
  title: true,
  project_code: true,
  incubated: true,
  progress_percent: true,
  departements: {
    select: {
      id: true,
      departement_name: true,
      departement_name_en: true,
      faculties: {
        select: {
          id: true,
          faculty_name: true,
          faculty_name_en: true,
        },
      },
    },
  },
  project_team: {
    select: {
      id: true,
    },
  },
  acceleration_status_project_acceleration_statusToacceleration_status: {
    select: {
      id: true,
      acceleration_name: true,
    },
  },
  pre_incubation_status_project_pre_incubation_statusTopre_incubation_status: {
    select: {
      id: true,
      status_name: true,
    },
  },
};

const projectDetailInclude = {
  departements: {
    include: {
      faculties: true,
    },
  },
  project_team: true,
  acceleration_status_project_acceleration_statusToacceleration_status: true,
  pre_incubation_status_project_pre_incubation_statusTopre_incubation_status:
    true,
  jury_project: {
    include: {
      jury: true,
    },
  },
  supervising: {
    include: {
      users: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          role: true,
        },
      },
    },
  },
};

const toInt = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

// Get all projects
const getAllProjects = async () => {
  try {
    const projects = await prisma.project.findMany({
      select: projectListSelect,
      orderBy: {
        id: "desc",
      },
    });

    return projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

// Get project by ID
const getProjectById = async (id) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: projectDetailInclude,
    });

    return project;
  } catch (error) {
    console.error("Error fetching project:", error);
    throw error;
  }
};

const getAccessibleProjects = async (userId, roles = []) => {
  const roleArray = Array.isArray(roles) ? roles : [roles].filter(Boolean);

  if (
    roleArray.includes(ROLES.superAdmin) ||
    roleArray.includes(ROLES.admin)
  ) {
    return await getAllProjects();
  }

  const user = await prisma.users.findUnique({
    where: { id: parseInt(userId, 10) },
    select: {
      id: true,
      p_team_id: true,
      role: true,
    },
  });

  if (!user) return [];

  if (roleArray.includes(ROLES.supervisor) || roleArray.includes(ROLES.coach)) {
    return await prisma.project.findMany({
      where: {
        supervising: {
          some: {
            supervisor_id: user.id,
          },
        },
      },
      select: projectListSelect,
      orderBy: {
        id: "desc",
      },
    });
  }

  if (roleArray.includes(ROLES.student)) {
    if (!user.p_team_id) return [];
    return await prisma.project.findMany({
      where: { team_id: user.p_team_id },
      select: projectListSelect,
      orderBy: {
        id: "desc",
      },
    });
  }

  return [];
};

const createProject = async (data) => {
  const {
    title,
    project_code,
    finalpv,
    incubated,
    progress_percent,
    departement_id,
    pre_incubation_status,
    acceleration_status,
    team_id,
  } = data;

  return await prisma.project.create({
    data: {
      title,
      project_code: project_code || null,
      finalpv: finalpv || null,
      incubated: incubated === undefined ? null : incubated,
      progress_percent:
        progress_percent === undefined ? null : toInt(progress_percent),
      departement_id: parseInt(departement_id, 10),
      pre_incubation_status: toInt(pre_incubation_status),
      acceleration_status: toInt(acceleration_status),
      team_id: toInt(team_id),
    },
    include: projectDetailInclude,
  });
};

const updateProject = async (id, data) => {
  return await prisma.project.update({
    where: { id: parseInt(id, 10) },
    data,
    include: projectDetailInclude,
  });
};

const deleteProject = async (id) => {
  return await prisma.project.delete({
    where: { id: parseInt(id, 10) },
  });
};

const assignSupervisorToProject = async (projectId, supervisorId) => {
  return await prisma.supervising.create({
    data: {
      project_id: parseInt(projectId, 10),
      supervisor_id: parseInt(supervisorId, 10),
    },
  });
};

const removeSupervisorFromProject = async (projectId, supervisorId) => {
  return await prisma.supervising.deleteMany({
    where: {
      project_id: parseInt(projectId, 10),
      supervisor_id: parseInt(supervisorId, 10),
    },
  });
};

module.exports = {
  getAllProjects,
  getProjectById,
  getAccessibleProjects,
  createProject,
  updateProject,
  deleteProject,
  assignSupervisorToProject,
  removeSupervisorFromProject,
};
