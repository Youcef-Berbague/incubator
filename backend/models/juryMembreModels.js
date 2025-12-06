const {prisma} = require("../config/db");

// Get all jury members
const getAllJuryMembres = async () => {
  try {
    const members = await prisma.jury_membre.findMany({
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone_number: true,
            role: true,
          },
        },
        jury_membre_role: {
          select: {
            id: true,
            name: true,
          },
        },
        jury_membres_relation: {
          include: {
            jury: {
              select: {
                id: true,
                jury_code: true,
                date: true,
              },
            },
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });
    return members;
  } catch (error) {
    throw error;
  }
};

// Get jury member by ID
const getJuryMembreById = async (id) => {
  try {
    const member = await prisma.jury_membre.findUnique({
      where: { id: parseInt(id) },
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone_number: true,
            role: true,
            departement_id: true,
            departements: {
              select: {
                id: true,
                departement_name: true,
              },
            },
          },
        },
        jury_membre_role: {
          select: {
            id: true,
            name: true,
          },
        },
        jury_membres_relation: {
          include: {
            jury: {
              select: {
                id: true,
                jury_code: true,
                date: true,
                locations: true,
                faculties: true,
              },
            },
          },
        },
      },
    });
    return member;
  } catch (error) {
    throw error;
  }
};

// Create jury member
const createJuryMembre = async (membreData) => {
  try {
    const member = await prisma.jury_membre.create({
      data: {
        membre_id: membreData.membre_id ? parseInt(membreData.membre_id) : null,
        role_id: membreData.role_id ? parseInt(membreData.role_id) : null,
      },
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true,
          },
        },
        jury_membre_role: true,
      },
    });
    return member;
  } catch (error) {
    throw error;
  }
};

// Update jury member
const updateJuryMembre = async (id, membreData) => {
  try {
    const member = await prisma.jury_membre.update({
      where: { id: parseInt(id) },
      data: {
        membre_id: membreData.membre_id ? parseInt(membreData.membre_id) : null,
        role_id: membreData.role_id ? parseInt(membreData.role_id) : null,
      },
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true,
          },
        },
        jury_membre_role: true,
      },
    });
    return member;
  } catch (error) {
    throw error;
  }
};

// Delete jury member
const deleteJuryMembre = async (id) => {
  try {
    // Delete related jury_membres_relation first
    await prisma.jury_membres_relation.deleteMany({
      where: { membre_id: parseInt(id) },
    });

    // Delete the jury member
    const member = await prisma.jury_membre.delete({
      where: { id: parseInt(id) },
    });
    return member;
  } catch (error) {
    throw error;
  }
};

// Check if user is already a jury member
const isUserJuryMembre = async (userId) => {
  try {
    const member = await prisma.jury_membre.findFirst({
      where: { membre_id: parseInt(userId) },
    });
    return member !== null;
  } catch (error) {
    throw error;
  }
};

// Get eligible users for jury (supervisor, admin, coach, super admin)
const getEligibleUsers = async () => {
  try {
    const users = await prisma.users.findMany({
      where: {
        OR: [
          { role: { has: 101 } }, // supervisor
          { role: { has: 555 } }, // admin
          { role: { has: 333 } }, // coach
          { role: { has: 777 } }, // super admin
        ],
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone_number: true,
        role: true,
        departements: {
          select: {
            id: true,
            departement_name: true,
          },
        },
      },
      orderBy: [{ last_name: "asc" }, { first_name: "asc" }],
    });
    return users;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllJuryMembres,
  getJuryMembreById,
  createJuryMembre,
  updateJuryMembre,
  deleteJuryMembre,
  isUserJuryMembre,
  getEligibleUsers,
};
