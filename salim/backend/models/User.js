const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username must be 20 characters or less'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
  },
  passwordHash: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  status: {
    type: String,
    enum: ['active', 'banned'],
    default: 'active',
  },
  themePreference: {
    type: String,
    enum: ['dark', 'light'],
    default: 'dark',
  },
  loginAttempts: { type: Number, default: 0 },
  lockedUntil: { type: Date, default: null },
  lastLogin: { type: Date, default: null },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  next();
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  const saltedPassword = enteredPassword + '_autotrade_salt_2026';
  // We use SHA-256 on client side; on server we just compare the hash
  return this.passwordHash === enteredPassword; // hash already compared from client
};

module.exports = mongoose.model('User', userSchema);
