const mongoose = require("mongoose");

// Individual Question Schema (embedded inside Test)
const questionSchema = new mongoose.Schema({
  module: {
    type: String,
    enum: ["reading", "listening", "writing", "speaking"],
    required: true
  },
  questionType: {
    type: String,
    enum: [
      "mcq",
      "true_false_not_given",
      "matching_headings",
      "fill_blank",
      "short_answer",
      "writing_task1",
      "writing_task2",
      "speaking_part1",
      "speaking_part2_cue_card",
      "speaking_part3"
    ],
    required: true,
    default: "mcq"
  },
  question: {
    type: String,
    required: true
  },
  // Reading passage / Listening audio / Writing chart image
  passage: {
    type: String
  },
  audioUrl: {
    type: String
  },
  imageUrl: {
    type: String
  },
  options: {
    type: [String],
    default: []
  },
  answer: {
    type: String
  },
  wordLimit: {
    type: Number
  },
  cueCardPoints: {
    type: [String],
    default: []
  },
  prepTimeSeconds: {
    type: Number
  },
  speakingTimeSeconds: {
    type: Number
  },
  marks: {
    type: Number,
    default: 1
  },
  order: {
    type: Number,
    default: 0
  }
});

// Test Schema
const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    level: {
      type: String,
      default: "Beginner"
    },
    duration: {
      type: Number,
      default: 60
    },
    questions: {
      type: [questionSchema],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Test", testSchema);