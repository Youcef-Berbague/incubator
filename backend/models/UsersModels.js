// models/users.js
const { prisma } = require("../config/db");

const findUserByEmail = async (email) => {
  return await prisma.users.findUnique({ where: { email } });
};

const createNewUser = async (userData) => {
  return await prisma.users.create({
    data: {
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      phone_number: userData.phone_number,
      password: userData.password,
      role: userData.role || [],
      status: userData.status || null,
      academic_level: userData.academic_level || null,
      p_team_id: userData.p_team_id || null,
      departement_id: userData.departement_id || null,
      createdate: new Date(),
      updatedate: new Date(),
    },
  });
};

const getAllUsers = async () => {
  return await prisma.users.findMany({
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      phone_number: true,
      role: true,
      status: true,
      academic_level: true,
      p_team_id: true,
      departement_id: true,
      createdate: true,
      updatedate: true,
    },
  });
};

const getUserByID = async (userId) => {
  return await prisma.users.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      phone_number: true,
      role: true,
      status: true,
      academic_level: true,
      p_team_id: true,
      departement_id: true,
      createdate: true,
      updatedate: true,
    },
  });
};

const deleteUserByID = async (id) => {
  const existingUser = await prisma.users.findUnique({ where: { id } });
  if (!existingUser) return null;

  return await prisma.users.delete({ where: { id } });
};

const updateUserByID = async ({
  id,
  first_name,
  last_name,
  email,
  phone_number,
  password,
  role,
  status,
  academic_level,
  p_team_id,
  departement_id,
}) => {
  const existingUser = await prisma.users.findUnique({ where: { id } });
  if (!existingUser) return null;

  const updateData = {
    updatedate: new Date(),
  };

  if (first_name !== undefined) updateData.first_name = first_name;
  if (last_name !== undefined) updateData.last_name = last_name;
  if (email !== undefined) updateData.email = email;
  if (phone_number !== undefined) updateData.phone_number = phone_number;
  if (password !== undefined) updateData.password = password;
  if (role !== undefined) updateData.role = role;
  if (status !== undefined) updateData.status = status;
  if (academic_level !== undefined) updateData.academic_level = academic_level;
  if (p_team_id !== undefined) updateData.p_team_id = p_team_id;
  if (departement_id !== undefined) updateData.departement_id = departement_id;

  return await prisma.users.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      phone_number: true,
      role: true,
      status: true,
      academic_level: true,
      p_team_id: true,
      departement_id: true,
      createdate: true,
      updatedate: true,
    },
  });
};

const getUserRoles = async (id) => {
  const existingUser = await prisma.users.findUnique({
    where: { id },
    select: { role: true },
  });
  if (!existingUser) return null;

  return existingUser.role;
};

module.exports = {
  findUserByEmail,
  createNewUser,
  getAllUsers,
  getUserByID,
  deleteUserByID,
  updateUserByID,
  getUserRoles,
};
