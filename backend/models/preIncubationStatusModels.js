const { prisma } = require("../config/db");

// Get all pre-incubation statuses
const getAllPreIncubationStatuses = async () => {
  return await prisma.pre_incubation_status.findMany({
    orderBy: {
      status_name: "asc",
    },
  });
};

// Get a single pre-incubation status by ID
const getPreIncubationStatusById = async (statusId) => {
  return await prisma.pre_incubation_status.findUnique({
    where: {
      id: statusId,
    },
  });
};

// Create a new pre-incubation status
const createPreIncubationStatus = async (statusName) => {
  return await prisma.pre_incubation_status.create({
    data: {
      status_name: statusName,
    },
  });
};

// Update a pre-incubation status
const updatePreIncubationStatus = async (statusId, statusName) => {
  return await prisma.pre_incubation_status.update({
    where: {
      id: statusId,
    },
    data: {
      status_name: statusName,
    },
  });
};

// Delete a pre-incubation status
const deletePreIncubationStatus = async (statusId) => {
  return await prisma.pre_incubation_status.delete({
    where: {
      id: statusId,
    },
  });
};

// Check if pre-incubation status is in use
const isPreIncubationStatusInUse = async (statusId) => {
  const count = await prisma.project.count({
    where: {
      pre_incubation_status: statusId,
    },
  });
  return count > 0;
};

module.exports = {
  getAllPreIncubationStatuses,
  getPreIncubationStatusById,
  createPreIncubationStatus,
  updatePreIncubationStatus,
  deletePreIncubationStatus,
  isPreIncubationStatusInUse,
};
