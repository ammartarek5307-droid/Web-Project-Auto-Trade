const mongoose = require('mongoose');

// ============================================
// CONVERSATION MODEL
// Tracks who is talking to whom, about which listing
// ============================================
const conversationSchema = new mongoose.Schema({
  participantIds: {
    type: [String],
    required: true,
  },
  carId: { type: String, default: null },
  carName: { type: String, default: '' },
  lastMessageAt: { type: Date, default: null },
  lastMessagePreview: { type: String, default: '' },
}, { timestamps: true });

// Compound index for fast lookup
conversationSchema.index({ participantIds: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
