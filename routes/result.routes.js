const express = require("express");
const router = express.Router();

const resultController = require("../src/controllers/result.controller");
const authMiddleware = require("../src/middleware/auth.middleware");
const adminMiddleware = require("../src/middleware/admin.middleware");

// =====================
// USER ROUTES
// =====================
router.post("/submit", authMiddleware, resultController.submitResult);
router.get("/my", authMiddleware, resultController.getMyResults);

// =====================
// ADMIN ROUTES
// =====================
router.get("/", authMiddleware, adminMiddleware, resultController.getAllResults);
router.get("/:id", authMiddleware, adminMiddleware, resultController.getResultById);

module.exports = router;