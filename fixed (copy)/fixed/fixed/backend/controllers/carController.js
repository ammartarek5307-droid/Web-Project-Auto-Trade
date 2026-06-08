const Car = require('../models/Car');
const fs = require('fs');
const path = require('path');

// ============================================
// HELPER: Convert uploaded file to base64 data URI
// ============================================
function fileToBase64DataUri(file) {
  const filePath = file.path;
  const fileBuffer = fs.readFileSync(filePath);
  const mimeType = file.mimetype || 'image/jpeg';
  return `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
}

function cleanupUploadedFiles(files) {
  if (!files || !Array.isArray(files)) return;
  files.forEach(f => {
    try { fs.unlinkSync(f.path); } catch (e) { /* ignore cleanup errors */ }
  });
}

// ============================================
// SERVER-SIDE VALIDATION HELPER
// ============================================
function validateCarFields({ make, model, category, year, mileage, price }) {
  const currentYear = new Date().getFullYear();
  const errors = [];

  if (!make || !make.trim()) errors.push('Car make is required.');
  if (!model || !model.trim()) errors.push('Car model is required.');
  if (!category || !['suv', 'sedan', 'hatchback'].includes(category)) {
    errors.push('Category must be suv, sedan, or hatchback.');
  }
  const yr = parseInt(year);
  if (!yr || yr < 1990 || yr > currentYear + 1) {
    errors.push(`Year must be between 1990 and ${currentYear + 1}.`);
  }
  const mi = Number(mileage);
  if (isNaN(mi) || mi < 0 || mi > 1000000) {
    errors.push('Mileage must be between 0 and 1,000,000 km.');
  }
  const pr = Number(price);
  if (isNaN(pr) || pr < 10000) {
    errors.push('Price must be at least 10,000 EGP.');
  }
  if (pr > 100000000) {
    errors.push('Price value is too high.');
  }

  return errors;
}

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
// Supports both multipart (multer) and JSON (base64 fallback)
// ============================================
const createCar = async (req, res) => {
  try {
    const {
      make, model, category, subType, year, mileage, price,
      transmission, fuel, color, engine, city, description,
      sellerName, sellerPhone, sellerId,
      // base64 fallback fields (sent as JSON when no files)
      image: jsonImage,
      images: jsonImages,
    } = req.body;

    // Server-side validation
    const errors = validateCarFields({ make, model, category, year, mileage, price });
    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: errors.join(' ') });
    }

    // Build image data — convert uploaded files to base64 data URIs
    // so they are stored in MongoDB and accessible from any device
    let primaryImage = '';
    let allImages = [];

    if (req.files && req.files.length > 0) {
      // Convert uploaded files to base64 data URIs for MongoDB storage
      allImages = req.files.map((f) => fileToBase64DataUri(f));
      primaryImage = allImages[0];
      // Clean up temp files from disk — data is now in MongoDB
      cleanupUploadedFiles(req.files);
    } else if (jsonImages) {
      // JSON body with base64 array
      try {
        allImages = JSON.parse(jsonImages);
        primaryImage = allImages[0] || jsonImage || '';
      } catch {
        allImages = jsonImage ? [jsonImage] : [];
        primaryImage = jsonImage || '';
      }
    } else if (jsonImage) {
      primaryImage = jsonImage;
      allImages = [jsonImage];
    }

    const car = await Car.create({
      make: make.trim(),
      model: model.trim(),
      category,
      subType: subType || null,
      year: String(year).trim(),
      mileage: Number(mileage),
      price: Number(price),
      transmission: transmission || 'Automatic',
      fuel: fuel || 'Gasoline',
      color: color || '',
      engine: engine || '',
      city: city || '',
      description: description || '',
      image: primaryImage,
      images: allImages,
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
// PUT /api/cars/:id  — Update a listing (seller or admin)
// ============================================
const updateCar = async (req, res) => {
  try {
    const {
      make, model, category, subType, year, mileage, price,
      transmission, fuel, color, engine, city, description,
    } = req.body;

    // Validate updated fields if provided
    const fieldsToValidate = {};
    if (make !== undefined) fieldsToValidate.make = make;
    if (model !== undefined) fieldsToValidate.model = model;
    if (category !== undefined) fieldsToValidate.category = category;
    if (year !== undefined) fieldsToValidate.year = year;
    if (mileage !== undefined) fieldsToValidate.mileage = mileage;
    if (price !== undefined) fieldsToValidate.price = price;

    if (Object.keys(fieldsToValidate).length > 0) {
      // Fill defaults for partial validation
      const existing = await Car.findById(req.params.id);
      if (!existing) return res.status(404).json({ success: false, error: 'Car not found.' });

      const toValidate = {
        make: make || existing.make,
        model: model || existing.model,
        category: category || existing.category,
        year: year || existing.year,
        mileage: mileage !== undefined ? mileage : existing.mileage,
        price: price !== undefined ? price : existing.price,
      };

      const errors = validateCarFields(toValidate);
      if (errors.length > 0) {
        return res.status(400).json({ success: false, error: errors.join(' ') });
      }
    }

    // Build update object
    const updateData = {};
    if (make) updateData.make = make.trim();
    if (model) updateData.model = model.trim();
    if (category) updateData.category = category;
    if (subType !== undefined) updateData.subType = subType;
    if (year) updateData.year = String(year).trim();
    if (mileage !== undefined) updateData.mileage = Number(mileage);
    if (price !== undefined) updateData.price = Number(price);
    if (transmission) updateData.transmission = transmission;
    if (fuel) updateData.fuel = fuel;
    if (color !== undefined) updateData.color = color;
    if (engine !== undefined) updateData.engine = engine;
    if (city !== undefined) updateData.city = city;
    if (description !== undefined) updateData.description = description;

    // Handle new image uploads — convert to base64 for MongoDB storage
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => fileToBase64DataUri(f));
      updateData.images = newImages;
      updateData.image = newImages[0];
      // Clean up temp files from disk
      cleanupUploadedFiles(req.files);
    }

    const car = await Car.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!car) return res.status(404).json({ success: false, error: 'Car not found.' });
    return res.json({ success: true, car });
  } catch (err) {
    console.error('Update car error:', err);
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
// PUT /api/cars/:id/reject  — Admin only
// ============================================
const rejectCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    if (!car) return res.status(404).json({ success: false, error: 'Car not found.' });
    return res.json({ success: true, car });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
};

// ============================================
// DELETE /api/cars/:id/admin  — Admin only
// ============================================
const deleteCarAdmin = async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) return res.status(404).json({ success: false, error: 'Car not found.' });
    return res.json({ success: true, message: 'Car removed successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
};

// ============================================
// DELETE /api/cars/:id  — User only
// ============================================
const deleteCarUser = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, error: 'Car not found.' });
    
    if (car.sellerId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Forbidden.' });
    }

    await Car.findByIdAndDelete(req.params.id);
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
    const rejected = await Car.countDocuments({ status: 'rejected' });
    const userListings = await Car.countDocuments({ isUserListed: true });
    const byCategory = await Car.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    return res.json({
      success: true,
      stats: { total, pending, approved, rejected, userListings, byCategory },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
};

// ============================================
// GET /api/cars/my-listings — User's listings
// ============================================
const getMyListings = async (req, res) => {
  try {
    const cars = await Car.find({ sellerId: req.user._id.toString() }).sort({ createdAt: -1 });
    return res.json({ success: true, cars });
  } catch (err) {
    console.error('Get my listings error:', err);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
};

// ============================================
// POST /api/cars/:id/bid  — Place a bid
// ============================================
const placeBid = async (req, res) => {
  try {
    const { amount } = req.body;
    const bidAmount = Number(amount);

    if (!bidAmount || bidAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Please enter a valid bid amount.' });
    }

    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, error: 'Car not found.' });

    // Prevent self-bidding
    if (String(car.sellerId) === String(req.user._id)) {
      return res.status(403).json({ success: false, error: 'You cannot bid on your own listing.' });
    }

    // Determine minimum bid
    const MIN_INCREMENT = 5000;
    const sortedBids = (car.bids || []).sort((a, b) => b.amount - a.amount);
    const highestBid = sortedBids.length > 0 ? sortedBids[0] : null;
    const minBid = highestBid ? highestBid.amount + MIN_INCREMENT : car.price;

    if (bidAmount < minBid) {
      return res.status(400).json({
        success: false,
        error: `Minimum bid is ${minBid.toLocaleString('en-US')} EGP. Bids must be at least ${MIN_INCREMENT.toLocaleString('en-US')} EGP above the current highest bid.`,
      });
    }

    const newBid = {
      bidderId: req.user._id.toString(),
      bidderName: req.user.username,
      amount: bidAmount,
      createdAt: new Date(),
      status: 'active',
    };

    car.bids.push(newBid);
    await car.save();

    return res.status(201).json({ success: true, bid: car.bids[car.bids.length - 1] });
  } catch (err) {
    console.error('Place bid error:', err);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
};

// ============================================
// GET /api/cars/:id/bids  — Get bids for a listing
// ============================================
const getCarBids = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).select('bids price');
    if (!car) return res.status(404).json({ success: false, error: 'Car not found.' });

    const bids = (car.bids || []).sort((a, b) => b.amount - a.amount);
    return res.json({ success: true, bids, price: car.price });
  } catch (err) {
    console.error('Get bids error:', err);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
};

module.exports = {
  getCars, getAllCarsAdmin, getCarById,
  createCar, updateCar,
  approveCar, rejectCar, deleteCarAdmin, deleteCarUser,
  getStats, getMyListings,
  placeBid, getCarBids,
};
