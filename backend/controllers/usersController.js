const {
  getAllUsers,
  findUserByEmail,
  createNewUser,
  getUserByID,
  deleteUserByID,
  updateUserByID,
} = require("../models/UsersModels");

const bcrypt = require("bcrypt");
const ROLES = require("../config/rolesList");

const getAll = async (req, res) => {
  try {
    const allUsers = await getAllUsers();
    res.json(allUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching users." });
  }
};

const createNew = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone_number,
    password,
    roles,
    academic_level,
    p_team_id,
    departement_id,
  } = req.body;

  if (!first_name || !last_name || !email || !phone_number || !password) {
    return res.status(400).json({
      message:
        "First name, last name, email, phone number, and password are required.",
    });
  }

  try {
    const duplicate = await findUserByEmail(email);
    if (duplicate)
      return res.status(409).json({ message: "User already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);

    // منع العميل من إنشاء مستخدم بأدوار إدارية
    let finalRoles = [ROLES.student];
    if (req.user && req.user.roles) {
      const userRoles = Array.isArray(req.user.roles)
        ? req.user.roles
        : [req.user.roles];
      if (
        userRoles.includes(ROLES.admin) ||
        userRoles.includes(ROLES.superAdmin)
      ) {
        finalRoles =
          Array.isArray(roles) && roles.length > 0 ? roles : [ROLES.student];
      }
    }

    const newUser = await createNewUser({
      first_name,
      last_name,
      email,
      phone_number,
      password: hashedPassword,
      role: finalRoles,
      status: "active",
      academic_level: academic_level || null,
      p_team_id: p_team_id || null,
      departement_id: departement_id || null,
    });

    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while creating user." });
  }
};

const updateuser = async (req, res) => {
  const {
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
  } = req.body;
  const requester = req.user;

  if (!id) return res.status(400).json({ message: "User ID is required." });

  try {
    // المستخدم العادي لا يمكنه تعديل غيره
    const requesterRoles = Array.isArray(requester?.roles)
      ? requester.roles
      : [requester?.roles].filter(Boolean);
    const isAdmin =
      requesterRoles.includes(ROLES.admin) ||
      requesterRoles.includes(ROLES.superAdmin);

    if (!isAdmin && requester?.userInfos?.userId !== parseInt(id)) {
      return res.status(403).json({ message: "Access denied." });
    }

    // العميل لا يمكنه تعديل الدور أو الحالة
    const updateData = {};
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (email !== undefined) updateData.email = email;
    if (phone_number !== undefined) updateData.phone_number = phone_number;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    // Only admins can modify these fields
    if (isAdmin) {
      if (role !== undefined) updateData.role = role;
      if (status !== undefined) updateData.status = status;
      if (academic_level !== undefined)
        updateData.academic_level = academic_level;
      if (p_team_id !== undefined) updateData.p_team_id = p_team_id;
      if (departement_id !== undefined)
        updateData.departement_id = departement_id;
    }

    const updatedUser = await updateUserByID({
      id: parseInt(id),
      ...updateData,
    });
    if (!updatedUser)
      return res.status(404).json({ message: `User ID ${id} not found.` });

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating user." });
  }
};

const deleteuser = async (req, res) => {
  const { id } = req.body;

  if (!id) return res.status(400).json({ message: "User ID is required." });

  try {
    const deletedUser = await deleteUserByID(parseInt(id));
    if (!deletedUser) {
      return res.status(404).json({ message: `User ID ${id} not found.` });
    }

    res.json({ message: `User ID ${id} deleted.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting user." });
  }
};

const getuser = async (req, res) => {
  const userId = parseInt(req.params.id);
  const requesterId = req.id;
  const requesterRoles = Array.isArray(req.roles)
    ? req.roles
    : [req.roles].filter(Boolean);

  try {
    // المستخدم العادي لا يمكنه رؤية مستخدم آخر
    const isAdmin =
      requesterRoles.includes(ROLES.admin) ||
      requesterRoles.includes(ROLES.superAdmin);

    if (!isAdmin && userId !== requesterId) {
      return res.status(403).json({ message: "Access denied." });
    }

    const user = await getUserByID(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching user." });
  }
};

const getMe = async (req, res) => {
  const requesterId = req.id;

  try {
    const user = await getUserByID(requesterId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching user." });
  }
};

module.exports = {
  getAll,
  createNew,
  updateuser,
  deleteuser,
  getuser,
  getMe,
};
