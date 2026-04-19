'use strict';

// ============================================
// ADMIN CREDENTIALS
// ⚠️ WARNING: These are hardcoded for demo/development purposes only.
// In a real production app, authentication must be handled server-side.
// Never expose credentials in client-side JavaScript.
// ============================================
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// ============================================
// EGYPTIAN SELLERS
// ============================================
const sellersData = {
  1: { name: 'Ahmed Mohamed', phone: '+20 100 123 4567' },
  2: { name: 'Mohamed Abdelrahman', phone: '+20 112 234 5678' },
  3: { name: 'Sarah Ali Hassan',    phone: '+20 101 345 6789' },
  4: { name: 'Khaled Ibrahim',    phone: '+20 115 456 7890' },
  5: { name: 'Noura Youssef',       phone: '+20 106 567 8901' },
  6: { name: 'Omar Farouk',       phone: '+20 100 678 9012' },
  7: { name: 'Reem Tarek',        phone: '+20 111 789 0123' },
  8: { name: 'Hesham Atef',       phone: '+20 122 890 1234' },
  9: { name: 'Dina Hamdy',       phone: '+20 109 901 2345' },
  10: { name: 'Karim Samy',      phone: '+20 128 012 3456' },
  11: { name: 'Yasmine Fathy',    phone: '+20 100 112 2334' },
  12: { name: 'Walid Mansour',     phone: '+20 111 223 3445' },
};

