require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const connectDB = require('./config/db');

const app = express();

// ============================================
// CONNECT TO MONGODB
// ============================================
connectDB();

// ============================================
// CONFIGURATION
// ============================================
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ── Sessions ──────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'autotrade_session_secret_2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Serve uploaded files from public/uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

// ============================================
// ROUTES
// ============================================
const webRoutes     = require('./routes/web');
const authRoutes    = require('./routes/auth');
const carRoutes     = require('./routes/car');
const reportRoutes  = require('./routes/report');
const messageRoutes = require('./routes/message');

app.use('/', webRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/messages', messageRoutes);

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  // Handle multer-specific errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, error: 'File too large. Maximum size is 10MB.' });
  }
  if (err.message && err.message.includes('Only image files')) {
    return res.status(400).json({ success: false, error: err.message });
  }
  res.status(500).json({ success: false, error: 'Internal server error.' });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`\n🚗 AutoTrade server running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
