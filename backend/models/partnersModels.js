const { prisma } = require("../config/db");

// Get all socio-economic partners
const getAllPartners = async () => {
  return await prisma.socio_economic_partner.findMany({
    orderBy: {
      full_name: "asc",
    },
  });
};

// Get a single partner by ID
const getPartnerById = async (partnerId) => {
  return await prisma.socio_economic_partner.findUnique({
    where: {
      id: partnerId,
    },
  });
};

// Create a new partner
const createPartner = async (partnerData) => {
  return await prisma.socio_economic_partner.create({
    data: {
      full_name: partnerData.full_name,
      phone_number: partnerData.phone_number,
      email: partnerData.email,
      professionel_adress: partnerData.professionel_adress || null,
    },
  });
};

// Update a partner
const updatePartner = async (partnerId, partnerData) => {
  const dataToUpdate = {};

  if (partnerData.full_name !== undefined)
    dataToUpdate.full_name = partnerData.full_name;
  if (partnerData.phone_number !== undefined)
    dataToUpdate.phone_number = partnerData.phone_number;
  if (partnerData.email !== undefined) dataToUpdate.email = partnerData.email;
  if (partnerData.professionel_adress !== undefined)
    dataToUpdate.professionel_adress = partnerData.professionel_adress;

  return await prisma.socio_economic_partner.update({
    where: {
      id: partnerId,
    },
    data: dataToUpdate,
  });
};

// Delete a partner
const deletePartner = async (partnerId) => {
  return await prisma.socio_economic_partner.delete({
    where: {
      id: partnerId,
    },
  });
};

// Check if partner is in use
const isPartnerInUse = async (partnerId) => {
  const count = await prisma.jury.count({
    where: {
      so_partener_id: partnerId,
    },
  });
  return count > 0;
};

// Check if email exists
const emailExists = async (email, excludeId = null) => {
  const where = { email };
  if (excludeId) {
    where.id = { not: excludeId };
  }

  const partner = await prisma.socio_economic_partner.findFirst({
    where,
  });

  return partner !== null;
};

// Check if phone number exists
const phoneExists = async (phoneNumber, excludeId = null) => {
  const where = { phone_number: phoneNumber };
  if (excludeId) {
    where.id = { not: excludeId };
  }

  const partner = await prisma.socio_economic_partner.findFirst({
    where,
  });

  return partner !== null;
};

module.exports = {
  getAllPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
  isPartnerInUse,
  emailExists,
  phoneExists,
};
