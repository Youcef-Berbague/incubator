const {
  getAllJuries,
  getJuryById,
  createJury,
  updateJury,
  deleteJury,
  juryCodeExists,
  assignMemberToJury,
  removeMemberFromJury,
  getJuryMembers,
  assignProjectsToJury,
} = require("../models/juryModels");

// @desc Get all juries
// @route GET /api/juries
// @access Private (SuperAdmin, Admin)
const handleGetAllJuries = async (req, res) => {
  try {
    const juries = await getAllJuries();
    res.status(200).json({
      success: true,
      count: juries.length,
      data: juries,
    });
  } catch (error) {
    console.error("Error fetching juries:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching juries",
      error: error.message,
    });
  }
};

// @desc Get jury by ID
// @route GET /api/juries/:id
// @access Private (SuperAdmin, Admin)
const handleGetJuryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid jury ID",
      });
    }

    const jury = await getJuryById(id);

    if (!jury) {
      return res.status(404).json({
        success: false,
        message: "Jury not found",
      });
    }

    res.status(200).json({
      success: true,
      data: jury,
    });
  } catch (error) {
    console.error("Error fetching jury:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching jury",
      error: error.message,
    });
  }
};

// @desc Create new jury
// @route POST /api/juries
// @access Private (SuperAdmin, Admin)
const handleCreateJury = async (req, res) => {
  try {
    const { jury_code, date, so_partener_id, location_id, faculty_id } =
      req.body;

    // Validation
    if (!jury_code || jury_code.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Jury code is required",
      });
    }

    if (jury_code.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Jury code must not exceed 100 characters",
      });
    }

    // Check if jury code already exists
    const codeExists = await juryCodeExists(jury_code);
    if (codeExists) {
      return res.status(409).json({
        success: false,
        message: "Jury code already exists",
      });
    }

    // Validate date if provided
    if (date && isNaN(Date.parse(date))) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    const juryData = {
      jury_code: jury_code.trim(),
      date: date || null,
      so_partener_id: so_partener_id ? parseInt(so_partener_id) : null,
      location_id: location_id ? parseInt(location_id) : null,
      faculty_id: faculty_id ? parseInt(faculty_id) : null,
    };

    const jury = await createJury(juryData);

    res.status(201).json({
      success: true,
      message: "Jury created successfully",
      data: jury,
    });
  } catch (error) {
    console.error("Error creating jury:", error);
    res.status(500).json({
      success: false,
      message: "Error creating jury",
      error: error.message,
    });
  }
};

// @desc Update jury
// @route PUT /api/juries/:id
// @access Private (SuperAdmin, Admin)
const handleUpdateJury = async (req, res) => {
  try {
    const { id } = req.params;
    const { jury_code, date, so_partener_id, location_id, faculty_id } =
      req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid jury ID",
      });
    }

    // Check if jury exists
    const existingJury = await getJuryById(id);
    if (!existingJury) {
      return res.status(404).json({
        success: false,
        message: "Jury not found",
      });
    }

    // Validation
    if (!jury_code || jury_code.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Jury code is required",
      });
    }

    if (jury_code.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Jury code must not exceed 100 characters",
      });
    }

    // Check if jury code already exists (excluding current jury)
    const codeExists = await juryCodeExists(jury_code, id);
    if (codeExists) {
      return res.status(409).json({
        success: false,
        message: "Jury code already exists",
      });
    }

    // Validate date if provided
    if (date && isNaN(Date.parse(date))) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    const juryData = {
      jury_code: jury_code.trim(),
      date: date || null,
      so_partener_id: so_partener_id ? parseInt(so_partener_id) : null,
      location_id: location_id ? parseInt(location_id) : null,
      faculty_id: faculty_id ? parseInt(faculty_id) : null,
    };

    const updatedJury = await updateJury(id, juryData);

    res.status(200).json({
      success: true,
      message: "Jury updated successfully",
      data: updatedJury,
    });
  } catch (error) {
    console.error("Error updating jury:", error);
    res.status(500).json({
      success: false,
      message: "Error updating jury",
      error: error.message,
    });
  }
};

