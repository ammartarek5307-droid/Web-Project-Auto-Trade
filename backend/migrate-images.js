/**
 * Migration Script: Convert /uploads/... file paths to base64 data URIs in MongoDB.
 * 
 * This script finds all cars with local file path images (e.g. /uploads/filename.jpg)
 * and converts them to base64 data URIs so they are stored directly in MongoDB.
 * 
 * If the file exists on disk, it is read and encoded.
 * If the file does not exist (uploaded from another machine), the image is removed.
 * 
 * Run once: node migrate-images.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Car = require('./models/Car');
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');

function filePathToBase64(relativePath) {
  // relativePath is like /uploads/filename.jpg
  const filename = relativePath.replace(/^\/uploads\//, '');
  const fullPath = path.join(UPLOADS_DIR, filename);

  if (!fs.existsSync(fullPath)) {
    console.log(`  [MISSING] File not found on disk: ${fullPath}`);
    return null;
  }

  const buffer = fs.readFileSync(fullPath);
  const ext = path.extname(filename).toLowerCase().replace('.', '');
  const mimeMap = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };
  const mime = mimeMap[ext] || 'image/jpeg';

  console.log(`  [OK] Converted: ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
  return `data:${mime};base64,${buffer.toString('base64')}`;
}

function isLocalUploadPath(imgStr) {
  return typeof imgStr === 'string' && imgStr.startsWith('/uploads/');
}

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.\n');

  const cars = await Car.find({});
  console.log(`Found ${cars.length} car(s) in database.\n`);

  let migratedCount = 0;

  for (const car of cars) {
    const hasLocalImage = isLocalUploadPath(car.image);
    const hasLocalImages = Array.isArray(car.images) && car.images.some(isLocalUploadPath);

    if (!hasLocalImage && !hasLocalImages) {
      console.log(`[SKIP] ${car.make} ${car.model} — already using data URIs or no images.`);
      continue;
    }

    console.log(`[MIGRATE] ${car.make} ${car.model}`);

    // Convert primary image
    if (hasLocalImage) {
      const base64 = filePathToBase64(car.image);
      car.image = base64 || '';
    }

    // Convert all images array
    if (hasLocalImages) {
      const converted = car.images.map(img => {
        if (isLocalUploadPath(img)) {
          return filePathToBase64(img);
        }
        return img; // already a data URI or external URL
      }).filter(img => img !== null); // remove missing files

      car.images = converted;

      // Update primary image if it was removed
      if (!car.image && converted.length > 0) {
        car.image = converted[0];
      }
    }

    await car.save();
    migratedCount++;
    console.log(`  Saved with ${car.images.length} image(s).\n`);
  }

  console.log(`\nMigration complete. ${migratedCount} car(s) migrated.`);
  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
