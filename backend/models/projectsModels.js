const { prisma } = require("../config/db");

// Get all projects
const getAllProjects = async () => {
  try {
    const projects = await prisma.project.findMany({
      select: {
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
        pre_incubation_status_project_pre_incubation_statusTopre_incubation_status:
          {
            select: {
              id: true,
              status_name: true,
            },
          },
      },
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
      include: {
        departements: {
          include: {
            faculties: true,
          },
        },
        project_team: true,
        acceleration_status_project_acceleration_statusToacceleration_status: true,
        pre_incubation_status_project_pre_incubation_statusTopre_incubation_status: true,
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
              },
            },
          },
        },
      },
    });

    return project;
  } catch (error) {
    console.error("Error fetching project:", error);
    throw error;
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
};
