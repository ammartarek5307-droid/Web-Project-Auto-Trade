'use strict';

// ============================================
// EGYPTIAN PHONE VALIDATION
// ============================================
function validateEgyptianPhone(value) {
  const cleaned = value.replace(/[\s\-]/g, '');
  return /^(\+20|0020|0)?(10|11|12|15)\d{8}$/.test(cleaned);
}

// ============================================
// FIELD-LEVEL VALIDATION HELPERS
// ============================================
function setFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errEl = document.getElementById('err-' + fieldId);
  if (field) field.classList.add('field-error');
  if (errEl) errEl.textContent = message;
}

function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  const errEl = document.getElementById('err-' + fieldId);
  if (field) field.classList.remove('field-error');
  if (errEl) errEl.textContent = '';
}

function clearAllErrors(form) {
  form.querySelectorAll('.field-error').forEach(f => f.classList.remove('field-error'));
  form.querySelectorAll('.form-error').forEach(e => { e.textContent = ''; });
}

// ============================================
// IMAGE VALIDATION
// ============================================
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGES = 8;

function validateImageFile(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    const msg = typeof t === 'function' ? t('sell.err.img_type') : '"${file.name}" is not a valid image. Only JPEG, PNG, WebP, and GIF are accepted.';
    return msg.replace('{0}', file.name);
  }
  if (file.size > MAX_IMAGE_SIZE) {
    const msg = typeof t === 'function' ? t('sell.err.img_size') : '"${file.name}" exceeds 10MB limit.';
    return msg.replace('{0}', file.name);
  }
  return null;
}

// ============================================
// VALIDATE SELL FORM
// ============================================
function validateSellForm(form, uploadedImages) {
  clearAllErrors(form);
  let valid = true;
  const currentYear = new Date().getFullYear();

  // Make
  const makeVal = (form.querySelector('#car-make') ? form.querySelector('#car-make').value : '').trim();
  if (!makeVal) { setFieldError('car-make', typeof t === 'function' ? t('sell.err.req_make') : 'Please enter the car make.'); valid = false; }

  // Model
  const modelVal = (form.querySelector('#car-model') ? form.querySelector('#car-model').value : '').trim();
  if (!modelVal) { setFieldError('car-model', typeof t === 'function' ? t('sell.err.req_model') : 'Please enter the car model.'); valid = false; }

  // Category
  const category = form.querySelector('#car-category').value;
  if (!category) { setFieldError('car-category', typeof t === 'function' ? t('sell.err.req_category') : 'Please select a category.'); valid = false; }

  // Year
  const year = parseInt(form.querySelector('#car-year').value);
  if (!year) { setFieldError('car-year', typeof t === 'function' ? t('sell.err.req_year') : 'Please enter the manufacturing year.'); valid = false; }
  else if (year < 1990 || year > currentYear + 1) {
    const msg = typeof t === 'function' ? t('sell.err.year_range') : 'Year must be between 1990 and {0}.';
    setFieldError('car-year', msg.replace('{0}', currentYear + 1)); valid = false;
  }

  // Mileage
  const mileage = form.querySelector('#car-mileage').value.replace(/,/g, '').trim();
  if (!mileage) { setFieldError('car-mileage', typeof t === 'function' ? t('sell.err.req_mileage') : 'Please enter mileage in km.'); valid = false; }
  else if (isNaN(mileage) || parseInt(mileage) < 0 || parseInt(mileage) > 1000000) {
    setFieldError('car-mileage', typeof t === 'function' ? t('sell.err.invalid_mileage') : 'Please enter a valid mileage (0 – 1,000,000).'); valid = false;
  }

  // Price
  const price = form.querySelector('#car-price').value.replace(/,/g, '').trim();
  if (!price) { setFieldError('car-price', typeof t === 'function' ? t('sell.err.req_price') : 'Please enter the price in EGP.'); valid = false; }
  else if (isNaN(price) || parseInt(price) < 10000) {
    setFieldError('car-price', typeof t === 'function' ? t('sell.err.min_price') : 'Price must be at least 10,000 EGP.'); valid = false;
  } else if (parseInt(price) > 100000000) {
    setFieldError('car-price', typeof t === 'function' ? t('sell.err.max_price') : 'Price is too high. Please check the value.'); valid = false;
  }

  // Seller Name
  const sellerName = form.querySelector('#seller-name').value.trim();
  if (!sellerName) { setFieldError('seller-name', typeof t === 'function' ? t('sell.err.req_name') : 'Please enter your name.'); valid = false; }
  else if (sellerName.length < 3) { setFieldError('seller-name', typeof t === 'function' ? t('sell.err.name_short') : 'Name must be at least 3 characters.'); valid = false; }
  else if (!/^[A-Za-z\u0600-\u06FF\s]+$/.test(sellerName)) {
    setFieldError('seller-name', typeof t === 'function' ? t('sell.err.name_invalid') : 'Full name must contain letters and spaces only.'); valid = false;
  }

  // Seller Phone (Egyptian)
  const sellerPhone = form.querySelector('#seller-phone').value.trim();
  if (!sellerPhone) { setFieldError('seller-phone', typeof t === 'function' ? t('auth.err.req_phone') : 'Please enter your phone number.'); valid = false; }
  else if (!validateEgyptianPhone(sellerPhone)) {
    setFieldError('seller-phone', typeof t === 'function' ? t('sell.err.invalid_phone') : 'Please enter a valid Egyptian number (e.g. 01012345678).'); valid = false;
  }

  // Photo — at least one image required
  if (uploadedImages.length === 0) {
    const photoErrEl = document.getElementById('err-car-photo');
    if (photoErrEl) photoErrEl.textContent = typeof t === 'function' ? t('sell.err.req_photo') : 'Please upload at least one photo of your car.';
    const photoArea = document.getElementById('photo-upload-area');
    if (photoArea) photoArea.style.borderColor = 'var(--color-danger)';
    valid = false;
  }

  if (!valid) showToast(typeof t === 'function' ? t('sell.err.fix_errors') : 'Please fix the errors in the form.', 'error');
  return valid;
}

