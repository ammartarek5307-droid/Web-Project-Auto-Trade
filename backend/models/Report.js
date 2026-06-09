const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  carId: { type: String, required: true },
  carName: { type: String, default: '' },
  reporter: { type: String, default: 'Anonymous' },
  reporterId: { type: String, default: null },
  reason: { type: String, required: [true, 'Reason is required'] },
  details: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'dismissed'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