// ============================================
// BASE CARS DATABASE — Egyptian Market
// ============================================
const baseCarsDatabase = [
  // ── SUVs ──────────────────────────────────
  {
    id: 1,
    make: 'Toyota',
    model: 'Land Cruiser GXR',
    category: 'suv',
    subType: null,
    price: 3200000,
    mileage: 28000,
    year: '2023',
    transmission: 'Automatic',
    fuel: 'Gasoline',
    color: 'Pearl White',
    engine: '4.0L V6',
    condition: 'Excellent',
    city: 'Cairo',
    sellerId: 1,
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
    description: 'Car in excellent condition, one owner, regular maintenance at the dealership, no defects.',
    isUserListed: false,
  },
  {
    id: 2,
    make: 'Hyundai',
    model: 'Tucson 2.0',
    category: 'suv',
    subType: null,
    price: 985000,
    mileage: 42000,
    year: '2022',
    transmission: 'Automatic',
    fuel: 'Gasoline',
    color: 'Metallic Grey',
    engine: '2.0L 4-Cylinder',
    condition: 'Very Good',
    city: 'Alexandria',
    sellerId: 2,
    image: 'https://images.unsplash.com/photo-1551522435-a13afa10f103?auto=format&fit=crop&w=800&q=80',
    description: 'Well-maintained car, cold AC, smooth automatic transmission. Available for viewing anytime.',
    isUserListed: false,
  },
  {
    id: 3,
    make: 'Kia',
    model: 'Sportage 2.0',
    category: 'suv',
    subType: null,
    price: 850000,
    mileage: 55000,
    year: '2021',
    transmission: 'Automatic',
    fuel: 'Gasoline',
    color: 'Blue',
    engine: '2.0L 4-Cylinder',
    condition: 'Good',
    city: 'Giza',
    sellerId: 3,
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80',
    description: 'Economical car with reasonable maintenance costs. Regular oil changes and new tires.',
    isUserListed: false,
  },
  {
    id: 4,
    make: 'Mercedes-Benz',
    model: 'GLC 200',
    category: 'suv',
    subType: 'coupe',
    price: 2650000,
    mileage: 18000,
    year: '2022',
    transmission: 'Automatic',
    fuel: 'Gasoline',
    color: 'Black',
    engine: '2.0L Turbo',
    condition: 'Excellent',
    city: 'New Cairo',
    sellerId: 4,
    image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=800&q=80',
    description: 'Luxury SUV with full specs — panoramic roof, touchscreen, rearview camera, parking sensors.',
    isUserListed: false,
  },

  // ── SEDANS ────────────────────────────────
  {
    id: 5,
    make: 'Toyota',
    model: 'Camry',
    category: 'sedan',
    subType: null,
    price: 820000,
    mileage: 35000,
    year: '2022',
    transmission: 'Automatic',
    fuel: 'Gasoline',
    color: 'White',
    engine: '2.5L 4-Cylinder',
    condition: 'Excellent',
    city: 'Cairo',
    sellerId: 5,
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80',
    description: 'Camry full option, sunroof, leather seats, cruise control. No accidents.',
    isUserListed: false,
  },
  {
    id: 6,
    make: 'Hyundai',
    model: 'Elantra',
    category: 'sedan',
    subType: null,
    price: 520000,
    mileage: 48000,
    year: '2022',
    transmission: 'Automatic',
    fuel: 'Gasoline',
    color: 'Silver',
    engine: '1.6L 4-Cylinder',
    condition: 'Very Good',
    city: 'Mansoura',
    sellerId: 6,
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
    description: 'Excellent economical city car. Low fuel consumption and cheap maintenance.',
    isUserListed: false,
  },
  {
    id: 7,
    make: 'Nissan',
    model: 'Sunny',
    category: 'sedan',
    subType: null,
    price: 310000,
    mileage: 72000,
    year: '2020',
    transmission: 'Automatic',
    fuel: 'Gasoline',
    color: 'Grey',
    engine: '1.5L 4-Cylinder',
    condition: 'Good',
    city: 'Alexandria',
    sellerId: 7,
    image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80',
    description: 'Affordable and economical. Perfect for daily commuting and ridesharing.',
    isUserListed: false,
  },
  {
    id: 8,
    make: 'BMW',
    model: '420i',
    category: 'sedan',
    subType: 'coupe',
    price: 1750000,
    mileage: 22000,
    year: '2021',
    transmission: 'Automatic',
    fuel: 'Gasoline',
    color: 'Alpine White',
    engine: '2.0L TwinPower Turbo',
    condition: 'Excellent',
    city: 'Cairo',
    sellerId: 8,
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
    description: 'BMW 4 Series Coupe with luxury sports package. Leather seats, 10-inch display.',
    isUserListed: false,
  },
  {
    id: 9,
    make: 'Toyota',
    model: 'Corolla',
    category: 'sedan',
    subType: null,
    price: 430000,
    mileage: 61000,
    year: '2021',
    transmission: 'Automatic',
    fuel: 'Gasoline',
    color: 'White',
    engine: '1.6L 4-Cylinder',
    condition: 'Very Good',
    city: 'Giza',
    sellerId: 9,
    image: 'https://images.unsplash.com/photo-1624720114709-368f5e5f6e8a?auto=format&fit=crop&w=800&q=80',
    description: 'Corolla in great condition, regular dealership maintenance, one owner.',
    isUserListed: false,
  },

  // ── HATCHBACKS ────────────────────────────
  {
    id: 10,
    make: 'Toyota',
    model: 'Yaris',
    category: 'hatchback',
    subType: null,
    price: 380000,
    mileage: 29000,
    year: '2022',
    transmission: 'Automatic',
    fuel: 'Gasoline',
    color: 'Red',
    engine: '1.5L 4-Cylinder',
    condition: 'Excellent',
    city: 'Cairo',
    sellerId: 10,
    image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80',
    description: 'Yaris in excellent condition with new tires. Great for city driving.',
    isUserListed: false,
  },
  {
    id: 11,
    make: 'Volkswagen',
    model: 'Polo',
    category: 'hatchback',
    subType: null,
    price: 490000,
    mileage: 38000,
    year: '2021',
    transmission: 'Automatic',
    fuel: 'Gasoline',
    color: 'Blue',
    engine: '1.6L 4-Cylinder',
    condition: 'Very Good',
    city: 'Alexandria',
    sellerId: 11,
    image: 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?auto=format&fit=crop&w=800&q=80',
    description: 'European spec Polo. Higher safety standards than local models. Rust-free.',
    isUserListed: false,
  },
  {
    id: 12,
    make: 'Honda',
    model: 'Jazz',
    category: 'hatchback',
    subType: 'coupe',
    price: 415000,
    mileage: 44000,
    year: '2020',
    transmission: 'CVT',
    fuel: 'Gasoline',
    color: 'Silver',
    engine: '1.5L i-VTEC',
    condition: 'Good',
    city: 'Cairo',
    sellerId: 12,
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
    description: 'Honda Jazz with surprisingly spacious interior. Very fuel efficient.',
    isUserListed: false,
  },
];

// ============================================
// UTILITIES
// ============================================

/** Format a number as Egyptian Pounds */
function formatEGP(amount) {
  if (typeof amount === 'string') {
    if (amount.includes('EGP')) return amount;
    amount = parseInt(amount.replace(/[^0-9]/g, ''));
  }
  return 'EGP ' + Number(amount).toLocaleString('en-EG');
}

/** Read the set of car IDs that have been removed by admin */
function getRemovedCarIds() {
  try { return JSON.parse(localStorage.getItem('at_removed_cars')) || []; }
  catch { return []; }
}

/** Get all cars visible to the PUBLIC (base cars + approved user listings, minus removed) */
function getAllCars() {
  const removed = getRemovedCarIds();
  const userListings = getUserListings().filter(c => c.status === 'approved' && !removed.includes(c.id));
  return [...baseCarsDatabase.filter(c => !removed.includes(c.id)), ...userListings];
}

