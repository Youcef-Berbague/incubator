const { prisma } = require("../config/db");

// Get all acceleration statuses
const getAllAccelerationStatuses = async () => {
  return await prisma.acceleration_status.findMany({
    orderBy: {
      acceleration_name: "asc",
    },
  });
};

// Get a single acceleration status by ID
const getAccelerationStatusById = async (statusId) => {
  return await prisma.acceleration_status.findUnique({
    where: {
      id: statusId,
    },
  });
};

// Create a new acceleration status
const createAccelerationStatus = async (accelerationName) => {
  return await prisma.acceleration_status.create({
    data: {
      acceleration_name: accelerationName,
    },
  });
};

// Update an acceleration status
const updateAccelerationStatus = async (statusId, accelerationName) => {
  return await prisma.acceleration_status.update({
    where: {
      id: statusId,
    },
    data: {
      acceleration_name: accelerationName,
    },
  });
};

// Delete an acceleration status
const deleteAccelerationStatus = async (statusId) => {
  return await prisma.acceleration_status.delete({
    where: {
      id: statusId,
    },
  });
};

// Check if acceleration status is in use
const isAccelerationStatusInUse = async (statusId) => {
  const count = await prisma.project.count({
    where: {
      acceleration_status: statusId,
    },
  });
  return count > 0;
};

module.exports = {
  getAllAccelerationStatuses,
  getAccelerationStatusById,
  createAccelerationStatus,
  updateAccelerationStatus,
  deleteAccelerationStatus,
  isAccelerationStatusInUse,
};
