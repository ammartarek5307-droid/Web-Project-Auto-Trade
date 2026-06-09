const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  make: {
    type: String,
    required: [true, 'Car make is required'],
    trim: true,
  },
  model: {
    type: String,
    required: [true, 'Car model is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['suv', 'sedan', 'hatchback'],
  },
  subType: { type: String, default: null },
  year: {
    type: String,
    required: [true, 'Year is required'],
  },
  mileage: {
    type: Number,
    required: [true, 'Mileage is required'],
    min: 0,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 10000,
  },
  transmission: {
    type: String,
    enum: ['Automatic', 'Manual', 'CVT'],
    default: 'Automatic',
  },
  fuel: {
    type: String,
    enum: ['Gasoline', 'Diesel', 'Electric', 'Hybrid'],
    default: 'Gasoline',
  },
  color: { type: String, default: '' },
  engine: { type: String, default: '' },
  location: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
  city: { type: String, default: '' },
  condition: { type: String, default: 'Used' },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  images: { type: [String], default: [] },
  isUserListed: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  sellerId: { type: String, default: null },
  sellerName: { type: String, default: '' },
  sellerPhone: { type: String, default: '' },
  bids: [{
    bidderId: { type: String, required: true },
    bidderName: { type: String, required: true },
    amount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    status: { type: String, default: 'active' },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);
