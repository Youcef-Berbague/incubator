const {
  getAllAccelerationStatuses: getAllAccelerationStatusesModel,
  getAccelerationStatusById: getAccelerationStatusByIdModel,
  createAccelerationStatus: createAccelerationStatusModel,
  updateAccelerationStatus: updateAccelerationStatusModel,
  deleteAccelerationStatus: deleteAccelerationStatusModel,
  isAccelerationStatusInUse,
} = require("../models/accelerationStatusModels");

// Get all acceleration statuses
const getAllAccelerationStatuses = async (req, res) => {
  try {
    const statuses = await getAllAccelerationStatusesModel();
    res.json({ success: true, data: statuses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching acceleration statuses." });
  }
};

// Get a single acceleration status by ID
const getAccelerationStatusById = async (req, res) => {
  const statusId = parseInt(req.params.id);

  if (isNaN(statusId)) {
    return res.status(400).json({ message: "Invalid status ID." });
  }

  try {
    const status = await getAccelerationStatusByIdModel(statusId);

    if (!status) {
      return res
        .status(404)
        .json({ message: "Acceleration status not found." });
    }

    res.json({ success: true, data: status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching acceleration status." });
  }
};

// Create a new acceleration status
const createAccelerationStatus = async (req, res) => {
  const { acceleration_name } = req.body;

  if (!acceleration_name || acceleration_name.trim() === "") {
    return res.status(400).json({ message: "Acceleration name is required." });
  }

  if (acceleration_name.length > 30) {
    return res
      .status(400)
      .json({ message: "Acceleration name must be 30 characters or less." });
  }

  try {
    const newStatus = await createAccelerationStatusModel(
      acceleration_name.trim()
    );
    res.status(201).json({ success: true, data: newStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating acceleration status." });
  }
};

// Update an acceleration status
const updateAccelerationStatus = async (req, res) => {
  const statusId = parseInt(req.params.id);
  const { acceleration_name } = req.body;

  if (isNaN(statusId)) {
    return res.status(400).json({ message: "Invalid status ID." });
  }

  if (!acceleration_name || acceleration_name.trim() === "") {
    return res.status(400).json({ message: "Acceleration name is required." });
  }

  if (acceleration_name.length > 30) {
    return res
      .status(400)
      .json({ message: "Acceleration name must be 30 characters or less." });
  }

  try {
    const updatedStatus = await updateAccelerationStatusModel(
      statusId,
      acceleration_name.trim()
    );
    res.json({ success: true, data: updatedStatus });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ message: "Acceleration status not found." });
    }
    res.status(500).json({ message: "Error updating acceleration status." });
  }
};

// Delete an acceleration status
const deleteAccelerationStatus = async (req, res) => {
  const statusId = parseInt(req.params.id);

  if (isNaN(statusId)) {
    return res.status(400).json({ message: "Invalid status ID." });
  }

  try {
    // Check if status is in use
    const inUse = await isAccelerationStatusInUse(statusId);
    if (inUse) {
      return res.status(409).json({
        message:
          "Cannot delete acceleration status. It is currently assigned to one or more projects.",
      });
    }

    await deleteAccelerationStatusModel(statusId);
    res.json({
      success: true,
      message: "Acceleration status deleted successfully.",
    });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ message: "Acceleration status not found." });
    }
    res.status(500).json({ message: "Error deleting acceleration status." });
  }
};

module.exports = {
  getAllAccelerationStatuses,
  getAccelerationStatusById,
  createAccelerationStatus,
  updateAccelerationStatus,
  deleteAccelerationStatus,
};
