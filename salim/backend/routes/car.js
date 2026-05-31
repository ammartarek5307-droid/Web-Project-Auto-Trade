const express = require('express');
const router = express.Router();
const { protect, adminHeader } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const { createCarSchema } = require('../validations/car.validation');
const {
  getCars,
  getAllCarsAdmin,
  getCarById,
  createCar,
  approveCar,
  updateCar,
  deleteCar,
  getStats,
} = require('../controllers/carController');

// Public routes
router.get('/', getCars);
router.get('/stats', adminHeader, getStats);
router.get('/admin', adminHeader, getAllCarsAdmin);
router.get('/:id', getCarById);

// Protected (logged-in users can submit listings)
router.post('/', protect, upload.single('image'), validate(createCarSchema), createCar);
router.put('/:id', protect, upload.single('image'), updateCar);

// Admin routes
router.put('/:id/approve', adminHeader, approveCar);
router.delete('/:id', adminHeader, deleteCar);

module.exports = router;
