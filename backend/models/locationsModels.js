const { prisma } = require("../config/db");

// Get all locations
const getAllLocations = async () => {
  return await prisma.locations.findMany({
    orderBy: {
      location_name: "asc",
    },
  });
};

// Get a single location by ID
const getLocationById = async (locationId) => {
  return await prisma.locations.findUnique({
    where: {
      id: locationId,
    },
  });
};

// Create a new location
const createLocation = async (locationName) => {
  return await prisma.locations.create({
    data: {
      location_name: locationName,
    },
  });
};

// Update a location
const updateLocation = async (locationId, locationName) => {
  return await prisma.locations.update({
    where: {
      id: locationId,
    },
    data: {
      location_name: locationName,
    },
  });
};

// Delete a location
const deleteLocation = async (locationId) => {
  return await prisma.locations.delete({
    where: {
      id: locationId,
    },
  });
};

// Check if location is in use
const isLocationInUse = async (locationId) => {
  const juryCount = await prisma.jury.count({
    where: {
      location_id: locationId,
    },
  });

  const trainingCount = await prisma.training.count({
    where: {
      location_id: locationId,
    },
  });

  return juryCount > 0 || trainingCount > 0;
};

module.exports = {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  isLocationInUse,
};
