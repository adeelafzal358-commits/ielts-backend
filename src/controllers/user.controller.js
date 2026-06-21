const User = require("../models/User");

// =====================
// GET ALL USERS (ADMIN)
// =====================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================
// CREATE USER (ADMIN)
// =====================
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role: role || "user"
    });

    res.json({
      message: "User created successfully",
      user: newUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================
// DELETE USER (ADMIN)
// =====================
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User deleted",
      user: deleted
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================
// UPDATE USER ROLE
// =====================
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Role updated",
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};