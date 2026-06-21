const express = require("express");
const router = express.Router();

const testController = require("../src/controllers/test.controller");
const authMiddleware = require("../src/middleware/auth.middleware");
const adminMiddleware = require("../src/middleware/admin.middleware");

// =====================
// TEST CRUD
// =====================
router.post("/", authMiddleware, adminMiddleware, testController.createTest);
router.get("/", authMiddleware, testController.getAllTests);
router.get("/:id", authMiddleware, testController.getTestById);
router.put("/:id/questions/:questionId", authMiddleware, adminMiddleware, testController.updateQuestion);
router.delete("/:id", authMiddleware, adminMiddleware, testController.deleteTest);

// =====================
// QUESTION MANAGEMENT
// =====================
router.post("/:id/questions", authMiddleware, adminMiddleware, testController.addQuestion);
router.delete("/:id/questions/:questionId", authMiddleware, adminMiddleware, testController.deleteQuestion);

module.exports = router;