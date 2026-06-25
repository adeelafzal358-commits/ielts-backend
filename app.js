const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const candidateRoutes = require("./src/routes/candidate.routes");
const testRoutes = require("./src/routes/test.routes");
const resultRoutes = require("./src/routes/result.routes");
const attemptRoutes = require("./routes/attempt.routes");
const authMiddleware = require("./src/middleware/auth.middleware");
const adminMiddleware = require("./src/middleware/admin.middleware");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/attempts", attemptRoutes);

app.get("/", (req, res) => {
  res.send("SERVER RUNNING 🚀");
});

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ message: "You are authorized", user: req.user });
});

app.get("/api/admin/dashboard", authMiddleware, adminMiddleware, (req, res) => {
  res.json({
    message: "Welcome Admin Dashboard 🚀",
    stats: { users: 120, candidates: 45, exams: 10 }
  });
});

module.exports = app;