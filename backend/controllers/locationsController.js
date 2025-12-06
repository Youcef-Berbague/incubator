const {
  getAllLocations: getAllLocationsModel,
  getLocationById: getLocationByIdModel,
  createLocation: createLocationModel,
  updateLocation: updateLocationModel,
  deleteLocation: deleteLocationModel,
  isLocationInUse,
} = require("../models/locationsModels");

// Get all locations
const getAllLocations = async (req, res) => {
  try {
    const locations = await getAllLocationsModel();
    res.json({ success: true, data: locations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching locations." });
  }
};

// Get a single location by ID
const getLocationById = async (req, res) => {
  const locationId = parseInt(req.params.id);

  if (isNaN(locationId)) {
    return res.status(400).json({ message: "Invalid location ID." });
  }

  try {
    const location = await getLocationByIdModel(locationId);

    if (!location) {
      return res.status(404).json({ message: "Location not found." });
    }

    res.json({ success: true, data: location });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching location." });
  }
};

// Create a new location
const createLocation = async (req, res) => {
  const { location_name } = req.body;

  if (!location_name || location_name.trim() === "") {
    return res.status(400).json({ message: "Location name is required." });
  }

  if (location_name.length > 50) {
    return res
      .status(400)
      .json({ message: "Location name must be 50 characters or less." });
  }

  try {
    const newLocation = await createLocationModel(location_name.trim());
    res.status(201).json({ success: true, data: newLocation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating location." });
  }
};

// Update a location
const updateLocation = async (req, res) => {
  const locationId = parseInt(req.params.id);
  const { location_name } = req.body;

  if (isNaN(locationId)) {
    return res.status(400).json({ message: "Invalid location ID." });
  }

  if (!location_name || location_name.trim() === "") {
    return res.status(400).json({ message: "Location name is required." });
  }

  if (location_name.length > 50) {
    return res
      .status(400)
      .json({ message: "Location name must be 50 characters or less." });
  }

  try {
    const updatedLocation = await updateLocationModel(
      locationId,
      location_name.trim()
    );
    res.json({ success: true, data: updatedLocation });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Location not found." });
    }
    res.status(500).json({ message: "Error updating location." });
  }
};

// Delete a location
const deleteLocation = async (req, res) => {
  const locationId = parseInt(req.params.id);

  if (isNaN(locationId)) {
    return res.status(400).json({ message: "Invalid location ID." });
  }

  try {
    // Check if location is in use
    const inUse = await isLocationInUse(locationId);
    if (inUse) {
      return res.status(409).json({
        message:
          "Cannot delete location. It is currently assigned to jury sessions or trainings.",
      });
    }

    await deleteLocationModel(locationId);
    res.json({ success: true, message: "Location deleted successfully." });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Location not found." });
    }
    res.status(500).json({ message: "Error deleting location." });
  }
};

module.exports = {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
};
