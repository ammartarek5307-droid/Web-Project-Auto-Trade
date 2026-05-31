require('dotenv').config();
const express = require('express');
const path = require('path');
const https = require('https');
const selfsigned = require('selfsigned');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
const i18n = require('./middleware/i18n');

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
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Setup Session Middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'super-secret-session-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Setup Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// Setup i18n
app.use(i18n);

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
const externalRoutes = require('./routes/external');

app.use('/', webRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/external', externalRoutes);

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use(errorHandler);

// ============================================
// START SERVER (HTTP & HTTPS)
// ============================================
// Generate self-signed certs for local development
const attrs = [{ name: 'commonName', value: 'localhost' }];
const pems = selfsigned.generate(attrs, { days: 365 });

const httpsOptions = {
  key: pems.private,
  cert: pems.cert
};

// Start HTTP Server
app.listen(PORT, () => {
  console.log(`\n🚗 AutoTrade HTTP server running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Start HTTPS Server
const HTTPS_PORT = process.env.HTTPS_PORT || 8443;
https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
  console.log(`🔒 AutoTrade HTTPS server running on https://localhost:${HTTPS_PORT}`);
});

module.exports = app;
