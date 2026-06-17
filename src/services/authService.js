const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../config/db");

// =====================
// REGISTER USER
// =====================
const registerUser = async (email, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        email,
        password: hashedPassword,
      },
    ])
    .select("id, email, created_at");

  if (error) throw new Error(error.message);

  return data[0];
};

// =====================
// LOGIN USER (VERIFY ONLY)
// =====================
const loginUser = async (email, password) => {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  return user;
};

// =====================
// ACCESS TOKEN
// =====================
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || "user",
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

// =====================
// REFRESH TOKEN
// =====================
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
    },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

// =====================
// EXPORTS
// =====================
module.exports = {
  registerUser,
  loginUser,
  generateAccessToken,
  generateRefreshToken,
};