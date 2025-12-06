const { getAllProjects, getProjectById } = require("../models/projectsModels");

// @desc Get all projects
// @route GET /api/projects
// @access Private (SuperAdmin, Admin)
const handleGetAllProjects = async (req, res) => {
  try {
    const projects = await getAllProjects();
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

module.exports = {
  handleGetAllProjects,
  handleGetProjectById,
};