// ============================================
// SELL PAGE INIT
// ============================================
function initSellPage() {
  const form = document.getElementById('sell-car-form');
  const photoInput = document.getElementById('car-photo-input');
  const photoArea = document.getElementById('photo-upload-area');
  const photoGrid = document.getElementById('multi-photo-grid');

  // Uploaded images array
  let uploadedImages = [];
  let uploadedFiles = [];

  // Guest Mode Check
  const btn = form ? form.querySelector('#submit-listing-btn') : null;
  if (btn && typeof isGuestMode === 'function' && isGuestMode()) {
    btn.disabled = true;
    btn.title = t ? t('general.guest_restricted') : 'Requires an account';
    btn.style.opacity = '0.6';
    btn.style.cursor = 'not-allowed';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof showToast === 'function') showToast(t('general.guest_toast') || 'You must log in to perform this action.', 'warning');
      if (typeof showAuthGate === 'function') showAuthGate();
    });
  }

  // Live inline validation
  if (form) {
    form.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('blur', () => {
        if (field.value.trim()) {
          field.classList.remove('field-error');
          const errEl = document.getElementById('err-' + field.id);
          if (errEl) errEl.textContent = '';
        }
      });
    });
  }

  // Full Name — letters/spaces only (live)
  const nameInput = document.getElementById('seller-name');
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      const val = nameInput.value;
      if (val && !/^[A-Za-z\u0600-\u06FF\s]*$/.test(val)) {
        setFieldError('seller-name', typeof t === 'function' ? t('sell.hint.name') : 'Only letters and spaces are allowed.');
      } else {
        clearFieldError('seller-name');
      }
    });
  }

  // ── Multi-image upload ──
  function renderPhotoGrid() {
    if (!photoGrid) return;
    if (uploadedImages.length === 0) {
      photoGrid.style.display = 'none';
      return;
    }
    photoGrid.style.display = 'grid';
    photoGrid.innerHTML = uploadedImages.map((src, i) => `
      <div class="multi-photo-item" data-index="${i}">
        <img src="${src}" alt="Photo ${i + 1}">
        <button type="button" class="multi-photo-remove" data-index="${i}" aria-label="Remove photo">✕</button>
      </div>
    `).join('');

    photoGrid.querySelectorAll('.multi-photo-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        uploadedImages.splice(idx, 1);
        uploadedFiles.splice(idx, 1);
        renderPhotoGrid();
      });
    });
  }

  function handleFiles(files) {
    for (const file of files) {
      if (uploadedImages.length >= MAX_IMAGES) {
        showToast(typeof t === 'function' ? t('sell.err.max_photos').replace('{0}', MAX_IMAGES) : `Maximum ${MAX_IMAGES} photos allowed.`, 'warning');
        break;
      }

      const error = validateImageFile(file);
      if (error) {
        showToast(error, 'error');
        continue;
      }

      uploadedFiles.push(file);

      const reader = new FileReader();
      reader.onload = (evt) => {
        uploadedImages.push(evt.target.result);
        renderPhotoGrid();
        photoArea.style.borderColor = '';
        const errEl = document.getElementById('err-car-photo');
        if (errEl) errEl.textContent = '';
      };
      reader.readAsDataURL(file);
    }
  }

  if (photoInput) {
    photoInput.addEventListener('change', () => {
      handleFiles(photoInput.files);
      photoInput.value = '';
    });
  }

  // Drag and drop
  if (photoArea && photoInput) {
    photoArea.addEventListener('dragover', e => { e.preventDefault(); photoArea.classList.add('drag-over'); });
    photoArea.addEventListener('dragleave', () => photoArea.classList.remove('drag-over'));
    photoArea.addEventListener('drop', e => {
      e.preventDefault();
      photoArea.classList.remove('drag-over');
      const imageFiles = [...e.dataTransfer.files].filter(f => ALLOWED_IMAGE_TYPES.includes(f.type));
      if (imageFiles.length > 0) {
        handleFiles(imageFiles);
      } else if (e.dataTransfer.files.length > 0) {
        showToast(typeof t === 'function' ? t('sell.err.img_only') : 'Only image files (JPEG, PNG, WebP, GIF) are accepted.', 'error');
      }
    });
    photoArea.addEventListener('click', e => {
      if (e.target !== photoInput) photoInput.click();
    });
  }

  // ── Leaflet Map for approximate location ──
  const sellMapEl = document.getElementById('sell-map');
  const mapStatusEl = document.getElementById('sell-map-status');
  const latInput = document.getElementById('location-lat');
  const lngInput = document.getElementById('location-lng');

  if (sellMapEl && typeof L !== 'undefined') {
    const sellMap = L.map('sell-map', {
      center: [30.0444, 31.2357], // Cairo default
      zoom: 11,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(sellMap);

    let privacyCircle = null;

    sellMap.on('click', (e) => {
      const { lat, lng } = e.latlng;

      // Remove existing circle
      if (privacyCircle) {
        sellMap.removeLayer(privacyCircle);
      }

      // Draw 2km radius privacy circle
      privacyCircle = L.circle([lat, lng], {
        radius: 2000,
        color: '#6366f1',
        fillColor: '#6366f1',
        fillOpacity: 0.15,
        weight: 2,
        opacity: 0.6,
      }).addTo(sellMap);

      // Update hidden inputs
      if (latInput) latInput.value = lat.toFixed(6);
      if (lngInput) lngInput.value = lng.toFixed(6);

      // Show status badge
      if (mapStatusEl) mapStatusEl.classList.add('visible');
    });

    // Fix map rendering issue when container is initially hidden or resized
    setTimeout(() => sellMap.invalidateSize(), 200);
  }

  // ── Form submit ──
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      if (typeof requireAuthOrGuest === 'function') {
        if (!requireAuthOrGuest()) return;
      } else if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
        if (typeof showAuthGate === 'function') showAuthGate();
        showToast(t ? t('general.guest_toast') : 'Please log in to post an ad.', 'warning');
        return;
      }

      if (!validateSellForm(form, uploadedImages)) return;

      const priceRaw = parseInt(form.querySelector('#car-price').value.replace(/,/g, ''));
      const mileageRaw = parseInt(form.querySelector('#car-mileage').value.replace(/,/g, ''));
      const comment = form.querySelector('#car-comment') ? form.querySelector('#car-comment').value.trim() : '';

      const makeName = form.querySelector('#car-make').value.trim();
      const modelName = form.querySelector('#car-model').value.trim();

      const sellerName = form.querySelector('#seller-name').value.trim();
      const sellerPhone = form.querySelector('#seller-phone').value.trim();

      const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
      const realSellerId = currentUser ? String(currentUser.id) : String(Date.now());

      // Normalize phone to +20 format
      let phone = sellerPhone.replace(/[\s\-]/g, '');
      if (phone.startsWith('00')) phone = '+' + phone.slice(2);
      else if (phone.startsWith('0')) phone = '+20' + phone.slice(1);
      else if (!phone.startsWith('+')) phone = '+20' + phone;

      const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
      const submitBtn = form.querySelector('#submit-listing-btn');

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = typeof t === 'function' ? t('sell.btn.submitting') : 'Submitting...'; }

      const formData = new FormData();
      formData.append('make', makeName);
      formData.append('model', modelName);
      formData.append('category', form.querySelector('#car-category').value);
      formData.append('year', form.querySelector('#car-year').value.trim());
      formData.append('mileage', mileageRaw);
      formData.append('price', priceRaw);
      formData.append('transmission', form.querySelector('#car-transmission').value);
      formData.append('fuel', form.querySelector('#car-fuel').value);
      formData.append('color', form.querySelector('#car-color') ? form.querySelector('#car-color').value.trim() : '—');
      formData.append('engine', form.querySelector('#car-engine') ? form.querySelector('#car-engine').value.trim() : '—');
      formData.append('city', form.querySelector('#car-city') ? form.querySelector('#car-city').value.trim() : '');
      formData.append('description', comment);
      formData.append('sellerName', sellerName);
      formData.append('sellerPhone', phone);
      formData.append('sellerId', realSellerId);

      // Location (optional)
      const locLat = document.getElementById('location-lat') ? document.getElementById('location-lat').value : '';
      const locLng = document.getElementById('location-lng') ? document.getElementById('location-lng').value : '';
      if (locLat && locLng) {
        formData.append('locationLat', locLat);
        formData.append('locationLng', locLng);
      }

      uploadedFiles.forEach(file => {
        formData.append('images', file);
      });

      fetch('/api/cars', {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData,
      })
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            if (typeof addActivityLog === 'function') {
              addActivityLog({
                type: 'listing',
                action: `New Ad: ${makeName} ${modelName}`,
                user: sellerName,
                status: 'pending',
              });
            }

            showToast(typeof t === 'function' ? t('sell.toast.submitted') : 'Your ad has been submitted and is pending admin approval!', 'info', 6000);
            if (submitBtn) { submitBtn.textContent = typeof t === 'function' ? t('sell.btn.pending') : 'Pending Approval'; }

            const confirmMsg = document.createElement('div');
            confirmMsg.style.cssText = 'margin-top:1.5rem;padding:1.25rem 1.5rem;background:var(--color-accent-glow);border:1.5px solid var(--border-accent);border-radius:12px;text-align:center;color:var(--color-accent);font-weight:600;font-size:.95rem;line-height:1.6;';
            const line1 = typeof t === 'function' ? t('sell.confirm.line1') : 'Ad submitted successfully!';
            const line2 = typeof t === 'function' ? t('sell.confirm.line2') : 'Your listing is under review. Once approved by an admin, it will appear in the listings.';
            confirmMsg.innerHTML = `${line1}<br><span style="font-size:.85rem;font-weight:500;color:var(--text-secondary);">${line2}</span>`;
            form.appendChild(confirmMsg);

            setTimeout(() => { window.location.href = '/'; }, 4500);
          } else {
            showToast(data.error || (typeof t === 'function' ? t('sell.err.submit_failed') : 'Failed to submit listing.'), 'error');
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = typeof t === 'function' ? t('sell.btn.submit') : 'Publish Ad'; }
          }
        })
        .catch(err => {
          console.error('Submit car error:', err);
          showToast(typeof t === 'function' ? t('sell.err.network') : 'Network error — could not submit listing. Please try again.', 'error');
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = typeof t === 'function' ? t('sell.btn.submit') : 'Publish Ad'; }
        });
    });
  }
}

// ============================================
// GLOBAL INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.endsWith('sell') || window.location.pathname.endsWith('/sell')) initSellPage();
});
