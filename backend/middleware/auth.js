const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ============================================
// Protect route — requires valid JWT token
// ============================================
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-passwordHash');

    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Token invalid — user not found.' });
    }

    if (req.user.status === 'banned') {
      return res.status(403).json({ success: false, error: 'Your account has been banned.' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Token invalid or expired.' });
  }
};

// ============================================
// Admin-only middleware
// ============================================
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required.' });
  }
  next();
};

// ============================================
// Admin via custom header (for admin dashboard)
// Accepts X-Admin-Token header for admin panel operations
// ============================================
const adminHeader = (req, res, next) => {
  const adminToken = req.headers['x-admin-token'];
  const expectedUsername = process.env.ADMIN_USERNAME || 'admin';
  const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (adminToken === `${expectedUsername}:${expectedPassword}`) {
    return next();
  }
  return res.status(403).json({ success: false, error: 'Admin access required.' });
};

module.exports = { protect, adminOnly, adminHeader };
