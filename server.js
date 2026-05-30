const express = require("express")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer")
const PDFDocument = require("pdfkit")
const { createClient } = require("@supabase/supabase-js")
require("dotenv").config()

const app = express()

app.use(cors({ origin: "http://localhost:5173" }))
app.use(express.json())

// ================= SUPABASE =================
const supabase = createClient(
  "https://YOUR_PROJECT_URL.supabase.co",
  "YOUR_SECRET_KEY"
)

// ================= EMAIL =================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "yourgmail@gmail.com",
    pass: "your_app_password"
  }
})

// ================= REGISTER =================
app.post("/register", async (req, res) => {

  const hash = await bcrypt.hash(req.body.password, 10)

  const { data, error } = await supabase
    .from("users")
    .insert([{
      name: req.body.name,
      email: req.body.email,
      password: hash,
      role: req.body.role || "student"
    }])

  res.json({ data, error })
})

// ================= LOGIN =================
app.post("/login", async (req, res) => {

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("email", req.body.email)
    .single()

  if (!data) return res.json({ error: "User not found" })

  const ok = await bcrypt.compare(req.body.password, data.password)
  if (!ok) return res.json({ error: "Wrong password" })

  const token = jwt.sign(
    { id: data.id, role: data.role },
    "secretkey",
    { expiresIn: "1d" }
  )

  res.json({ token, user: data })
})

// ================= AUTH =================
const auth = (req, res, next) => {

  const token = req.headers.authorization

  if (!token) return res.json({ error: "No token" })

  try {
    const decoded = jwt.verify(token, "secretkey")
    req.user = decoded
    next()
  } catch {
    res.json({ error: "Invalid token" })
  }
}

// ================= BOOKING + PDF + EMAIL =================
app.post("/book", auth, async (req, res) => {

  const { data } = await supabase
    .from("bookings")
    .insert([{
      user_id: req.user.id,
      name: req.body.name,
      test_date: req.body.testDate,
      email: req.body.email
    }])

  const doc = new PDFDocument()
  let buffers = []

  doc.on("data", buffers.push.bind(buffers))

  doc.on("end", async () => {

    const pdfBuffer = Buffer.concat(buffers)

    await transporter.sendMail({
      from: "IELTS System <yourgmail@gmail.com>",
      to: req.body.email,
      subject: "🎓 IELTS Booking Confirmation + Admit Card",
      html: `
        <h2>Booking Confirmed</h2>
        <p>Name: ${req.body.name}</p>
        <p>Test Date: ${req.body.testDate}</p>
        <p>Status: CONFIRMED</p>
      `,
      attachments: [
        {
          filename: "admit-card.pdf",
          content: pdfBuffer
        }
      ]
    })

  })

  doc.fontSize(20).text("IELTS ADMIT CARD")
  doc.moveDown()
  doc.fontSize(14).text("Name: " + req.body.name)
  doc.text("Test Date: " + req.body.testDate)
  doc.text("Center: AEO Pakistan")
  doc.text("Status: CONFIRMED")
  doc.end()

  res.json({
    message: "Booking saved + Email sent + PDF generated",
    data
  })
})

// ================= GET BOOKINGS (ADMIN) =================
app.get("/bookings", auth, async (req, res) => {

  if (req.user.role !== "admin") {
    return res.json({ error: "Access denied" })
  }

  const { data } = await supabase
    .from("bookings")
    .select("*")

  res.json(data)
})

// ================= PAYMENT =================
app.post("/payment", auth, async (req, res) => {

  const { data } = await supabase
    .from("payments")
    .insert([{
      user_id: req.user.id,
      amount: req.body.amount,
      method: req.body.method,
      email: req.body.email
    }])

  await transporter.sendMail({
    from: "IELTS System <yourgmail@gmail.com>",
    to: req.body.email,
    subject: "💳 Payment Confirmation",
    html: `
      <h2>Payment Successful</h2>
      <p>Amount: ${req.body.amount}</p>
      <p>Method: ${req.body.method}</p>
      <p>Status: PAID</p>
    `
  })

  res.json({
    message: "Payment saved + Email sent",
    data
  })
})

// ================= SERVER =================
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000")
})