const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  recipientId: { type: String, required: true },
  recipientName: { type: String, default: '' },
  carId: { type: String, default: null },
  carName: { type: String, default: '' },
  content: { type: String, required: [true, 'Message content is required'], maxlength: 1000 },
  readAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
