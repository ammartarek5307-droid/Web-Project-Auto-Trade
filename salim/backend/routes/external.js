const express = require('express');
const router = express.Router();
const axios = require('axios');

// ============================================
// GET /api/external/exchange-rates
// Demonstrates connecting to an external API from the backend
// ============================================
router.get('/exchange-rates', async (req, res, next) => {
  try {
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
    return res.json({
      success: true,
      message: 'Successfully fetched external data',
      data: response.data
    });
  } catch (err) {
    console.error('External API error:', err.message);
    // Pass to global error handler
    next(err);
  }
});

module.exports = router;