// @desc Delete jury
// @route DELETE /api/juries/:id
// @access Private (SuperAdmin)
const handleDeleteJury = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid jury ID",
      });
    }

    const existingJury = await getJuryById(id);
    if (!existingJury) {
      return res.status(404).json({
        success: false,
        message: "Jury not found",
      });
    }

    await deleteJury(id);

    res.status(200).json({
      success: true,
      message: "Jury deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting jury:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting jury",
      error: error.message,
    });
  }
};

// @desc Assign member to jury
// @route POST /api/juries/:juryId/members/:memberId
// @access Private (SuperAdmin, Admin)
const handleAssignMemberToJury = async (req, res) => {
  try {
    const { juryId, memberId } = req.params;

    if (!juryId || isNaN(parseInt(juryId))) {
      return res.status(400).json({
        success: false,
        message: "Invalid jury ID",
      });
    }

    if (!memberId || isNaN(parseInt(memberId))) {
      return res.status(400).json({
        success: false,
        message: "Invalid member ID",
      });
    }

    const relation = await assignMemberToJury(juryId, memberId);

    res.status(201).json({
      success: true,
      message: "Member assigned to jury successfully",
      data: relation,
    });
  } catch (error) {
    console.error("Error assigning member to jury:", error);
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Member is already assigned to this jury",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error assigning member to jury",
      error: error.message,
    });
  }
};

// @desc Remove member from jury
// @route DELETE /api/juries/:juryId/members/:memberId
// @access Private (SuperAdmin, Admin)
const handleRemoveMemberFromJury = async (req, res) => {
  try {
    const { juryId, memberId } = req.params;

    if (!juryId || isNaN(parseInt(juryId))) {
      return res.status(400).json({
        success: false,
        message: "Invalid jury ID",
      });
    }

    if (!memberId || isNaN(parseInt(memberId))) {
      return res.status(400).json({
        success: false,
        message: "Invalid member ID",
      });
    }

    await removeMemberFromJury(juryId, memberId);

    res.status(200).json({
      success: true,
      message: "Member removed from jury successfully",
    });
  } catch (error) {
    console.error("Error removing member from jury:", error);
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Member assignment not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error removing member from jury",
      error: error.message,
    });
  }
};

// @desc Get jury members
// @route GET /api/juries/:juryId/members
// @access Private (SuperAdmin, Admin)
const handleGetJuryMembers = async (req, res) => {
  try {
    const { juryId } = req.params;

    if (!juryId || isNaN(parseInt(juryId))) {
      return res.status(400).json({
        success: false,
        message: "Invalid jury ID",
      });
    }

    const members = await getJuryMembers(juryId);

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

// @desc Assign projects to jury
// @route POST /api/juries/:juryId/projects
// @access Private (SuperAdmin, Admin)
const handleAssignProjectsToJury = async (req, res) => {
  try {
    const { juryId } = req.params;
    const { projectIds } = req.body;

    if (!juryId || isNaN(parseInt(juryId))) {
      return res.status(400).json({
        success: false,
        message: "Invalid jury ID",
      });
    }

    if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Project IDs array is required",
      });
    }

    const assignments = await assignProjectsToJury(juryId, projectIds);

    res.status(200).json({
      success: true,
      message: "Projects assigned to jury successfully",
      data: assignments,
    });
  } catch (error) {
    console.error("Error assigning projects to jury:", error);
    res.status(500).json({
      success: false,
      message: "Error assigning projects to jury",
      error: error.message,
    });
  }
};

module.exports = {
  handleGetAllJuries,
  handleGetJuryById,
  handleCreateJury,
  handleUpdateJury,
  handleDeleteJury,
  handleAssignMemberToJury,
  handleRemoveMemberFromJury,
  handleGetJuryMembers,
  handleAssignProjectsToJury,
};
