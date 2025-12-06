const { prisma } = require("../config/db");

// Get all jury member roles
const getAllJuryMembreRoles = async () => {
  try {
    const roles = await prisma.jury_membre_role.findMany({
      include: {
        jury_membre: {
          include: {
            users: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
    return roles;
  } catch (error) {
    throw error;
  }
};

// Get jury member role by ID
const getJuryMembreRoleById = async (id) => {
  try {
    const role = await prisma.jury_membre_role.findUnique({
      where: { id: parseInt(id) },
      include: {
        jury_membre: {
          include: {
            users: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
              },
            },
          },
        },
      },
    });
    return role;
  } catch (error) {
    throw error;
  }
};

// Create jury member role
const createJuryMembreRole = async (roleData) => {
  try {
    const role = await prisma.jury_membre_role.create({
      data: {
        name: roleData.name,
      },
    });
    return role;
  } catch (error) {
    throw error;
  }
};

// Update jury member role
const updateJuryMembreRole = async (id, roleData) => {
  try {
    const role = await prisma.jury_membre_role.update({
      where: { id: parseInt(id) },
      data: {
        name: roleData.name,
      },
    });
    return role;
  } catch (error) {
    throw error;
  }
};

// Delete jury member role
const deleteJuryMembreRole = async (id) => {
  try {
    // Check if role is being used
    const membersCount = await prisma.jury_membre.count({
      where: { role_id: parseInt(id) },
    });

    if (membersCount > 0) {
      throw new Error(
        `Cannot delete role: ${membersCount} jury member(s) are using this role`
      );
    }

    const role = await prisma.jury_membre_role.delete({
      where: { id: parseInt(id) },
    });
    return role;
  } catch (error) {
    throw error;
  }
};

// Check if role name exists
const roleNameExists = async (name, excludeId = null) => {
  try {
    const whereClause = { name: name };
    if (excludeId) {
      whereClause.id = { not: parseInt(excludeId) };
    }
    const role = await prisma.jury_membre_role.findFirst({
      where: whereClause,
    });
    return role !== null;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllJuryMembreRoles,
  getJuryMembreRoleById,
  createJuryMembreRole,
  updateJuryMembreRole,
  deleteJuryMembreRole,
  roleNameExists,
};
