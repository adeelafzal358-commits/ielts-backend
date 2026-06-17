const mongoose = require("mongoose");

// ======================
// QUESTION SCHEMA
// ======================
const questionSchema = new mongoose.Schema({

  question: {
    type: String,
    required: true
  },

  options: {
    type: [String],
    required: true
  },

  answer: {
    type: String,
    required: true
  },

  category: {
    type: String,
    default: "General"
  }

});

// ======================
// TEST SCHEMA
// ======================
const testSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    default: ""
  },

  // main questions array
  questions: [questionSchema],

  // optional metadata
  level: {
    type: String,
    default: "Beginner"
  },

  duration: {
    type: Number,
    default: 60 // minutes
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Test", testSchema);