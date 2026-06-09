const express = require('express');
const router = express.Router();
const { adminHeader, protect } = require('../middleware/auth');
const { getReports, createReport, updateReport, deleteReport } = require('../controllers/reportController');

// Public: submit report (logged-in users)
router.post('/', protect, createReport);

// Admin: manage reports
router.get('/', adminHeader, getReports);
router.put('/:id', adminHeader, updateReport);
router.delete('/:id', adminHeader, deleteReport);

module.exports = router;
