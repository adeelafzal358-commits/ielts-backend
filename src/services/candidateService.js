const Candidate = require("../models/Candidate");

exports.createCandidate = async (payload) => {
  const candidate = await Candidate.create(payload);
  return candidate;
};

exports.getAllCandidates = async () => {
  const candidates = await Candidate.find().sort({ createdAt: -1 });
  return candidates;
};

exports.getCandidateById = async (id) => {
  const candidate = await Candidate.findById(id);
  if (!candidate) throw new Error("Candidate not found");
  return candidate;
};

exports.updateCandidate = async (id, payload) => {
  const updated = await Candidate.findByIdAndUpdate(id, payload, { new: true });
  if (!updated) throw new Error("Candidate not found");
  return updated;
};

exports.deleteCandidate = async (id) => {
  const deleted = await Candidate.findByIdAndDelete(id);
  if (!deleted) throw new Error("Candidate not found");
  return deleted;
};

exports.searchCandidates = async (search) => {
  if (!search) return await Candidate.find();
  const candidates = await Candidate.find({
    $or: [
      { candidate_name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { cnic: { $regex: search, $options: "i" } }
    ]
  });
  return candidates;
};

exports.getCandidatesPaginated = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const total = await Candidate.countDocuments();
  const data = await Candidate.find().skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
  return {
    data,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

exports.getCandidateStats = async () => {
  const totalCandidates = await Candidate.countDocuments();
  const ieltsAcademic = await Candidate.countDocuments({ test_type: "IELTS Academic" });
  const generalTraining = await Candidate.countDocuments({ test_type: "IELTS General Training" });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayCandidates = await Candidate.countDocuments({
    test_date: { $gte: today, $lt: tomorrow }
  });

  return { totalCandidates, ieltsAcademic, generalTraining, todayCandidates };
};

exports.getAllForExport = async () => {
  const candidates = await Candidate.find().lean();
  return candidates;
};