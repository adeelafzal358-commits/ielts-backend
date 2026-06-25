const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  module: {
    type: String,
    enum: ["reading", "listening", "writing", "speaking"],
    required: true
  },
  questionType: {
    type: String,
    required: true
  },
  // MCQ / TF / Fill blank / Short answer ke liye
  selected: {
    type: String,
    default: null
  },
  // Writing task ke liye
  writingResponse: {
    type: String,
    default: null
  },
  // Speaking ke liye (audio URL future mein)
  speakingResponse: {
    type: String,
    default: null
  },
  // Auto-scored questions ke liye
  isCorrect: {
    type: Boolean,
    default: null
  },
  // Admin manual score (writing/speaking)
  manualScore: {
    type: Number,
    default: null
  },
  manualFeedback: {
    type: String,
    default: null
  }
}, { _id: false });

// =============================================

const moduleScoreSchema = new mongoose.Schema({
  raw: { type: Number, default: null },       // correct answers count
  band: { type: Number, default: null }        // 1-9 IELTS band
}, { _id: false });

// =============================================

const attemptSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test",
    required: true
  },

  status: {
    type: String,
    enum: ["in_progress", "submitted", "scored"],
    default: "in_progress"
  },

  answers: [answerSchema],

  moduleScores: {
    reading:   { type: moduleScoreSchema, default: () => ({}) },
    listening: { type: moduleScoreSchema, default: () => ({}) },
    writing:   { type: moduleScoreSchema, default: () => ({}) },
    speaking:  { type: moduleScoreSchema, default: () => ({}) }
  },

  overallBand: {
    type: Number,
    default: null
  },

  startedAt: {
    type: Date,
    default: Date.now
  },

  submittedAt: {
    type: Date,
    default: null
  },

  // Writing + Speaking manual scoring complete hua ya nahi
  manualScoringDone: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model("Attempt", attemptSchema);