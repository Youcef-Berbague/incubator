// Lightweight validators without external deps to avoid requiring new packages during CI
const isIntish = (v) => {
  if (typeof v === "number") return Number.isInteger(v);
  if (typeof v === "string" && v.trim() !== "") return String(parseInt(v, 10)) === v || !Number.isNaN(parseInt(v, 10));
  return false;
};

const validateCreateProject = (req, res, next) => {
  const errors = [];
  const { projectTitle, numberOfStudents, numberOfSupervisors, facultyId, departmentId } = req.body || {};
  if (!projectTitle || typeof projectTitle !== "string" || projectTitle.trim().length < 5)
    errors.push({ field: "projectTitle", msg: "projectTitle must be at least 5 chars" });
  if (!isIntish(numberOfStudents) || parseInt(numberOfStudents, 10) < 1)
    errors.push({ field: "numberOfStudents", msg: "numberOfStudents must be >= 1" });
  if (!isIntish(numberOfSupervisors) || parseInt(numberOfSupervisors, 10) < 1)
    errors.push({ field: "numberOfSupervisors", msg: "numberOfSupervisors must be >= 1" });
  if (!isIntish(facultyId)) errors.push({ field: "facultyId", msg: "facultyId is required and must be an integer" });
  if (!isIntish(departmentId)) errors.push({ field: "departmentId", msg: "departmentId is required and must be an integer" });
  if (errors.length) return res.status(400).json({ success: false, errors });
  return next();
};

const validateCreateUser = (req, res, next) => {
  const errors = [];
  const { email, first_name, last_name } = req.body || {};
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== "string" || !emailRe.test(email)) errors.push({ field: "email", msg: "Valid email is required" });
  if (!first_name || typeof first_name !== "string" || first_name.trim().length < 2)
    errors.push({ field: "first_name", msg: "first_name is required" });
  if (!last_name || typeof last_name !== "string" || last_name.trim().length < 2)
    errors.push({ field: "last_name", msg: "last_name is required" });
  if (errors.length) return res.status(400).json({ success: false, errors });
  return next();
};

const validateCreateFaculty = (req, res, next) => {
  const errors = [];
  const { faculty_name, faculty_name_en } = req.body || {};
  if (!faculty_name || typeof faculty_name !== "string" || faculty_name.trim().length < 2)
    errors.push({ field: "faculty_name", msg: "faculty_name is required" });
  if (!faculty_name_en || typeof faculty_name_en !== "string" || faculty_name_en.trim().length < 2)
    errors.push({ field: "faculty_name_en", msg: "faculty_name_en is required" });
  if (errors.length) return res.status(400).json({ success: false, errors });
  return next();
};

const validateCreateFAQ = (req, res, next) => {
  const errors = [];
  const { question, answer } = req.body || {};
  if (!question || typeof question !== "string" || question.trim().length < 5)
    errors.push({ field: "question", msg: "question is required" });
  if (!answer || typeof answer !== "string" || answer.trim().length < 5)
    errors.push({ field: "answer", msg: "answer is required" });
  if (errors.length) return res.status(400).json({ success: false, errors });
  return next();
};

module.exports = {
  validateCreateProject,
  validateCreateUser,
  validateCreateFaculty,
  validateCreateFAQ,
};
