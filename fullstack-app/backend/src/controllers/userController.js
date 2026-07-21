const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const User = require("../models/User");

// =============================
// Get All Users
// =============================
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: {
        exclude: ["password"],
      },
      order: [["id", "DESC"]],
    });

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =============================
// Get User By ID
// =============================
exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: {
        exclude: ["password"],
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =============================
// Create User
// =============================
exports.createUser = async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      phone,
      role,
    } = req.body;

    const exists = await User.findOne({
      where: {
        email,
      },
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      full_name,
      email,
      password: hashedPassword,
      phone,
      role,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================
// Update User
// =============================
exports.updateUser = async (req, res) => {
  try {

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isAdmin = req.user.role === "admin";
    const isSelf = req.user.id === user.id;

    // مستخدم عادي يقدر يعدل بياناته هو بس، والأدمن يقدر يعدل أي حد
    if (!isAdmin && !isSelf) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own account",
      });
    }

    const {
      full_name,
      email,
      phone,
      password,
    } = req.body;

    // منع أي مستخدم غير أدمن من ترقية نفسه — الدور يتغير من الأدمن بس
    const role = isAdmin ? (req.body.role || user.role) : user.role;

    const emailExists = await User.findOne({
      where: {
        email,
        id: {
          [Op.ne]: user.id,
        },
      },
    });

    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    let hashedPassword = user.password;

    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    await user.update({
      full_name,
      email,
      phone,
      role,
      password: hashedPassword,
    });

    res.json({
      success: true,
      message: "User updated successfully",
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =============================
// Delete User
// =============================
exports.deleteUser = async (req, res) => {
  try {

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: "User deleted successfully",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};