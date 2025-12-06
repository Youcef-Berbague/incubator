const {
  getAllPreIncubationStatuses: getAllPreIncubationStatusesModel,
  getPreIncubationStatusById: getPreIncubationStatusByIdModel,
  createPreIncubationStatus: createPreIncubationStatusModel,
  updatePreIncubationStatus: updatePreIncubationStatusModel,
  deletePreIncubationStatus: deletePreIncubationStatusModel,
  isPreIncubationStatusInUse,
} = require("../models/preIncubationStatusModels");

// Get all pre-incubation statuses
const getAllPreIncubationStatuses = async (req, res) => {
  try {
    const statuses = await getAllPreIncubationStatusesModel();
    res.json({ success: true, data: statuses });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error fetching pre-incubation statuses." });
  }
};

// Get a single pre-incubation status by ID
const getPreIncubationStatusById = async (req, res) => {
  const statusId = parseInt(req.params.id);

  if (isNaN(statusId)) {
    return res.status(400).json({ message: "Invalid status ID." });
  }

  try {
    const status = await getPreIncubationStatusByIdModel(statusId);

    if (!status) {
      return res
        .status(404)
        .json({ message: "Pre-incubation status not found." });
    }

    res.json({ success: true, data: status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching pre-incubation status." });
  }
};

// Create a new pre-incubation status
const createPreIncubationStatus = async (req, res) => {
  const { status_name } = req.body;

  if (!status_name || status_name.trim() === "") {
    return res.status(400).json({ message: "Status name is required." });
  }

  if (status_name.length > 30) {
    return res
      .status(400)
      .json({ message: "Status name must be 30 characters or less." });
  }

  try {
    const newStatus = await createPreIncubationStatusModel(status_name.trim());
    res.status(201).json({ success: true, data: newStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating pre-incubation status." });
  }
};

// Update a pre-incubation status
const updatePreIncubationStatus = async (req, res) => {
  const statusId = parseInt(req.params.id);
  const { status_name } = req.body;

  if (isNaN(statusId)) {
    return res.status(400).json({ message: "Invalid status ID." });
  }

  if (!status_name || status_name.trim() === "") {
    return res.status(400).json({ message: "Status name is required." });
  }

  if (status_name.length > 30) {
    return res
      .status(400)
      .json({ message: "Status name must be 30 characters or less." });
  }

  try {
    const updatedStatus = await updatePreIncubationStatusModel(
      statusId,
      status_name.trim()
    );
    res.json({ success: true, data: updatedStatus });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ message: "Pre-incubation status not found." });
    }
    res.status(500).json({ message: "Error updating pre-incubation status." });
  }
};

// Delete a pre-incubation status
const deletePreIncubationStatus = async (req, res) => {
  const statusId = parseInt(req.params.id);

  if (isNaN(statusId)) {
    return res.status(400).json({ message: "Invalid status ID." });
  }

  try {
    // Check if status is in use
    const inUse = await isPreIncubationStatusInUse(statusId);
    if (inUse) {
      return res.status(409).json({
        message:
          "Cannot delete pre-incubation status. It is currently assigned to one or more projects.",
      });
    }

    await deletePreIncubationStatusModel(statusId);
    res.json({
      success: true,
      message: "Pre-incubation status deleted successfully.",
    });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ message: "Pre-incubation status not found." });
    }
    res.status(500).json({ message: "Error deleting pre-incubation status." });
  }
};

module.exports = {
  getAllPreIncubationStatuses,
  getPreIncubationStatusById,
  createPreIncubationStatus,
  updatePreIncubationStatus,
  deletePreIncubationStatus,
};
