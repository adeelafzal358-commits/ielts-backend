const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({

  // user reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // test reference
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test",
    required: true
  },

  // score details
  score: {
    type: Number,
    required: true,
    default: 0
  },

  total: {
    type: Number,
    required: true,
    default: 0
  },

  // IELTS band
  band: {
    type: Number,
    required: true,
    default: 0
  },

  // detailed answers
  answers: [
    {
      question: String,
      selected: String,
      correct: Boolean,
      category: {
        type: String,
        default: "General"
      }
    }
  ],

  // optional AI fields (future use)
  weakAreas: {
    type: [String],
    default: []
  },

  improvementNotes: {
    type: String,
    default: ""
  }

}, { timestamps: true });

module.exports = mongoose.model("Result", resultSchema);