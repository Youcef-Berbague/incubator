const {prisma} = require("../config/db");

// Get all juries with related data
const getAllJuries = async () => {
  try {
    const juries = await prisma.jury.findMany({
      include: {
        faculties: {
          select: {
            id: true,
            faculty_name: true,
            faculty_name_en: true,
          },
        },
        locations: {
          select: {
            id: true,
            location_name: true,
          },
        },
        socio_economic_partner: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone_number: true,
          },
        },
        jury_membres_relation: {
          include: {
            jury_membre: {
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
                jury_membre_role: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        jury_project: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                project_code: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });
    return juries;
  } catch (error) {
    throw error;
  }
};

// Get jury by ID
const getJuryById = async (id) => {
  try {
    const jury = await prisma.jury.findUnique({
      where: { id: parseInt(id) },
      include: {
        faculties: {
          select: {
            id: true,
            faculty_name: true,
            faculty_name_en: true,
          },
        },
        locations: {
          select: {
            id: true,
            location_name: true,
          },
        },
        socio_economic_partner: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone_number: true,
          },
        },
        jury_membres_relation: {
          include: {
            jury_membre: {
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
                jury_membre_role: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        jury_project: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                project_code: true,
              },
            },
          },
        },
        evaluation_sheet: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });
    return jury;
  } catch (error) {
    throw error;
  }
};

// Create jury
const createJury = async (juryData) => {
  try {
    const jury = await prisma.jury.create({
      data: {
        jury_code: juryData.jury_code,
        date: juryData.date ? new Date(juryData.date) : null,
        so_partener_id: juryData.so_partener_id || null,
        location_id: juryData.location_id || null,
        faculty_id: juryData.faculty_id || null,
      },
      include: {
        faculties: true,
        locations: true,
        socio_economic_partner: true,
      },
    });
    return jury;
  } catch (error) {
    throw error;
  }
};

// Update jury
const updateJury = async (id, juryData) => {
  try {
    const jury = await prisma.jury.update({
      where: { id: parseInt(id) },
      data: {
        jury_code: juryData.jury_code,
        date: juryData.date ? new Date(juryData.date) : null,
        so_partener_id: juryData.so_partener_id || null,
        location_id: juryData.location_id || null,
        faculty_id: juryData.faculty_id || null,
      },
      include: {
        faculties: true,
        locations: true,
        socio_economic_partner: true,
      },
    });
    return jury;
  } catch (error) {
    throw error;
  }
};

// Delete jury
const deleteJury = async (id) => {
  try {
    // Delete related jury_membres_relation first
    await prisma.jury_membres_relation.deleteMany({
      where: { jury_id: parseInt(id) },
    });

    // Delete related jury_project
    await prisma.jury_project.deleteMany({
      where: { jury_id: parseInt(id) },
    });

    // Delete related evaluation_sheet
    await prisma.evaluation_sheet.deleteMany({
      where: { jury_id: parseInt(id) },
    });

    // Delete the jury
    const jury = await prisma.jury.delete({
      where: { id: parseInt(id) },
    });
    return jury;
  } catch (error) {
    throw error;
  }
};

// Check if jury code exists
const juryCodeExists = async (juryCode, excludeId = null) => {
  try {
    const whereClause = { jury_code: juryCode };
    if (excludeId) {
      whereClause.id = { not: parseInt(excludeId) };
    }
    const jury = await prisma.jury.findFirst({
      where: whereClause,
    });
    return jury !== null;
  } catch (error) {
    throw error;
  }
};

// Assign member to jury
const assignMemberToJury = async (juryId, memberId) => {
  try {
    const relation = await prisma.jury_membres_relation.create({
      data: {
        jury_id: parseInt(juryId),
        membre_id: parseInt(memberId),
      },
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
            jury_membre_role: true,
          },
        },
      },
    });
    return relation;
  } catch (error) {
    throw error;
  }
};

// Remove member from jury
const removeMemberFromJury = async (juryId, memberId) => {
  try {
    const relation = await prisma.jury_membres_relation.delete({
      where: {
        membre_id_jury_id: {
          membre_id: parseInt(memberId),
          jury_id: parseInt(juryId),
        },
      },
    });
    return relation;
  } catch (error) {
    throw error;
  }
};

// Get jury members
const getJuryMembers = async (juryId) => {
  try {
    const members = await prisma.jury_membres_relation.findMany({
      where: { jury_id: parseInt(juryId) },
      include: {
        jury_membre: {
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
            jury_membre_role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    return members;
  } catch (error) {
    throw error;
  }
};

// Assign projects to jury
const assignProjectsToJury = async (juryId, projectIds) => {
  try {
    // Delete existing assignments
    await prisma.jury_project.deleteMany({
      where: { jury_id: parseInt(juryId) },
    });

    // Create new assignments
    const assignments = await prisma.jury_project.createMany({
      data: projectIds.map((projectId) => ({
        jury_id: parseInt(juryId),
        project_id: parseInt(projectId),
      })),
    });
    return assignments;
  } catch (error) {
    throw error;
  }
};

module.exports = {
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
};
