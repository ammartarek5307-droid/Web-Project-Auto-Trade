'use strict';

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

let apiCarsCache = [];

async function loadCarsFromApi() {
  try {
    const res = await fetch('/api/cars');
    const data = await res.json();
    if (data.success && data.cars && data.cars.length > 0) {
      apiCarsCache = data.cars.map(c => ({
        id: c._id,
        make: c.make,
        model: c.model,
        category: c.category,
        subType: c.subType || null,
        year: c.year,
        mileage: c.mileage,
        price: c.price,
        transmission: c.transmission,
        fuel: c.fuel,
        color: c.color,
        engine: c.engine,
        city: c.city,
        condition: c.condition,
        description: c.description,
        image: c.image,
        images: c.images || [],
        isUserListed: c.isUserListed,
        status: c.status,
        sellerId: c.sellerId,
        sellerName: c.sellerName,
        sellerPhone: c.sellerPhone,
        location: c.location || null,
      }));
    }
  } catch (err) {
    console.error('Failed to load cars from API', err);
  }
}

/** Get all cars visible to the PUBLIC — fully database-driven */
function getAllCars() {
  return apiCarsCache;
}

/** Get ALL cars including pending — for admin use only */
function getAllCarsForAdmin() {
  return apiCarsCache;
}

/** Read a URL query parameter */
function getUrlParameter(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// ============================================
// REPORTS
// ============================================
async function addReport(report) {
  try {
    const token = localStorage.getItem('at_jwt');
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(report),
    });
    const data = await res.json();
    if (data.success) {
      addActivityLog({
        type: 'report',
        action: `⚠️ Report — ${report.reason}`,
        user: report.reporter || 'Anonymous',
        carName: report.carName || '',
        status: 'pending',
      });
      return true;
    }
  } catch (err) {
    console.error('Failed to submit report', err);
  }
  return false;
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
// ACTIVITY LOG (localStorage)
// ============================================
function getActivityLog() {
  try { return JSON.parse(localStorage.getItem('at_activity')) || []; }
  catch { return []; }
}

function addActivityLog(entry) {
  const log = getActivityLog();
  log.unshift({
    id: Date.now(),
    timestamp: Date.now(),
    ...entry,
  });
  if (log.length > 50) log.length = 50;
  localStorage.setItem('at_activity', JSON.stringify(log));
}
