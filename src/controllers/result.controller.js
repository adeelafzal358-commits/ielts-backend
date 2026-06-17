const Result = require("../models/Result");
const Test = require("../models/Test");

// =====================
// SUBMIT TEST RESULT
// =====================
exports.submitResult = async (req, res) => {
  try {
    const { testId, answers } = req.body;
    const userId = req.user.id;

    // Test find karo
    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ message: "Test not found" });

    // Score calculate karo
    let score = 0;
    const detailedAnswers = answers.map((ans) => {
      const question = test.questions.find(
        (q) => q._id.toString() === ans.questionId
      );
      const correct = question && question.answer === ans.selected;
      if (correct) score++;
      return {
        question: question ? question.question : "",
        selected: ans.selected,
        correct: !!correct,
        category: question ? question.category : "General"
      };
    });

    const total = test.questions.length;
    const percentage = (score / total) * 100;

    // IELTS Band calculate karo
    let band = 0;
    if (percentage >= 90) band = 9;
    else if (percentage >= 80) band = 8;
    else if (percentage >= 70) band = 7;
    else if (percentage >= 60) band = 6;
    else if (percentage >= 50) band = 5;
    else if (percentage >= 40) band = 4;
    else band = 3;

    // Result save karo
    const result = await Result.create({
      userId,
      testId,
      score,
      total,
      band,
      answers: detailedAnswers
    });

    res.status(201).json({
      message: "Result submitted successfully",
      result: {
        score,
        total,
        percentage: percentage.toFixed(1),
        band,
        answers: detailedAnswers
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// GET MY RESULTS
// =====================
exports.getMyResults = async (req, res) => {
  try {
    const results = await Result.find({ userId: req.user.id })
      .populate("testId", "title level")
      .sort({ createdAt: -1 });

    res.json({
      message: "Results fetched",
      data: results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// GET ALL RESULTS (ADMIN)
// =====================
exports.getAllResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate("userId", "name email")
      .populate("testId", "title level")
      .sort({ createdAt: -1 });

    res.json({
      message: "All results fetched",
      data: results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// GET RESULT BY ID
// =====================
exports.getResultById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate("userId", "name email")
      .populate("testId", "title level");

    if (!result) return res.status(404).json({ message: "Result not found" });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};