/** Get ALL cars including pending — for admin use only (minus removed) */
function getAllCarsForAdmin() {
  const removed = getRemovedCarIds();
  const userListings = getUserListings().filter(c => !removed.includes(c.id));
  return [...baseCarsDatabase.filter(c => !removed.includes(c.id)), ...userListings];
}

/** Read user listings from localStorage */
function getUserListings() {
  try { return JSON.parse(localStorage.getItem('at_user_listings')) || []; }
  catch { return []; }
}

/** Save a new user listing — always starts as 'pending' until admin approves */
function addUserListing(car) {
  const listings = getUserListings();
  car.status = 'pending';
  listings.push(car);
  localStorage.setItem('at_user_listings', JSON.stringify(listings));
}

/** Approve a user listing by id */
function approveUserListing(carId) {
  const listings = getUserListings().map(c =>
    c.id === carId ? { ...c, status: 'approved' } : c
  );
  localStorage.setItem('at_user_listings', JSON.stringify(listings));
}

/**
 * Unified remove — works for BOTH base cars and user listings.
 * Base cars go into the removed-IDs blocklist (persisted in localStorage).
 * User listings are deleted from at_user_listings.
 */
function removeListing(carId) {
  // Remove from user listings if present
  const userListings = getUserListings().filter(c => c.id !== carId);
  localStorage.setItem('at_user_listings', JSON.stringify(userListings));

  // Also add to removed-IDs blocklist (covers base cars)
  const removed = getRemovedCarIds();
  if (!removed.includes(carId)) {
    removed.push(carId);
    localStorage.setItem('at_removed_cars', JSON.stringify(removed));
  }
}

/** Legacy alias kept for compatibility */
function removeUserListing(carId) { removeListing(carId); }

/** Read a URL query parameter */
function getUrlParameter(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// ============================================
// REPORTS (localStorage)
// ============================================
function getReports() {
  try { return JSON.parse(localStorage.getItem('at_reports')) || []; }
  catch { return []; }
}

function addReport(report) {
  const reports = getReports();
  report.id = 'RPT-' + Date.now();
  report.date = new Date().toLocaleString('en-EG');
  report.status = 'pending';
  reports.push(report);
  localStorage.setItem('at_reports', JSON.stringify(reports));

  // Log to activity feed
  addActivityLog({
    type: 'report',
    action: `⚠️ Report — ${report.reason}`,
    user: report.reporter || 'Anonymous',
    carName: report.carName || '',
    status: 'pending',
  });
}

function updateReport(reportId, changes) {
  const reports = getReports().map(r => r.id === reportId ? { ...r, ...changes } : r);
  localStorage.setItem('at_reports', JSON.stringify(reports));
}

function removeReport(reportId) {
  const reports = getReports().filter(r => r.id !== reportId);
  localStorage.setItem('at_reports', JSON.stringify(reports));
}

// ============================================
// FAVORITES (localStorage)
// ============================================
function getFavorites() {
  try { return JSON.parse(localStorage.getItem('at_favorites')) || []; }
  catch { return []; }
}

function saveFavorite(car) {
  const favs = getFavorites();
  if (!favs.find(f => f.id === car.id)) {
    favs.push(car);
    localStorage.setItem('at_favorites', JSON.stringify(favs));
    return true;
  }
  return false;
}

function removeFavorite(carId) {
  const favs = getFavorites().filter(f => f.id !== carId);
  localStorage.setItem('at_favorites', JSON.stringify(favs));
}

function isFavorited(carId) {
  return getFavorites().some(f => f.id === carId);
}

// ============================================
// SELLER REGISTRY (localStorage)
// Tracks real sellers who submitted listings
// ============================================
function getRegisteredSellers() {
  try { return JSON.parse(localStorage.getItem('at_sellers')) || []; }
  catch { return []; }
}

function addRegisteredSeller(seller) {
  const sellers = getRegisteredSellers();
  // Avoid duplicates by sellerId
  if (!sellers.find(s => s.id === seller.id)) {
    sellers.push(seller);
    localStorage.setItem('at_sellers', JSON.stringify(sellers));
  }
}

function updateSellerStatus(sellerId, status) {
  const sellers = getRegisteredSellers().map(s =>
    s.id === sellerId ? { ...s, status } : s
  );
  localStorage.setItem('at_sellers', JSON.stringify(sellers));
}

// ============================================
// ACTIVITY LOG (localStorage)
// Tracks live events: new listings, approvals, reports
// ============================================
function getActivityLog() {
  try { return JSON.parse(localStorage.getItem('at_activity')) || []; }
  catch { return []; }
}

function addActivityLog(entry) {
  const log = getActivityLog();
  log.unshift({                         // newest first
    id: Date.now(),
    timestamp: Date.now(),
    ...entry,
  });
  // Keep max 50 entries
  if (log.length > 50) log.length = 50;
  localStorage.setItem('at_activity', JSON.stringify(log));
}
