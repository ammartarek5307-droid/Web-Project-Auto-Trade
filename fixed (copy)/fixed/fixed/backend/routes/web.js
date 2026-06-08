const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.render('index'));
router.get('/categories', (req, res) => res.render('categories'));
router.get('/sell', (req, res) => res.render('sell'));
router.get('/favorites', (req, res) => res.render('favorites'));
router.get('/messaging', (req, res) => res.render('messaging'));
router.get('/car-details', (req, res) => res.render('car-details'));
router.get('/admin-login', (req, res) => res.render('admin-login'));
router.get('/admin', (req, res) => res.render('admin'));
router.get('/run', (req, res) => res.render('run'));
router.get('/my-listings', (req, res) => res.render('my-listings'));

module.exports = router;
