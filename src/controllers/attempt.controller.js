const Attempt = require("../models/Attempt");
const Test = require("../models/Test");

// =============================================
// IELTS Band Conversion Table
// =============================================
const getBandFromRaw = (correct, total) => {
  if (total === 0) return 0;
  const pct = (correct / total) * 100;
  if (pct >= 90) return 9;
  if (pct >= 80) return 8;
  if (pct >= 70) return 7;
  if (pct >= 60) return 6;
  if (pct >= 50) return 5;
  if (pct >= 40) return 4;
  if (pct >= 30) return 3;
  if (pct >= 20) return 2;
  return 1;
};

const AUTO_SCORED_TYPES = [
  "mcq",
  "true_false_not_given",
  "matching_headings",
  "fill_blank",
  "short_answer"
];

const MANUAL_SCORED_TYPES = [
  "writing_task1",
  "writing_task2",
  "speaking_part1",
  "speaking_part2_cue_card",
  "speaking_part3"
];

// =============================================
// START ATTEMPT
// POST /api/attempts/start
// =============================================
exports.startAttempt = async (req, res) => {
  try {
    const { testId } = req.body;
    const userId = req.user.id;

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: "Test nahi mila" });
    }

    // Check: koi in_progress attempt already hai?
    const existing = await Attempt.findOne({
      userId,
      testId,
      status: "in_progress"
    });

    if (existing) {
      return res.json({
        message: "Resume existing attempt",
        attempt: existing
      });
    }

    const attempt = await Attempt.create({
      userId,
      testId,
      status: "in_progress",
      answers: [],
      startedAt: new Date()
    });

    res.status(201).json({
      message: "Attempt started",
      attempt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =============================================
// SAVE ANSWERS (mid-test auto-save)
// POST /api/attempts/:attemptId/save
// =============================================
exports.saveAnswers = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    const attempt = await Attempt.findOne({ _id: attemptId, userId });
    if (!attempt) {
      return res.status(404).json({ message: "Attempt nahi mila" });
    }

    if (attempt.status !== "in_progress") {
      return res.status(400).json({ message: "Yeh attempt already submit ho chuka hai" });
    }

    // Har answer upsert karo (questionId ke basis pe)
    answers.forEach((incoming) => {
      const idx = attempt.answers.findIndex(
        (a) => a.questionId.toString() === incoming.questionId
      );
      if (idx > -1) {
        attempt.answers[idx] = { ...attempt.answers[idx]._doc, ...incoming };
      } else {
        attempt.answers.push(incoming);
      }
    });

    await attempt.save();

    res.json({ message: "Answers saved", attempt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =============================================
// SUBMIT ATTEMPT + AUTO SCORE
// POST /api/attempts/:attemptId/submit
// =============================================
exports.submitAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const attempt = await Attempt.findOne({ _id: attemptId, userId }).populate(
      "testId"
    );
    if (!attempt) {
      return res.status(404).json({ message: "Attempt nahi mila" });
    }

    if (attempt.status !== "in_progress") {
      return res.status(400).json({ message: "Yeh attempt already submit ho chuka hai" });
    }

    const test = attempt.testId;
    const questions = test.questions || [];

    // Module wise counters
    const moduleCounters = {
      reading:   { correct: 0, total: 0 },
      listening: { correct: 0, total: 0 },
      writing:   { correct: 0, total: 0 },
      speaking:  { correct: 0, total: 0 }
    };

    let hasManual = false;

    // Auto-score karo
    attempt.answers.forEach((ans) => {
      const question = questions.find(
        (q) => q._id.toString() === ans.questionId.toString()
      );
      if (!question) return;

      const mod = ans.module;

      if (AUTO_SCORED_TYPES.includes(ans.questionType)) {
        moduleCounters[mod].total += 1;
        const correct =
          ans.selected &&
          question.answer &&
          ans.selected.trim().toLowerCase() ===
            question.answer.trim().toLowerCase();
        ans.isCorrect = correct;
        if (correct) moduleCounters[mod].correct += 1;
      }

      if (MANUAL_SCORED_TYPES.includes(ans.questionType)) {
        hasManual = true;
      }
    });

    // Module scores calculate karo
    const moduleScores = {};
    for (const mod of ["reading", "listening", "writing", "speaking"]) {
      const { correct, total } = moduleCounters[mod];
      moduleScores[mod] = {
        raw: correct,
        band: total > 0 ? getBandFromRaw(correct, total) : null
      };
    }

    // Overall band — sirf auto-scored modules se (writing/speaking manual hain)
    const autoBands = ["reading", "listening"]
      .map((m) => moduleScores[m].band)
      .filter((b) => b !== null);

    let overallBand = null;
    if (autoBands.length > 0) {
      overallBand =
        Math.round((autoBands.reduce((a, b) => a + b, 0) / autoBands.length) * 2) / 2;
    }

    attempt.status = hasManual ? "submitted" : "scored";
    attempt.moduleScores = moduleScores;
    attempt.overallBand = overallBand;
    attempt.submittedAt = new Date();
    attempt.manualScoringDone = !hasManual;

    await attempt.save();

    res.json({
      message: hasManual
        ? "Attempt submitted — writing/speaking manual scoring pending"
        : "Attempt submitted aur scored",
      attempt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =============================================
// STUDENT — APNA RESULT DEKHO
// GET /api/attempts/my
// =============================================
exports.getMyAttempts = async (req, res) => {
  try {
    const userId = req.user.id;

    const attempts = await Attempt.find({ userId })
      .populate("testId", "title module")
      .sort({ createdAt: -1 });

    res.json({ attempts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =============================================
// STUDENT — SINGLE ATTEMPT DETAIL
// GET /api/attempts/:attemptId
// =============================================
exports.getAttemptById = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const attempt = await Attempt.findOne({ _id: attemptId, userId }).populate(
      "testId"
    );
    if (!attempt) {
      return res.status(404).json({ message: "Attempt nahi mila" });
    }

    res.json({ attempt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =============================================
// ADMIN — PENDING MANUAL SCORING LIST
// GET /api/attempts/admin/pending
// =============================================
exports.getPendingManualScoring = async (req, res) => {
  try {
    const attempts = await Attempt.find({
      status: "submitted",
      manualScoringDone: false
    })
      .populate("userId", "name email")
      .populate("testId", "title")
      .sort({ submittedAt: 1 });

    res.json({ attempts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =============================================
// ADMIN — MANUAL SCORE SUBMIT (Writing/Speaking)
// PUT /api/attempts/:attemptId/manual-score
// =============================================
exports.submitManualScore = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { questionId, manualScore, manualFeedback } = req.body;

    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Attempt nahi mila" });
    }

    const ans = attempt.answers.find(
      (a) => a.questionId.toString() === questionId
    );
    if (!ans) {
      return res.status(404).json({ message: "Answer nahi mila" });
    }

    ans.manualScore = manualScore;
    ans.manualFeedback = manualFeedback || "";

    // Check karo sab manual answers score ho gaye?
    const allManualScored = attempt.answers
      .filter((a) => MANUAL_SCORED_TYPES.includes(a.questionType))
      .every((a) => a.manualScore !== null);

    if (allManualScored) {
      // Writing/Speaking band calculate karo manual scores se
      const writingAnswers = attempt.answers.filter((a) =>
        ["writing_task1", "writing_task2"].includes(a.questionType)
      );
      const speakingAnswers = attempt.answers.filter((a) =>
        ["speaking_part1", "speaking_part2_cue_card", "speaking_part3"].includes(
          a.questionType
        )
      );

      if (writingAnswers.length > 0) {
        const avgWriting =
          writingAnswers.reduce((sum, a) => sum + (a.manualScore || 0), 0) /
          writingAnswers.length;
        attempt.moduleScores.writing = {
          raw: avgWriting,
          band: Math.min(9, Math.max(1, Math.round(avgWriting * 2) / 2))
        };
      }

      if (speakingAnswers.length > 0) {
        const avgSpeaking =
          speakingAnswers.reduce((sum, a) => sum + (a.manualScore || 0), 0) /
          speakingAnswers.length;
        attempt.moduleScores.speaking = {
          raw: avgSpeaking,
          band: Math.min(9, Math.max(1, Math.round(avgSpeaking * 2) / 2))
        };
      }

      // Overall band recalculate (all 4 modules)
      const allBands = ["reading", "listening", "writing", "speaking"]
        .map((m) => attempt.moduleScores[m]?.band)
        .filter((b) => b !== null);

      if (allBands.length > 0) {
        attempt.overallBand =
          Math.round(
            (allBands.reduce((a, b) => a + b, 0) / allBands.length) * 2
          ) / 2;
      }

      attempt.manualScoringDone = true;
      attempt.status = "scored";
    }

    await attempt.save();

    res.json({
      message: allManualScored
        ? "Manual scoring complete — attempt scored!"
        : "Score saved — baaki questions pending hain",
      attempt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};