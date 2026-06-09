const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.render('index'));
router.get('/categories', (req, res) => res.render('categories'));
router.get('/sell', (req, res) => res.render('sell'));
router.get('/favorites', (req, res) => res.render('favorites'));
router.get('/messaging', (req, res) => res.render('messaging'));
router.get('/car-details', (req, res) => res.render('car-details'));
// Admin login page — if already authenticated, redirect straight to dashboard
router.get('/admin-login', (req, res) => {
  if (req.session && req.session.isAdmin) {
    return res.redirect('/admin');
  }
  res.render('admin-login');
});

// Admin login POST — validate credentials server-side and set session
router.post('/admin-login', (req, res) => {
  const { username, password } = req.body;
  const expectedUsername = process.env.ADMIN_USERNAME || 'admin';
  const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (username === expectedUsername && password === expectedPassword) {
    req.session.isAdmin = true;
    req.session.adminToken = `${username}:${password}`;
    return res.json({ success: true });
  }
  return res.status(401).json({ success: false, error: 'Invalid admin credentials.' });
});

// Admin dashboard — requires admin session, otherwise redirect to login
router.get('/admin', (req, res) => {
  if (!req.session || !req.session.isAdmin) {
    return res.redirect('/admin-login');
  }
  res.render('admin');
});

// Admin logout
router.post('/admin-logout', (req, res) => {
  if (req.session) {
    return req.session.destroy(() => {
      res.json({ success: true });
    });
  }
  res.json({ success: true });
});

router.get('/run', (req, res) => res.render('run'));
router.get('/my-listings', (req, res) => res.render('my-listings'));

module.exports = router;
