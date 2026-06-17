const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  candidate_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ""
  },
  cnic: {
    type: String,
    default: ""
  },
  passport: {
    type: String,
    default: ""
  },
  test_type: {
    type: String,
    enum: ["IELTS Academic", "IELTS General Training"],
    required: true
  },
  test_date: {
    type: Date,
    default: null
  },
  venue: {
    type: String,
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model("Candidate", candidateSchema);