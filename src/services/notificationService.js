const transporter = require("../utils/mailer");

// EMAIL
exports.sendNewCandidateEmail = async (candidate) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: "New Candidate Registered",
    text: `
Name: ${candidate.candidate_name}
Email: ${candidate.email}
Test: ${candidate.test_type}
Venue: ${candidate.venue}
    `,
  };

  await transporter.sendMail(mailOptions);
};

// DB NOTIFICATION (simple console log for now)
exports.createNotification = async (message) => {
  console.log("🔔 Notification:", message);
  return { message };
};