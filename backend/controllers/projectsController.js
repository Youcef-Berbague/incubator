const {
  getAllProjects,
  getProjectById,
  getAccessibleProjects,
  createProject,
  updateProject,
  deleteProject,
  assignSupervisorToProject,
  removeSupervisorFromProject,
} = require("../models/projectsModels");
const { prisma } = require("../config/db");
const ROLES = require("../config/rolesList");

const isAdminLike = (roles = []) => {
  const roleArray = Array.isArray(roles) ? roles : [roles].filter(Boolean);
  return (
    roleArray.includes(ROLES.superAdmin) || roleArray.includes(ROLES.admin)
  );
};

// @desc Get all projects
// @route GET /api/projects
// @access Private (SuperAdmin, Admin)
const handleGetAllProjects = async (req, res) => {
  try {
    const projects = await getAccessibleProjects(req.id, req.roles);
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching projects",
      error: error.message,
    });
  }
};

const handleGetMyProjects = async (req, res) => {
  try {
    const projects = await getAccessibleProjects(req.id, req.roles);
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("Error fetching my projects:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching projects",
      error: error.message,
    });
  }
};

// @desc Get project by ID
// @route GET /api/projects/:id
// @access Private (SuperAdmin, Admin)
const handleGetProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const project = await getProjectById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching project",
      error: error.message,
    });
  }
};

const handleCreateProject = async (req, res) => {
  try {
    const { title, project_code, finalpv, incubated, progress_percent, departement_id, pre_incubation_status, acceleration_status, team_id } = req.body;

    if (!title || title.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Project title is required and must be at least 5 characters.",
      });
    }

    if (!departement_id) {
      return res.status(400).json({
        success: false,
        message: "Department ID is required.",
      });
    }

    const department = await prisma.departements.findUnique({
      where: { id: parseInt(departement_id, 10) },
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found.",
      });
    }

    const project = await createProject({
      title: title.trim(),
      project_code,
      finalpv,
      incubated,
      progress_percent,
      departement_id,
      pre_incubation_status,
      acceleration_status,
      team_id,
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating project",
      error: error.message,
    });
  }
};

const handleUpdateProject = async (req, res) => {
  try {
    const { id } = req.params;
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
    } = req.body;

    if (!id || isNaN(parseInt(id, 10))) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const existing = await getProjectById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const updateData = {};
    if (title !== undefined) {
      if (!title || title.trim().length < 5) {
        return res.status(400).json({
          success: false,
          message: "Project title must be at least 5 characters.",
        });
      }
      updateData.title = title.trim();
    }

    if (project_code !== undefined) updateData.project_code = project_code;
    if (finalpv !== undefined) updateData.finalpv = finalpv;
    if (incubated !== undefined) updateData.incubated = incubated;
    if (progress_percent !== undefined) {
      updateData.progress_percent = parseInt(progress_percent, 10);
    }
    if (departement_id !== undefined) {
      const department = await prisma.departements.findUnique({
        where: { id: parseInt(departement_id, 10) },
      });
      if (!department) {
        return res.status(404).json({
          success: false,
          message: "Department not found.",
        });
      }
      updateData.departement_id = parseInt(departement_id, 10);
    }
    if (pre_incubation_status !== undefined) {
      updateData.pre_incubation_status =
        pre_incubation_status === null || pre_incubation_status === ""
          ? null
          : parseInt(pre_incubation_status, 10);
    }
    if (acceleration_status !== undefined) {
      updateData.acceleration_status =
        acceleration_status === null || acceleration_status === ""
          ? null
          : parseInt(acceleration_status, 10);
    }
    if (team_id !== undefined) {
      updateData.team_id =
        team_id === null || team_id === "" ? null : parseInt(team_id, 10);
    }

    const updated = await updateProject(id, updateData);
    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating project",
      error: error.message,
    });
  }
};

const handleDeleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id, 10))) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const existing = await getProjectById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    await deleteProject(id);
    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting project",
      error: error.message,
    });
  }
};

const handleUpdateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { incubated, progress_percent, pre_incubation_status, acceleration_status } = req.body;
    const roles = Array.isArray(req.roles) ? req.roles : [req.roles].filter(Boolean);
    const canWriteFullProject = isAdminLike(roles);

    if (!id || isNaN(parseInt(id, 10))) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const updateData = {};
    if (incubated !== undefined) updateData.incubated = incubated;
    if (progress_percent !== undefined) {
      updateData.progress_percent = parseInt(progress_percent, 10);
    }
    if (pre_incubation_status !== undefined) {
      updateData.pre_incubation_status =
        pre_incubation_status === null || pre_incubation_status === ""
          ? null
          : parseInt(pre_incubation_status, 10);
    }
    if (acceleration_status !== undefined) {
      updateData.acceleration_status =
        acceleration_status === null || acceleration_status === ""
          ? null
          : parseInt(acceleration_status, 10);
    }

    if (!canWriteFullProject && Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid project status fields provided.",
      });
    }

    const updated = await updateProject(id, updateData);
    return res.status(200).json({
      success: true,
      message: "Project status updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating project status:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating project status",
      error: error.message,
    });
  }
};

const handleAssignSupervisorToProject = async (req, res) => {
  try {
    const { id, supervisorId } = req.params;

    if (!id || isNaN(parseInt(id, 10)) || !supervisorId || isNaN(parseInt(supervisorId, 10))) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID or supervisor ID",
      });
    }

    const supervisor = await prisma.users.findUnique({
      where: { id: parseInt(supervisorId, 10) },
      select: { id: true, role: true },
    });

    if (!supervisor) {
      return res.status(404).json({
        success: false,
        message: "Supervisor not found",
      });
    }

    const supervisorRoles = Array.isArray(supervisor.role) ? supervisor.role : [];
    const allowedSupervisor =
      supervisorRoles.includes(ROLES.supervisor) ||
      supervisorRoles.includes(ROLES.coach);

    if (!allowedSupervisor) {
      return res.status(400).json({
        success: false,
        message: "Assigned user must have coach or supervisor role.",
      });
    }

    const relation = await assignSupervisorToProject(id, supervisorId);
    return res.status(201).json({
      success: true,
      message: "Supervisor assigned to project successfully",
      data: relation,
    });
  } catch (error) {
    console.error("Error assigning supervisor to project:", error);
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Supervisor already assigned to this project",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Error assigning supervisor to project",
      error: error.message,
    });
  }
};

const handleRemoveSupervisorFromProject = async (req, res) => {
  try {
    const { id, supervisorId } = req.params;

    if (!id || isNaN(parseInt(id, 10)) || !supervisorId || isNaN(parseInt(supervisorId, 10))) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID or supervisor ID",
      });
    }

    await removeSupervisorFromProject(id, supervisorId);
    return res.status(200).json({
      success: true,
      message: "Supervisor removed from project successfully",
    });
  } catch (error) {
    console.error("Error removing supervisor from project:", error);
    return res.status(500).json({
      success: false,
      message: "Error removing supervisor from project",
      error: error.message,
    });
  }
};

module.exports = {
  handleGetAllProjects,
  handleGetMyProjects,
  handleGetProjectById,
  handleCreateProject,
  handleUpdateProject,
  handleDeleteProject,
  handleUpdateProjectStatus,
  handleAssignSupervisorToProject,
  handleRemoveSupervisorFromProject,
};
