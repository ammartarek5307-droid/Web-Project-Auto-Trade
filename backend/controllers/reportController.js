const Report = require('../models/Report');

// GET /api/reports
const getReports = async (req, res) => {
  try {
    const reports = await Report.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, reports });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
};

// POST /api/reports
const createReport = async (req, res) => {
  try {
    const { carId, carName, reporter, reporterId, reason, details } = req.body;

    if (!carId || !reason) {
      return res.status(400).json({ success: false, error: 'carId and reason are required.' });
    }

    const report = await Report.create({ carId, carName, reporter, reporterId, reason, details });
    return res.status(201).json({ success: true, report });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
};

// PUT /api/reports/:id
const updateReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!report) return res.status(404).json({ success: false, error: 'Report not found.' });
    return res.json({ success: true, report });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
};

// DELETE /api/reports/:id
const deleteReport = async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Report deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
};

module.exports = { getReports, createReport, updateReport, deleteReport };
