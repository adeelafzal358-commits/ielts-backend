const express = require("express");
const router = express.Router();

const Test = require("../models/Test");
const Result = require("../models/Result");
const User = require("../models/User");

// ======================
// GET ALL TESTS
// ======================
router.get("/", async (req, res) => {
  try {
    const tests = await Test.find();
    res.json(tests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================
// CREATE TEST (ADMIN / DEV)
// ======================
router.post("/create", async (req, res) => {
  try {
    const test = await Test.create(req.body);
    res.json({ message: "Test created ✔", test });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================
// SUBMIT TEST (MAIN LOGIC)
// ======================
router.post("/submit", async (req, res) => {
  try {

    const { userId, testId, answers } = req.body;

    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({ message: "Test not found ❌" });
    }

    let score = 0;

    const detailedAnswers = test.questions.map((q, index) => {

      const selected = answers[index];
      const correct = q.answer === selected;

      if (correct) score++;

      return {
        question: q.question,
        selected: selected || "",
        correct,
        category: q.category || "General"
      };
    });

    // ======================
    // BAND CALCULATION
    // ======================
    const percentage = (score / test.questions.length) * 100;

    let band = 1;

    if (percentage >= 90) band = 9;
    else if (percentage >= 80) band = 8;
    else if (percentage >= 70) band = 7;
    else if (percentage >= 60) band = 6;
    else if (percentage >= 50) band = 5;
    else if (percentage >= 40) band = 4;
    else if (percentage >= 30) band = 3;
    else if (percentage >= 20) band = 2;

    // ======================
    // SAVE RESULT
    // ======================
    const result = await Result.create({
      userId,
      testId,
      score,
      total: test.questions.length,
      band,
      answers: detailedAnswers
    });

    // ======================
    // GAMIFICATION SYSTEM
    // ======================
    const user = await User.findById(userId);

    let xpEarned = score * 10;

    user.xp = (user.xp || 0) + xpEarned;

    // LEVEL SYSTEM
    if (user.xp >= 300) user.level = 5;
    else if (user.xp >= 200) user.level = 4;
    else if (user.xp >= 100) user.level = 3;
    else if (user.xp >= 50) user.level = 2;
    else user.level = 1;

    user.streak = (user.streak || 0) + 1;

    await user.save();

    // ======================
    // RESPONSE
    // ======================
    res.json({
      message: "Test Submitted ✔",
      score,
      total: test.questions.length,
      band,
      xp: xpEarned,
      level: user.level,
      streak: user.streak,
      resultId: result._id
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================
// USER RESULTS
// ======================
router.get("/results", async (req, res) => {
  try {

    const results = await Result.find().sort({ createdAt: -1 });

    res.json(results);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;