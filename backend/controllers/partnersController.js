const {
  getAllPartners: getAllPartnersModel,
  getPartnerById: getPartnerByIdModel,
  createPartner: createPartnerModel,
  updatePartner: updatePartnerModel,
  deletePartner: deletePartnerModel,
  isPartnerInUse,
  emailExists,
  phoneExists,
} = require("../models/partnersModels");

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Phone number validation (Algerian format: 10 digits starting with 0)
const phoneRegex = /^0[5-7][0-9]{8}$/;

// Get all socio-economic partners
const getAllPartners = async (req, res) => {
  try {
    const partners = await getAllPartnersModel();
    res.json({ success: true, data: partners });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching partners." });
  }
};

// Get a single partner by ID
const getPartnerById = async (req, res) => {
  const partnerId = parseInt(req.params.id);

  if (isNaN(partnerId)) {
    return res.status(400).json({ message: "Invalid partner ID." });
  }

  try {
    const partner = await getPartnerByIdModel(partnerId);

    if (!partner) {
      return res.status(404).json({ message: "Partner not found." });
    }

    res.json({ success: true, data: partner });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching partner." });
  }
};

// Create a new partner
const createPartner = async (req, res) => {
  const { full_name, phone_number, email, professionel_adress } = req.body;

  // Validation
  if (!full_name || full_name.trim() === "") {
    return res.status(400).json({ message: "Full name is required." });
  }

  if (!phone_number || phone_number.trim() === "") {
    return res.status(400).json({ message: "Phone number is required." });
  }

  if (!email || email.trim() === "") {
    return res.status(400).json({ message: "Email is required." });
  }

  if (full_name.length > 50) {
    return res
      .status(400)
      .json({ message: "Full name must be 50 characters or less." });
  }

  if (!phoneRegex.test(phone_number)) {
    return res
      .status(400)
      .json({
        message:
          "Invalid phone number format. Must be 10 digits starting with 0.",
      });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  if (email.length > 100) {
    return res
      .status(400)
      .json({ message: "Email must be 100 characters or less." });
  }

  if (professionel_adress && professionel_adress.length > 150) {
    return res
      .status(400)
      .json({
        message: "Professional address must be 150 characters or less.",
      });
  }

  try {
    // Check for duplicate email
    if (await emailExists(email)) {
      return res.status(409).json({ message: "Email already exists." });
    }

    // Check for duplicate phone number
    if (await phoneExists(phone_number)) {
      return res.status(409).json({ message: "Phone number already exists." });
    }

    const partnerData = {
      full_name: full_name.trim(),
      phone_number: phone_number.trim(),
      email: email.trim().toLowerCase(),
      professionel_adress: professionel_adress
        ? professionel_adress.trim()
        : null,
    };

    const newPartner = await createPartnerModel(partnerData);
    res.status(201).json({ success: true, data: newPartner });
  } catch (err) {
    console.error(err);
    // Handle unique constraint errors from database
    if (err.code === "P2002") {
      const field = err.meta?.target?.[0] || "field";
      return res.status(409).json({ message: `${field} already exists.` });
    }
    res.status(500).json({ message: "Error creating partner." });
  }
};

// Update a partner
const updatePartner = async (req, res) => {
  const partnerId = parseInt(req.params.id);
  const { full_name, phone_number, email, professionel_adress } = req.body;

  if (isNaN(partnerId)) {
    return res.status(400).json({ message: "Invalid partner ID." });
  }

  // Validation
  if (full_name !== undefined && full_name.trim() === "") {
    return res.status(400).json({ message: "Full name cannot be empty." });
  }

  if (phone_number !== undefined && phone_number.trim() === "") {
    return res.status(400).json({ message: "Phone number cannot be empty." });
  }

  if (email !== undefined && email.trim() === "") {
    return res.status(400).json({ message: "Email cannot be empty." });
  }

  if (full_name && full_name.length > 50) {
    return res
      .status(400)
      .json({ message: "Full name must be 50 characters or less." });
  }

  if (phone_number && !phoneRegex.test(phone_number)) {
    return res
      .status(400)
      .json({
        message:
          "Invalid phone number format. Must be 10 digits starting with 0.",
      });
  }

  if (email && !emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  if (email && email.length > 100) {
    return res
      .status(400)
      .json({ message: "Email must be 100 characters or less." });
  }

  if (professionel_adress && professionel_adress.length > 150) {
    return res
      .status(400)
      .json({
        message: "Professional address must be 150 characters or less.",
      });
  }

  try {
    // Check for duplicate email (excluding current partner)
    if (email && (await emailExists(email, partnerId))) {
      return res.status(409).json({ message: "Email already exists." });
    }

    // Check for duplicate phone number (excluding current partner)
    if (phone_number && (await phoneExists(phone_number, partnerId))) {
      return res.status(409).json({ message: "Phone number already exists." });
    }

    const partnerData = {};
    if (full_name !== undefined) partnerData.full_name = full_name.trim();
    if (phone_number !== undefined)
      partnerData.phone_number = phone_number.trim();
    if (email !== undefined) partnerData.email = email.trim().toLowerCase();
    if (professionel_adress !== undefined)
      partnerData.professionel_adress = professionel_adress
        ? professionel_adress.trim()
        : null;

    const updatedPartner = await updatePartnerModel(partnerId, partnerData);
    res.json({ success: true, data: updatedPartner });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Partner not found." });
    }
    if (err.code === "P2002") {
      const field = err.meta?.target?.[0] || "field";
      return res.status(409).json({ message: `${field} already exists.` });
    }
    res.status(500).json({ message: "Error updating partner." });
  }
};

// Delete a partner
const deletePartner = async (req, res) => {
  const partnerId = parseInt(req.params.id);

  if (isNaN(partnerId)) {
    return res.status(400).json({ message: "Invalid partner ID." });
  }

  try {
    // Check if partner is in use
    const inUse = await isPartnerInUse(partnerId);
    if (inUse) {
      return res.status(409).json({
        message:
          "Cannot delete partner. They are currently assigned to one or more jury sessions.",
      });
    }

    await deletePartnerModel(partnerId);
    res.json({ success: true, message: "Partner deleted successfully." });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Partner not found." });
    }
    res.status(500).json({ message: "Error deleting partner." });
  }
};

module.exports = {
  getAllPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
};
