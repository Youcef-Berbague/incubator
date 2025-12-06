const {
  getAllJuryMembres,
  getJuryMembreById,
  createJuryMembre,
  updateJuryMembre,
  deleteJuryMembre,
  isUserJuryMembre,
  getEligibleUsers,
} = require("../models/juryMembreModels");

// @desc Get all jury members
// @route GET /api/jury-members
// @access Private (SuperAdmin, Admin)
const handleGetAllJuryMembres = async (req, res) => {
  try {
    const members = await getAllJuryMembres();
    res.status(200).json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (error) {
    console.error("Error fetching jury members:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching jury members",
      error: error.message,
    });
  }
};

// @desc Get jury member by ID
// @route GET /api/jury-members/:id
// @access Private (SuperAdmin, Admin)
const handleGetJuryMembreById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid jury member ID",
      });
    }

    const member = await getJuryMembreById(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Jury member not found",
      });
    }

    res.status(200).json({
      success: true,
      data: member,
    });
  } catch (error) {
    console.error("Error fetching jury member:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching jury member",
      error: error.message,
    });
  }
};

// @desc Create new jury member
// @route POST /api/jury-members
// @access Private (SuperAdmin, Admin)
const handleCreateJuryMembre = async (req, res) => {
  try {
    const { membre_id, role_id } = req.body;

    // Validation
    if (!membre_id) {
      return res.status(400).json({
        success: false,
        message: "User ID (membre_id) is required",
      });
    }

    // Check if user is already a jury member
    const alreadyMember = await isUserJuryMembre(membre_id);
    if (alreadyMember) {
      return res.status(409).json({
        success: false,
        message: "User is already a jury member",
      });
    }

    // Verify user has eligible role (supervisor, admin, coach, super admin)
    const {prisma} = require("../config/db");
    const user = await prisma.users.findUnique({
      where: { id: parseInt(membre_id) },
      select: { role: true, first_name: true, last_name: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const roles = require("../config/rolesList")
    const eligibleRoles = [roles.supervisor, roles.admin, roles.coach, roles.superAdmin]; // supervisor, admin, coach, super admin
    const hasEligibleRole = user.role.some((role) =>
      eligibleRoles.includes(role)
    );

    if (!hasEligibleRole) {
      return res.status(403).json({
        success: false,
        message:
          "an error occured",
      });
    }

    const membreData = {
      membre_id: parseInt(membre_id),
      role_id: role_id ? parseInt(role_id) : null,
    };

    const member = await createJuryMembre(membreData);

    res.status(201).json({
      success: true,
      message: "Jury member created successfully",
      data: member,
    });
  } catch (error) {
    console.error("Error creating jury member:", error);
    res.status(500).json({
      success: false,
      message: "Error creating jury member",
      error: error.message,
    });
  }
};

// @desc Update jury member
// @route PUT /api/jury-members/:id
// @access Private (SuperAdmin, Admin)
const handleUpdateJuryMembre = async (req, res) => {
  try {
    const { id } = req.params;
    const { membre_id, role_id } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid jury member ID",
      });
    }

    // Check if jury member exists
    const existingMember = await getJuryMembreById(id);
    if (!existingMember) {
      return res.status(404).json({
        success: false,
        message: "Jury member not found",
      });
    }

    // Validation
    if (!membre_id) {
      return res.status(400).json({
        success: false,
        message: "User ID (membre_id) is required",
      });
    }

    // If changing user, check if new user is eligible
    if (parseInt(membre_id) !== existingMember.membre_id) {
      const {prisma} = require("../config/db");
      const user = await prisma.users.findUnique({
        where: { id: parseInt(membre_id) },
        select: { role: true },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const eligibleRoles = [101, 555, 333, 777];
      const hasEligibleRole = user.role.some((role) =>
        eligibleRoles.includes(role)
      );

      if (!hasEligibleRole) {
        return res.status(403).json({
          success: false,
          message:
            "User must have supervisor, admin, coach, or super admin role",
        });
      }
    }

    const membreData = {
      membre_id: parseInt(membre_id),
      role_id: role_id ? parseInt(role_id) : null,
    };

    const updatedMember = await updateJuryMembre(id, membreData);

    res.status(200).json({
      success: true,
      message: "Jury member updated successfully",
      data: updatedMember,
    });
  } catch (error) {
    console.error("Error updating jury member:", error);
    res.status(500).json({
      success: false,
      message: "Error updating jury member",
      error: error.message,
    });
  }
};

// @desc Delete jury member
// @route DELETE /api/jury-members/:id
// @access Private (SuperAdmin)
const handleDeleteJuryMembre = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid jury member ID",
      });
    }

    const existingMember = await getJuryMembreById(id);
    if (!existingMember) {
      return res.status(404).json({
        success: false,
        message: "Jury member not found",
      });
    }

    await deleteJuryMembre(id);

    res.status(200).json({
      success: true,
      message: "Jury member deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting jury member:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting jury member",
      error: error.message,
    });
  }
};

// @desc Get eligible users for jury
// @route GET /api/jury-members/eligible-users
// @access Private (SuperAdmin, Admin)
const handleGetEligibleUsers = async (req, res) => {
  try {
    const users = await getEligibleUsers();
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching eligible users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching eligible users",
      error: error.message,
    });
  }
};

module.exports = {
  handleGetAllJuryMembres,
  handleGetJuryMembreById,
  handleCreateJuryMembre,
  handleUpdateJuryMembre,
  handleDeleteJuryMembre,
  handleGetEligibleUsers,
};
