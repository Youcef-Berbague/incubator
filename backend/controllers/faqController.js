const {
  getAllFAQs: getAllFAQsModel,
  getActiveFAQs: getActiveFAQsModel,
  getFAQById: getFAQByIdModel,
  createFAQ: createFAQModel,
  updateFAQ: updateFAQModel,
  deleteFAQ: deleteFAQModel,
  getFAQCategories: getFAQCategoriesModel,
} = require("../models/faqModels");

// Get all FAQs (with optional filters)
const getAllFAQs = async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      search: req.query.search,
    };

    if (req.query.isactive !== undefined) {
      filters.isactive = req.query.isactive === "true";
    }

    const faqs = await getAllFAQsModel(filters);
    res.json({ success: true, data: faqs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching FAQs." });
  }
};

// Get active FAQs only (public endpoint)
const getActiveFAQs = async (req, res) => {
  try {
    const category = req.query.category || null;
    const faqs = await getActiveFAQsModel(category);
    res.json({ success: true, data: faqs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching active FAQs." });
  }
};

// Get a single FAQ by ID
const getFAQById = async (req, res) => {
  const faqId = parseInt(req.params.id);

  if (isNaN(faqId)) {
    return res.status(400).json({ message: "Invalid FAQ ID." });
  }

  try {
    const faq = await getFAQByIdModel(faqId);

    if (!faq) {
      return res.status(404).json({ message: "FAQ not found." });
    }

    res.json({ success: true, data: faq });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching FAQ." });
  }
};

// Create a new FAQ
const createFAQ = async (req, res) => {
  const { question, answer, category, keywords, priority, isactive } = req.body;

  // Validation
  if (!question || question.trim() === "") {
    return res.status(400).json({ message: "Question is required." });
  }

  if (!answer || answer.trim() === "") {
    return res.status(400).json({ message: "Answer is required." });
  }

  if (question.length > 500) {
    return res
      .status(400)
      .json({ message: "Question must be 500 characters or less." });
  }

  if (category && category.length > 50) {
    return res
      .status(400)
      .json({ message: "Category must be 50 characters or less." });
  }

  try {
    const faqData = {
      question: question.trim(),
      answer: answer.trim(),
      category: category ? category.trim() : null,
      keywords: keywords ? keywords.trim() : null,
      priority: priority !== undefined ? parseInt(priority) : 0,
      isactive: isactive !== undefined ? isactive : true,
    };

    const newFAQ = await createFAQModel(faqData);
    res.status(201).json({ success: true, data: newFAQ });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating FAQ." });
  }
};

// Update a FAQ
const updateFAQ = async (req, res) => {
  const faqId = parseInt(req.params.id);
  const { question, answer, category, keywords, priority, isactive } = req.body;

  if (isNaN(faqId)) {
    return res.status(400).json({ message: "Invalid FAQ ID." });
  }

  // Validation
  if (question !== undefined && question.trim() === "") {
    return res.status(400).json({ message: "Question cannot be empty." });
  }

  if (answer !== undefined && answer.trim() === "") {
    return res.status(400).json({ message: "Answer cannot be empty." });
  }

  if (question && question.length > 500) {
    return res
      .status(400)
      .json({ message: "Question must be 500 characters or less." });
  }

  if (category && category.length > 50) {
    return res
      .status(400)
      .json({ message: "Category must be 50 characters or less." });
  }

  try {
    const faqData = {};
    if (question !== undefined) faqData.question = question.trim();
    if (answer !== undefined) faqData.answer = answer.trim();
    if (category !== undefined)
      faqData.category = category ? category.trim() : null;
    if (keywords !== undefined)
      faqData.keywords = keywords ? keywords.trim() : null;
    if (priority !== undefined) faqData.priority = parseInt(priority);
    if (isactive !== undefined) faqData.isactive = isactive;

    const updatedFAQ = await updateFAQModel(faqId, faqData);
    res.json({ success: true, data: updatedFAQ });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") {
      return res.status(404).json({ message: "FAQ not found." });
    }
    res.status(500).json({ message: "Error updating FAQ." });
  }
};

// Delete a FAQ
const deleteFAQ = async (req, res) => {
  const faqId = parseInt(req.params.id);

  if (isNaN(faqId)) {
    return res.status(400).json({ message: "Invalid FAQ ID." });
  }

  try {
    await deleteFAQModel(faqId);
    res.json({ success: true, message: "FAQ deleted successfully." });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") {
      return res.status(404).json({ message: "FAQ not found." });
    }
    res.status(500).json({ message: "Error deleting FAQ." });
  }
};

// Get FAQ categories
const getFAQCategories = async (req, res) => {
  try {
    const categories = await getFAQCategoriesModel();
    res.json({ success: true, data: categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching FAQ categories." });
  }
};

module.exports = {
  getAllFAQs,
  getActiveFAQs,
  getFAQById,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getFAQCategories,
};
