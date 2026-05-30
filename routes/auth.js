const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const auth = require("../middleware/auth");

// ======================
// REGISTER
// ======================
router.post("/register", async (req, res) => {
  try {

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists ❌" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      xp: 0,
      level: 1,
      streak: 0,
      badges: []
    });

    res.json({
      message: "User registered ✔",
      user
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ======================
// LOGIN
// ======================
router.post("/login", async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found ❌" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials ❌" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful ✔",
      token
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ======================
// GET CURRENT USER
// ======================
router.get("/me", auth, async (req, res) => {
  try {

    const user = await User.findById(req.user.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found ❌" });
    }

    res.json(user);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ======================
// LEADERBOARD
// ======================
router.get("/leaderboard", async (req, res) => {
  try {

    const users = await User.find()
      .sort({ xp: -1 })
      .limit(10)
      .select("name xp level streak");

    res.json({ leaderboard: users });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;