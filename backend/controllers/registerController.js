const bcrypt = require("bcrypt");
const ROLES = require("../config/rolesList");
const { findUserByEmail, createNewUser } = require("../models/UsersModels");

const handleNewUser = async (req, res) => {
  const { first_name, last_name, email, phone_number, password } = req.body;

  if (!first_name || !last_name || !email || !phone_number || !password) {
    return res.status(400).json({
      message:
        "First name, last name, email, phone number, and password are required.",
    });
  }

  try {
    const duplicate = await findUserByEmail(email);

    if (duplicate) {
      return res.status(409).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await createNewUser({
      first_name,
      last_name,
      email,
      phone_number,
      password: hashedPassword,
      role: [ROLES.student],
      status: "active",
    });

    res.status(201).json({
      id: newUser.id,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      phone_number: newUser.phone_number,
      role: newUser.role,
      status: newUser.status,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while creating user." });
  }
};

module.exports = { handleNewUser };
