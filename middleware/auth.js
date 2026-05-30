const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;

  // Token check
  if (!authHeader) {
    return res.status(401).json({ message: "No token, access denied ❌" });
  }

  // Bearer token split
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Invalid token format ❌" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    req.user = decoded;

    next(); // allow access
  } catch (err) {
    return res.status(401).json({ message: "Token not valid ❌" });
  }
};