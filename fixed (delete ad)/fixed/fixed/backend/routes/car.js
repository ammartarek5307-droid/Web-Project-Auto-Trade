const express = require('express');
const router = express.Router();
const { protect, adminHeader } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getCars,
  getAllCarsAdmin,
  getCarById,
  createCar,
  updateCar,
  approveCar,
  rejectCar,
  deleteCarAdmin,
  deleteCarUser,
  getStats,
  getMyListings,
} = require('../controllers/carController');

// Public routes
router.get('/', getCars);
router.get('/stats', adminHeader, getStats);
router.get('/admin', adminHeader, getAllCarsAdmin);
router.get('/my-listings', protect, getMyListings);
router.get('/:id', getCarById);

// Protected — logged-in users can submit listings (supports real file upload OR JSON)
router.post('/', protect, upload.array('images', 8), createCar);

// Protected — seller or admin can update a listing
router.put('/:id', protect, upload.array('images', 8), updateCar);

// Admin-only routes
router.put('/:id/approve', adminHeader, approveCar);
router.put('/:id/reject', adminHeader, rejectCar);
router.delete('/:id/admin', adminHeader, deleteCarAdmin);

// User route for deleting their own listing
router.delete('/:id', protect, deleteCarUser);

module.exports = router;
