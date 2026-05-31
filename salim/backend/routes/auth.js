const express = require('express');
const router = express.Router();
const { protect, adminHeader } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validations/auth.validation');
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  getAllUsers,
  banUser,
  unbanUser,
} = require('../controllers/authController');

// Public routes
router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Admin routes (protected by admin header or JWT admin role)
router.get('/users', adminHeader, getAllUsers);
router.put('/users/:id/ban', adminHeader, banUser);
router.put('/users/:id/unban', adminHeader, unbanUser);

module.exports = router;
