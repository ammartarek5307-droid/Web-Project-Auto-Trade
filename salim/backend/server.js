require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
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

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// ============================================
// ROUTES
// ============================================
const webRoutes   = require('./routes/web');
const authRoutes  = require('./routes/auth');
const carRoutes   = require('./routes/car');
const reportRoutes = require('./routes/report');

app.use('/', webRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/reports', reportRoutes);

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error(err.stack);
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
