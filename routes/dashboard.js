const express = require("express");
const router = express.Router();

// ======================
// SIMPLE DASHBOARD TEST
// ======================
router.get("/", (req, res) => {
  res.json({
    message: "Dashboard working ✔",
    status: "success"
  });
});

// ======================
// USER SUMMARY (SAFE BASIC VERSION)
// ======================
router.get("/summary", async (req, res) => {
  try {

    res.json({
      totalTests: 0,
      averageBand: 0,
      xp: 0,
      level: 1,
      streak: 0,
      message: "Summary endpoint ready ✔"
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// ======================
// LEADERBOARD (TEMP MOCK - SAFE)
// ======================
router.get("/leaderboard", async (req, res) => {
  try {

    res.json({
      leaderboard: [
        {
          name: "Demo User 1",
          xp: 100,
          level: 2,
          streak: 3
        },
        {
          name: "Demo User 2",
          xp: 80,
          level: 1,
          streak: 1
        }
      ]
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;