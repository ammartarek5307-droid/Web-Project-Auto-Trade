const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getConversations,
  getConversationMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
} = require('../controllers/messageController');

// All message routes require a logged-in user
router.get('/unread-count', protect, getUnreadCount);
router.get('/conversations', protect, getConversations);
router.get('/conversations/:id', protect, getConversationMessages);
router.put('/conversations/:id/read', protect, markAsRead);
router.post('/', protect, sendMessage);

module.exports = router;
