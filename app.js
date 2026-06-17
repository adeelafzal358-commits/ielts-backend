const express = require("express");
const cors = require("cors");

const app = express();

// =====================
// MIDDLEWARE
// =====================
app.use(cors());
app.use(express.json());

// =====================
// ROUTE IMPORTS
// =====================
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const candidateRoutes = require("./routes/candidate.routes");
const testRoutes = require("./routes/test.routes");
const resultRoutes = require("./routes/result.routes");
const authMiddleware = require("./src/middleware/auth.middleware");
const adminMiddleware = require("./src/middleware/admin.middleware");

// =====================
// ROUTES
// =====================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/results", resultRoutes);

// =====================
// TEST ROUTE
// =====================
app.get("/", (req, res) => {
  res.send("SERVER RUNNING 🚀");
});

// =====================
// PROTECTED ROUTE
// =====================
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You are authorized",
    user: req.user
  });
});

// =====================
// ADMIN DASHBOARD ROUTE
// =====================
app.get(
  "/api/admin/dashboard",
  authMiddleware,
  adminMiddleware,
  (req, res) => {
    res.json({
      message: "Welcome Admin Dashboard 🚀",
      stats: {
        users: 120,
        candidates: 45,
        exams: 10
      }
    });
  }
);

module.exports = app;