const express = require("express");
const router = express.Router();

const authController = require("../src/controllers/auth.controller");

router.post("/register", authController.register);
router.post("/login", authController.login);

router.post("/student/register", authController.studentRegister);
router.post("/student/login", authController.studentLogin);

module.exports = router;