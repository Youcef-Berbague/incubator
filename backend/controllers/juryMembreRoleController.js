const {
  getAllJuryMembreRoles,
  getJuryMembreRoleById,
  createJuryMembreRole,
  updateJuryMembreRole,
  deleteJuryMembreRole,
  roleNameExists,
} = require("../models/juryMembreRoleModels");

// @desc Get all jury member roles
// @route GET /api/jury-member-roles
// @access Private (SuperAdmin, Admin)
const handleGetAllJuryMembreRoles = async (req, res) => {
  try {
    const roles = await getAllJuryMembreRoles();
    res.status(200).json({
      success: true,
      count: roles.length,
      data: roles,
    });
  } catch (error) {
    console.error("Error fetching jury member roles:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching jury member roles",
      error: error.message,
    });
  }
};

// @desc Get jury member role by ID
// @route GET /api/jury-member-roles/:id
// @access Private (SuperAdmin, Admin)
const handleGetJuryMembreRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid jury member role ID",
      });
    }

    const role = await getJuryMembreRoleById(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Jury member role not found",
      });
    }

    res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    console.error("Error fetching jury member role:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching jury member role",
      error: error.message,
    });
  }
};

// @desc Create new jury member role
// @route POST /api/jury-member-roles
// @access Private (SuperAdmin)
const handleCreateJuryMembreRole = async (req, res) => {
  try {
    const { name } = req.body;

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Role name is required",
      });
    }

    if (name.length > 30) {
      return res.status(400).json({
        success: false,
        message: "Role name must not exceed 30 characters",
      });
    }

    // Check if role name already exists
    const nameExists = await roleNameExists(name.trim());
    if (nameExists) {
      return res.status(409).json({
        success: false,
        message: "Role name already exists",
      });
    }

    const roleData = {
      name: name.trim(),
    };

    const role = await createJuryMembreRole(roleData);

    res.status(201).json({
      success: true,
      message: "Jury member role created successfully",
      data: role,
    });
  } catch (error) {
    console.error("Error creating jury member role:", error);
    res.status(500).json({
      success: false,
      message: "Error creating jury member role",
      error: error.message,
    });
  }
};

// @desc Update jury member role
// @route PUT /api/jury-member-roles/:id
// @access Private (SuperAdmin)
const handleUpdateJuryMembreRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid jury member role ID",
      });
    }

    // Check if role exists
    const existingRole = await getJuryMembreRoleById(id);
    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: "Jury member role not found",
      });
    }

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Role name is required",
      });
    }

    if (name.length > 30) {
      return res.status(400).json({
        success: false,
        message: "Role name must not exceed 30 characters",
      });
    }

    // Check if role name already exists (excluding current role)
    const nameExists = await roleNameExists(name.trim(), id);
    if (nameExists) {
      return res.status(409).json({
        success: false,
        message: "Role name already exists",
      });
    }

    const roleData = {
      name: name.trim(),
    };

    const updatedRole = await updateJuryMembreRole(id, roleData);

    res.status(200).json({
      success: true,
      message: "Jury member role updated successfully",
      data: updatedRole,
    });
  } catch (error) {
    console.error("Error updating jury member role:", error);
    res.status(500).json({
      success: false,
      message: "Error updating jury member role",
      error: error.message,
    });
  }
};

// @desc Delete jury member role
// @route DELETE /api/jury-member-roles/:id
// @access Private (SuperAdmin)
const handleDeleteJuryMembreRole = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid jury member role ID",
      });
    }

    const existingRole = await getJuryMembreRoleById(id);
    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: "Jury member role not found",
      });
    }

    await deleteJuryMembreRole(id);

    res.status(200).json({
      success: true,
      message: "Jury member role deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting jury member role:", error);
    if (error.message.includes("Cannot delete role")) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Error deleting jury member role",
      error: error.message,
    });
  }
};

module.exports = {
  handleGetAllJuryMembreRoles,
  handleGetJuryMembreRoleById,
  handleCreateJuryMembreRole,
  handleUpdateJuryMembreRole,
  handleDeleteJuryMembreRole,
};
