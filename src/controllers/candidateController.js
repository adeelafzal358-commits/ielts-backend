const candidateService = require("../services/candidateService");
const notificationService = require("../services/notificationService");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");

// =====================
// CREATE
// =====================
exports.createCandidate = async (req, res) => {
  try {
    const data = await candidateService.createCandidate(req.body);

    // DB Notification
    await notificationService.createNotification(
      `New candidate registered: ${data.candidate_name}`
    );

    // Email Notification
    try {
      await notificationService.sendNewCandidateEmail(data);
    } catch (err) {
      console.log("Email failed:", err.message);
    }

    res.status(201).json({
      message: "Candidate created successfully",
      candidate: data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// GET ALL
// =====================
exports.getAllCandidates = async (req, res) => {
  try {
    const data = await candidateService.getAllCandidates(req.query);

    res.json({
      message: "All candidates fetched",
      data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// GET BY ID
// =====================
exports.getCandidateById = async (req, res) => {
  try {
    const data = await candidateService.getCandidateById(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// UPDATE
// =====================
exports.updateCandidate = async (req, res) => {
  try {
    const updated = await candidateService.updateCandidate(
      req.params.id,
      req.body
    );

    res.json({
      message: "Candidate updated successfully",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// DELETE
// =====================
exports.deleteCandidate = async (req, res) => {
  try {
    const deleted = await candidateService.deleteCandidate(req.params.id);

    res.json({
      message: "Candidate deleted successfully",
      data: deleted,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// SEARCH
// =====================
exports.searchCandidates = async (req, res) => {
  try {
    const data = await candidateService.searchCandidates(req.query.search);

    res.json({
      message: "Search results fetched successfully",
      data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// PAGINATION
// =====================
exports.getCandidatesPaginated = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    const result = await candidateService.getCandidatesPaginated(page, limit);

    res.json({
      message: "Paginated candidates fetched successfully",
      ...result,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// STATS
// =====================
exports.getCandidateStats = async (req, res) => {
  try {
    const stats = await candidateService.getCandidateStats();

    res.json({
      message: "Stats fetched successfully",
      ...stats,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// EXPORT CSV
// =====================
exports.exportExcel = async (req, res) => {
  try {
    const data = await candidateService.getAllForExport();

    const fields = [
      "id",
      "candidate_name",
      "email",
      "phone",
      "cnic",
      "passport",
      "test_type",
      "test_date",
      "venue",
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.header("Content-Type", "text/csv");
    res.attachment("candidates.csv");
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// EXPORT PDF
// =====================
exports.exportPDF = async (req, res) => {
  try {
    const data = await candidateService.getAllForExport();

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=candidates.pdf"
    );

    doc.pipe(res);

    doc.fontSize(18).text("IELTS Candidates Report", { align: "center" });
    doc.moveDown();

    data.forEach((c, index) => {
      doc
        .fontSize(12)
        .text(
          `${index + 1}. ${c.candidate_name} | ${c.email} | ${c.test_type} | ${c.venue}`
        );
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};