const express = require("express");
const router = express.Router();

const userController = require("../src/controllers/user.controller");

const authMiddleware = require("../src/middleware/auth.middleware");
const adminMiddleware = require("../src/middleware/admin.middleware");

// ALL ROUTES ADMIN ONLY

router.get("/", authMiddleware, adminMiddleware, userController.getAllUsers);

router.post("/", authMiddleware, adminMiddleware, userController.createUser);

router.delete("/:id", authMiddleware, adminMiddleware, userController.deleteUser);

router.put("/:id", authMiddleware, adminMiddleware, userController.updateUserRole);

module.exports = router;