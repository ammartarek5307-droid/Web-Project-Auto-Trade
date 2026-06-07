const express = require('express');
const router = express.Router();
const { protect, adminHeader } = require('../middleware/auth');
const {
  registerUser,
  loginUser,
  getMe,
  getAllUsers,
  banUser,
  unbanUser,
  deleteUser,
} = require('../controllers/authController');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/me', protect, getMe);

// Admin routes (protected by admin header)
router.get('/users', adminHeader, getAllUsers);
router.put('/users/:id/ban', adminHeader, banUser);
router.put('/users/:id/unban', adminHeader, unbanUser);
router.delete('/users/:id', adminHeader, deleteUser);

module.exports = router;
