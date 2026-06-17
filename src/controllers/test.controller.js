const Test = require("../models/Test");

// =====================
// CREATE TEST
// =====================
exports.createTest = async (req, res) => {
  try {
    const test = await Test.create(req.body);
    res.status(201).json({
      message: "Test created successfully",
      test
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// GET ALL TESTS
// =====================
exports.getAllTests = async (req, res) => {
  try {
    const tests = await Test.find().sort({ createdAt: -1 });
    res.json({
      message: "All tests fetched",
      data: tests
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// GET TEST BY ID
// =====================
exports.getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: "Test not found" });
    res.json(test);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Test not found" });
    res.json({
      message: "Test updated successfully",
      test: updated
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// DELETE TEST
// =====================
exports.deleteTest = async (req, res) => {
  try {
    const deleted = await Test.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Test not found" });
    res.json({
      message: "Test deleted successfully",
      test: deleted
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// ADD QUESTION TO TEST
// =====================
exports.addQuestion = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: "Test not found" });

    test.questions.push(req.body);
    await test.save();

    res.json({
      message: "Question added successfully",
      test
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// DELETE QUESTION
// =====================
exports.deleteQuestion = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: "Test not found" });

    test.questions = test.questions.filter(
      q => q._id.toString() !== req.params.questionId
    );
    await test.save();

    res.json({
      message: "Question deleted successfully",
      test
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};