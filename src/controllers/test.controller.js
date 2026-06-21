const Test = require("../models/Test");

// =====================
// CREATE TEST
// =====================
exports.createTest = async (req, res) => {
  try {
    const test = await Test.create(req.body);

    res.status(201).json({
      success: true,
      data: test
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// =====================
// GET ALL TESTS
// =====================
exports.getAllTests = async (req, res) => {
  try {
    const tests = await Test.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: tests
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// =====================
// GET TEST BY ID
// =====================
exports.getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found"
      });
    }

    res.json({
      success: true,
      data: test
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// =====================
// UPDATE TEST
// =====================
exports.updateTest = async (req, res) => {
  try {
    const updated = await Test.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Test not found"
      });
    }

    res.json({
      success: true,
      data: updated
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// =====================
// DELETE TEST
// =====================
exports.deleteTest = async (req, res) => {
  try {
    const deleted = await Test.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Test not found"
      });
    }

    res.json({
      success: true,
      message: "Test deleted successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// =====================
// ADD QUESTION (supports all 4 modules)
// =====================
exports.addQuestion = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found"
      });
    }

    // req.body: { module, questionType, question, options, answer, ... }
    test.questions.push(req.body);
    await test.save();

    res.json({
      success: true,
      message: "Question added successfully",
      data: test
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// =====================
// GET QUESTIONS (optionally filter by module)
// e.g. GET /api/tests/:id/questions?module=reading
// =====================
exports.getQuestionsByModule = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found"
      });
    }

    const { module } = req.query;
    const questions = module
      ? test.questions.filter((q) => q.module === module)
      : test.questions;

    res.json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// =====================
// UPDATE SINGLE QUESTION
// =====================
exports.updateQuestion = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found"
      });
    }

    const question = test.questions.id(req.params.questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }

    Object.assign(question, req.body);
    await test.save();

    res.json({
      success: true,
      message: "Question updated successfully",
      data: test
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// =====================
// DELETE QUESTION
// =====================
exports.deleteQuestion = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found"
      });
    }

    test.questions = test.questions.filter(
      (q) => q._id.toString() !== req.params.questionId
    );

    await test.save();

    res.json({
      success: true,
      message: "Question deleted successfully",
      data: test
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};