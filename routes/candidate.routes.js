const express = require("express");
const router = express.Router();

const candidateController = require("../src/controllers/candidateController");
const authMiddleware = require("../src/middleware/auth.middleware");
const adminMiddleware = require("../src/middleware/admin.middleware");

// =====================
// CRUD ROUTES
// =====================
router.post("/", authMiddleware, adminMiddleware, candidateController.createCandidate);
router.get("/", authMiddleware, adminMiddleware, candidateController.getAllCandidates);
router.get("/search", authMiddleware, adminMiddleware, candidateController.searchCandidates);
router.get("/paginated", authMiddleware, adminMiddleware, candidateController.getCandidatesPaginated);
router.get("/stats", authMiddleware, adminMiddleware, candidateController.getCandidateStats);
router.get("/:id", authMiddleware, adminMiddleware, candidateController.getCandidateById);
router.put("/:id", authMiddleware, adminMiddleware, candidateController.updateCandidate);
router.delete("/:id", authMiddleware, adminMiddleware, candidateController.deleteCandidate);

// =====================
// EXPORT ROUTES
// =====================
router.get("/export/csv", authMiddleware, adminMiddleware, candidateController.exportExcel);
router.get("/export/pdf", authMiddleware, adminMiddleware, candidateController.exportPDF);

module.exports = router;