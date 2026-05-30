const Car = require('../models/Car');

// ============================================
// GET /api/cars  — Public: approved listings
// ============================================
const getCars = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, city, sort } = req.query;
    const filter = { status: 'approved' };

    if (category && category !== 'all') filter.category = category;
    if (city) filter.city = new RegExp(city, 'i');
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'mileage_asc') sortOption = { mileage: 1 };

    const cars = await Car.find(filter).sort(sortOption);
    return res.json({ success: true, cars });
  } catch (err) {
    console.error('Get cars error:', err);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
};

// ============================================
// GET /api/cars/admin  — Admin: all listings
// ============================================
const getAllCarsAdmin = async (req, res) => {
  try {
    const cars = await Car.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, cars });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
};

// ============================================
// GET /api/cars/:id
// ============================================
const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, error: 'Car not found.' });
    return res.json({ success: true, car });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
};

// ============================================
// POST /api/cars  — Create new listing
// ============================================
const createCar = async (req, res) => {
  try {
    const {
      make, model, category, subType, year, mileage, price,
      transmission, fuel, color, engine, city, description,
      image, images, sellerName, sellerPhone, sellerId,
    } = req.body;

    if (!make || !model || !category || !year || !mileage || !price) {
      return res.status(400).json({ success: false, error: 'Required fields are missing.' });
    }

    const car = await Car.create({
      make, model, category, subType, year,
      mileage: Number(mileage),
      price: Number(price),
      transmission, fuel, color, engine, city,
      description,
      image: image || '',
      images: images || [],
      isUserListed: true,
      status: 'pending',
      sellerName: sellerName || '',
      sellerPhone: sellerPhone || '',
      sellerId: sellerId || null,
    });

    return res.status(201).json({ success: true, car });
  } catch (err) {
    console.error('Create car error:', err);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
};

// ============================================
// PUT /api/cars/:id/approve  — Admin only
// ============================================
const approveCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!car) return res.status(404).json({ success: false, error: 'Car not found.' });
    return res.json({ success: true, car });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
};

// ============================================
// DELETE /api/cars/:id  — Admin only
// ============================================
const deleteCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) return res.status(404).json({ success: false, error: 'Car not found.' });
    return res.json({ success: true, message: 'Car removed successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
};

// ============================================
// GET /api/cars/stats  — Admin stats
// ============================================
const getStats = async (req, res) => {
  try {
    const total = await Car.countDocuments({});
    const pending = await Car.countDocuments({ status: 'pending' });
    const approved = await Car.countDocuments({ status: 'approved' });
    const userListings = await Car.countDocuments({ isUserListed: true });
    const byCategory = await Car.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    return res.json({
      success: true,
      stats: { total, pending, approved, userListings, byCategory },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
};

module.exports = { getCars, getAllCarsAdmin, getCarById, createCar, approveCar, deleteCar, getStats };
