const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ============================================
// GENERATE JWT TOKEN
// ============================================
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ============================================
// SERVER-SIDE VALIDATION HELPERS
// ============================================
function validateUsernameFormat(username) {
  if (!username || username.length < 3 || username.length > 20) return false;
  return /^[a-zA-Z0-9_]+$/.test(username);
}

function validatePhoneFormat(phone) {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  const egyptian = /^(\+20|0020|0)?(10|11|12|15)\d{8}$/;
  const intl = /^\+?\d{8,15}$/;
  return egyptian.test(cleaned) || intl.test(cleaned);
}

// ============================================
// POST /api/auth/register
// ============================================
const registerUser = async (req, res) => {
  try {
    const { username, passwordHash, phone } = req.body;

    // Server-side field validation
    if (!username || !passwordHash || !phone) {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }
    if (!validateUsernameFormat(username)) {
      return res.status(400).json({ success: false, error: 'Username must be 3–20 characters (letters, numbers, underscores only).' });
    }
    if (passwordHash.length < 10) {
      return res.status(400).json({ success: false, error: 'Invalid password format.' });
    }
    if (!validatePhoneFormat(phone)) {
      return res.status(400).json({ success: false, error: 'Please provide a valid phone number.' });
    }

    // Check duplicate username (case-insensitive)
    const existing = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    if (existing) {
      return res.status(409).json({ success: false, error: 'This username is already taken. Please choose another.' });
    }

    const newUser = await User.create({
      username: username.trim(),
      passwordHash, // pre-save hook will bcrypt this
      phone: phone.trim(),
    });

    const token = generateToken(newUser._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        phone: newUser.phone,
        role: newUser.role,
        status: newUser.status,
        themePreference: newUser.themePreference,
        signupDate: newUser.createdAt,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, error: 'Server error during registration.' });
  }
};

// ============================================
// POST /api/auth/login
// ============================================
const loginUser = async (req, res) => {
  try {
    const { username, passwordHash } = req.body;

    if (!username || !passwordHash) {
      return res.status(400).json({ success: false, error: 'Username and password are required.' });
    }

    const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid username or password.' });
    }

    // Check banned
    if (user.status === 'banned') {
      return res.status(403).json({ success: false, error: 'Your account has been banned. Contact support.' });
    }

    // Check lockout
    if (user.lockedUntil && new Date() < user.lockedUntil) {
      const remaining = Math.ceil((user.lockedUntil - Date.now()) / 60000);
      return res.status(429).json({ success: false, error: `Account locked. Try again in ${remaining} minute(s).` });
    }

    // Reset lockout if expired
    if (user.lockedUntil && new Date() >= user.lockedUntil) {
      user.loginAttempts = 0;
      user.lockedUntil = null;
    }

    // ✅ Use bcrypt.compare via the model's matchPassword method
    const isMatch = await user.matchPassword(passwordHash);

    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      if (user.loginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 300000); // 5 minutes
        await user.save({ validateBeforeSave: false });
        return res.status(429).json({ success: false, error: 'Too many failed attempts. Account locked for 5 minutes.' });
      }

      await user.save({ validateBeforeSave: false });
      const remaining = 5 - user.loginAttempts;
      return res.status(401).json({ success: false, error: `Invalid username or password. ${remaining} attempt(s) remaining.` });
    }

    // Successful login
    user.loginAttempts = 0;
    user.lockedUntil = null;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        phone: user.phone,
        role: user.role,
        status: user.status,
        themePreference: user.themePreference,
        signupDate: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: 'Server error during login.' });
  }
};

// ============================================
// GET /api/auth/me   (protected)
// ============================================
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
};

// ============================================
// PUT /api/auth/me   (protected)
// ============================================
const updateMe = async (req, res) => {
  try {
    const { username, phone, passwordHash } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

    // Validate and update username
    if (username && username !== user.username) {
      if (!validateUsernameFormat(username)) {
        return res.status(400).json({ success: false, error: 'Username must be 3–20 characters (letters, numbers, underscores only).' });
      }
      const existing = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
      if (existing) {
        return res.status(409).json({ success: false, error: 'This username is already taken. Please choose another.' });
      }
      user.username = username.trim();
    }

    // Validate and update phone
    if (phone && phone !== user.phone) {
      if (!validatePhoneFormat(phone)) {
        return res.status(400).json({ success: false, error: 'Please provide a valid phone number.' });
      }
      user.phone = phone.trim();
    }

    // Update password if provided
    if (passwordHash && passwordHash.length > 0) {
      if (passwordHash.length < 10) {
        return res.status(400).json({ success: false, error: 'Invalid password format.' });
      }
      user.passwordHash = passwordHash;
    }

    await user.save(); // password hashing is handled by pre-save hook

    return res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        phone: user.phone,
        role: user.role,
        status: user.status,
        themePreference: user.themePreference,
        signupDate: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ success: false, error: 'Server error during profile update.' });
  }
};

// ============================================
// GET /api/auth/users  (admin only)
// ============================================
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-passwordHash').sort({ createdAt: -1 });
    return res.json({ success: true, users });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
};

// ============================================
// PUT /api/auth/users/:id/ban   (admin only)
// ============================================
const banUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'banned' },
      { new: true }
    ).select('-passwordHash');

    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
};

// ============================================
// PUT /api/auth/users/:id/unban  (admin only)
// ============================================
const unbanUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'active', loginAttempts: 0, lockedUntil: null },
      { new: true }
    ).select('-passwordHash');

    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
};

// ============================================
// DELETE /api/auth/users/:id  (admin only)
// ============================================
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });
    return res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
};

module.exports = { registerUser, loginUser, getMe, updateMe, getAllUsers, banUser, unbanUser, deleteUser };
