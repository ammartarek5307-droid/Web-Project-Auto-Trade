const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// ============================================
// GET /api/messages/conversations
// Returns all conversations for the logged-in user
// ============================================
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const conversations = await Conversation.find({
      participantIds: userId,
    }).sort({ lastMessageAt: -1, createdAt: -1 });

    const enriched = await Promise.all(
      conversations.map(async (convo) => {
        const otherId = convo.participantIds.find((id) => id !== userId);

        // Try to look up the other user's username
        let otherUsername = 'User';
        if (otherId && !otherId.startsWith('SELLER-')) {
          const otherUser = await User.findById(otherId).select('username').catch(() => null);
          if (otherUser) otherUsername = otherUser.username;
        } else if (otherId && otherId.startsWith('SELLER-')) {
          otherUsername = 'Seller';
        }

        const unreadCount = await Message.countDocuments({
          conversationId: convo._id.toString(),
          recipientId: userId,
          readAt: null,
        });

        const lastMessage = await Message
          .findOne({ conversationId: convo._id.toString() })
          .sort({ createdAt: -1 });

        return {
          ...convo.toObject(),
          otherUser: { id: otherId, username: otherUsername },
          unreadCount,
          lastMessage: lastMessage || null,
        };
      })
    );

    return res.json({ success: true, conversations: enriched });
  } catch (err) {
    console.error('Get conversations error:', err);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
};

// ============================================
// GET /api/messages/conversations/:id
// Returns all messages in a conversation
// ============================================
const getConversationMessages = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const convoId = req.params.id;

    const convo = await Conversation.findById(convoId);
    if (!convo) {
      return res.status(404).json({ success: false, error: 'Conversation not found.' });
    }

    // Only participants can read the conversation
    if (!convo.participantIds.includes(userId)) {
      return res.status(403).json({ success: false, error: 'Access denied.' });
    }

    // Mark incoming messages as read
    await Message.updateMany(
      { conversationId: convoId, recipientId: userId, readAt: null },
      { $set: { readAt: new Date() } }
    );

    const messages = await Message.find({ conversationId: convoId }).sort({ createdAt: 1 });

    return res.json({ success: true, messages, conversation: convo });
  } catch (err) {
    console.error('Get conversation messages error:', err);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
};

// ============================================
// POST /api/messages
// Send a message — creates conversation if needed
// Body: { recipientId, content, carId?, carName? }
// ============================================
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id.toString();
    const { recipientId, content, carId, carName } = req.body;

    if (!recipientId || !content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'recipientId and content are required.' });
    }

    if (senderId === recipientId) {
      return res.status(400).json({ success: false, error: 'You cannot message yourself.' });
    }

    if (content.trim().length > 1000) {
      return res.status(400).json({ success: false, error: 'Message cannot exceed 1000 characters.' });
    }

    // Find or create conversation between these two participants
    let convo = await Conversation.findOne({
      participantIds: { $all: [senderId, recipientId], $size: 2 },
    });

    if (!convo) {
      convo = await Conversation.create({
        participantIds: [senderId, recipientId],
        carId: carId || null,
        carName: carName || '',
      });
    }

    const senderDoc = await User.findById(senderId).select('username');
    const senderName = senderDoc ? senderDoc.username : 'User';

    // Get recipient name if possible
    let recipientName = 'User';
    if (!recipientId.startsWith('SELLER-')) {
      const recipDoc = await User.findById(recipientId).select('username').catch(() => null);
      if (recipDoc) recipientName = recipDoc.username;
    }

    const message = await Message.create({
      conversationId: convo._id.toString(),
      senderId,
      senderName,
      recipientId,
      recipientName,
      carId: carId || null,
      carName: carName || '',
      content: content.trim(),
    });

    // Update conversation preview
    const preview = content.trim().length > 50 ? content.trim().slice(0, 50) + '...' : content.trim();
    await Conversation.findByIdAndUpdate(convo._id, {
      lastMessageAt: new Date(),
      lastMessagePreview: preview,
    });

    return res.status(201).json({ success: true, message, conversationId: convo._id });
  } catch (err) {
    console.error('Send message error:', err);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
};

// ============================================
// PUT /api/messages/conversations/:id/read
// Mark all messages in a conversation as read
// ============================================
const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const convoId = req.params.id;

    await Message.updateMany(
      { conversationId: convoId, recipientId: userId, readAt: null },
      { $set: { readAt: new Date() } }
    );

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
};

// ============================================
// GET /api/messages/unread-count
// Returns total unread messages for the logged-in user
// ============================================
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const count = await Message.countDocuments({ recipientId: userId, readAt: null });
    return res.json({ success: true, count });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
};

module.exports = { getConversations, getConversationMessages, sendMessage, markAsRead, getUnreadCount };
