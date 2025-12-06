const { prisma } = require("../config/db");

// Get all FAQs (with optional filters)
const getAllFAQs = async (filters = {}) => {
  const where = {};

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.isactive !== undefined) {
    where.isactive = filters.isactive;
  }

  if (filters.search) {
    where.OR = [
      { question: { contains: filters.search, mode: "insensitive" } },
      { answer: { contains: filters.search, mode: "insensitive" } },
      { keywords: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return await prisma.faq.findMany({
    where,
    orderBy: [{ priority: "desc" }, { createdat: "desc" }],
  });
};

// Get active FAQs only
const getActiveFAQs = async (category = null) => {
  const where = { isactive: true };

  if (category) {
    where.category = category;
  }

  return await prisma.faq.findMany({
    where,
    orderBy: [{ priority: "desc" }, { createdat: "desc" }],
  });
};

// Get a single FAQ by ID
const getFAQById = async (faqId) => {
  return await prisma.faq.findUnique({
    where: {
      id: faqId,
    },
  });
};

// Create a new FAQ
const createFAQ = async (faqData) => {
  return await prisma.faq.create({
    data: {
      question: faqData.question,
      answer: faqData.answer,
      category: faqData.category || null,
      keywords: faqData.keywords || null,
      priority: faqData.priority || 0,
      isactive: faqData.isactive !== undefined ? faqData.isactive : true,
    },
  });
};

// Update a FAQ
const updateFAQ = async (faqId, faqData) => {
  const dataToUpdate = {
    updatedat: new Date(),
  };

  if (faqData.question !== undefined) dataToUpdate.question = faqData.question;
  if (faqData.answer !== undefined) dataToUpdate.answer = faqData.answer;
  if (faqData.category !== undefined) dataToUpdate.category = faqData.category;
  if (faqData.keywords !== undefined) dataToUpdate.keywords = faqData.keywords;
  if (faqData.priority !== undefined) dataToUpdate.priority = faqData.priority;
  if (faqData.isactive !== undefined) dataToUpdate.isactive = faqData.isactive;

  return await prisma.faq.update({
    where: {
      id: faqId,
    },
    data: dataToUpdate,
  });
};

// Delete a FAQ
const deleteFAQ = async (faqId) => {
  return await prisma.faq.delete({
    where: {
      id: faqId,
    },
  });
};

// Get FAQ categories (distinct)
const getFAQCategories = async () => {
  const faqs = await prisma.faq.findMany({
    where: {
      category: {
        not: null,
      },
    },
    distinct: ["category"],
    select: {
      category: true,
    },
  });

  return faqs.map((faq) => faq.category);
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
