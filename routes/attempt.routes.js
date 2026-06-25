const express = require("express");
const router = express.Router();

const attemptController = require("../src/controllers/attempt.controller");
const authMiddleware = require("../src/middleware/auth.middleware");

// =============================================
// STUDENT ROUTES (auth required)
// =============================================

// Start ya resume attempt
router.post("/start", authMiddleware, attemptController.startAttempt);

// Mid-test auto-save
router.post("/:attemptId/save", authMiddleware, attemptController.saveAnswers);

// Submit + auto-score
router.post("/:attemptId/submit", authMiddleware, attemptController.submitAttempt);

// Apne saare attempts dekho
router.get("/my", authMiddleware, attemptController.getMyAttempts);

// Single attempt detail
router.get("/:attemptId", authMiddleware, attemptController.getAttemptById);

// =============================================
// ADMIN ROUTES (auth required)
// =============================================

// Pending manual scoring list
router.get("/admin/pending", authMiddleware, attemptController.getPendingManualScoring);

// Manual score submit karo
router.put("/:attemptId/manual-score", authMiddleware, attemptController.submitManualScore);

module.exports = router;