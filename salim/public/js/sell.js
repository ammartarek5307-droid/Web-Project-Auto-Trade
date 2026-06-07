'use strict';

// ============================================
// EGYPTIAN PHONE VALIDATION
// Accepts: +20 1xx xxx xxxx  or  01xx xxx xxxx
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

// Searchable-select fields need the visible input highlighted, not the hidden one
function setSearchableError(searchInputId, errId, message) {
  const el = document.getElementById(searchInputId);
  const err = document.getElementById(errId);
  if (el) el.classList.add('field-error');
  if (err) err.textContent = message;
}
function clearSearchableError(searchInputId, errId) {
  const el = document.getElementById(searchInputId);
  const err = document.getElementById(errId);
  if (el) el.classList.remove('field-error');
  if (err) err.textContent = '';
}

// ============================================
// SEARCHABLE SELECT COMPONENT
// ============================================
function createSearchableSelect({ inputId, hiddenId, dropdownId, wrapperId, placeholder, onSelect }) {
  const searchInput = document.getElementById(inputId);
  const hiddenInput = document.getElementById(hiddenId);
  const dropdown = document.getElementById(dropdownId);
  const wrapper = document.getElementById(wrapperId);

  if (!searchInput || !hiddenInput || !dropdown || !wrapper) return null;

  let allOptions = [];   // { value, label }
  let isOpen = false;

  function openDropdown() {
    if (searchInput.disabled) return;
    isOpen = true;
    wrapper.classList.add('open');
    searchInput.setAttribute('aria-expanded', 'true');
    filterAndRender(searchInput.value);
  }

  function closeDropdown() {
    isOpen = false;
    wrapper.classList.remove('open');
    searchInput.setAttribute('aria-expanded', 'false');
  }

  function filterAndRender(query) {
    const q = query.trim().toLowerCase();
    const matches = q
      ? allOptions.filter(o => o.label.toLowerCase().includes(q))
      : allOptions;

    if (matches.length === 0) {
      dropdown.innerHTML = '<li class="ss-no-results">No results found</li>';
    } else {
      dropdown.innerHTML = matches.map(o =>
        `<li data-value="${o.value}" data-label="${o.label}" tabindex="-1">${o.label}</li>`
      ).join('');
    }

    // Click on option
    dropdown.querySelectorAll('li[data-value]').forEach(li => {
      li.addEventListener('mousedown', e => {
        e.preventDefault();
        selectOption(li.dataset.value, li.dataset.label);
      });
    });
  }

  function selectOption(value, label) {
    hiddenInput.value = value;
    hiddenInput.dataset.name = label;
    searchInput.value = label;
    closeDropdown();
    if (onSelect) onSelect(value, label);
  }

  function setLoading(msg) {
    dropdown.innerHTML = `<li class="ss-loading">${msg}</li>`;
    if (isOpen) wrapper.classList.add('open');
  }

  // Events
  searchInput.addEventListener('focus', openDropdown);
  searchInput.addEventListener('input', () => {
    // Clear selection when user types something new
    hiddenInput.value = '';
    hiddenInput.dataset.name = '';
    openDropdown();
    filterAndRender(searchInput.value);
  });
  searchInput.addEventListener('click', () => {
    if (!isOpen) openDropdown();
  });
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeDropdown(); searchInput.blur(); }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const first = dropdown.querySelector('li[data-value]');
      if (first) first.focus();
    }
  });

  dropdown.addEventListener('keydown', e => {
    const items = [...dropdown.querySelectorAll('li[data-value]')];
    const idx = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); items[idx + 1]?.focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); idx > 0 ? items[idx - 1].focus() : searchInput.focus(); }
    if (e.key === 'Enter' && idx >= 0) {
      e.preventDefault();
      selectOption(items[idx].dataset.value, items[idx].dataset.label);
    }
    if (e.key === 'Escape') { closeDropdown(); searchInput.focus(); }
  });

  document.addEventListener('click', e => {
    if (isOpen && !wrapper.contains(e.target)) closeDropdown();
  });

  return {
    setOptions(opts) {               // opts: [{ value, label }]
      allOptions = opts;
      if (isOpen) filterAndRender(searchInput.value);
    },
    setPlaceholder(text) {
      searchInput.placeholder = text;
    },
    enable() {
      searchInput.disabled = false;
    },
    disable() {
      searchInput.disabled = true;
      closeDropdown();
    },
    reset(ph) {
      searchInput.value = '';
      hiddenInput.value = '';
      hiddenInput.dataset.name = '';
      allOptions = [];
      dropdown.innerHTML = '';
      if (ph) searchInput.placeholder = ph;
    },
    setLoading,
    getValue() { return hiddenInput.value; },
    getLabel() { return hiddenInput.dataset.name || ''; },
  };
}

// ============================================
// NHTSA API INTEGRATION
// ============================================
async function loadMakes(makeSelect) {
  makeSelect.setLoading('Loading makes…');
  try {
    const res = await fetch('https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json');
    const data = await res.json();
    const makes = data.Results.sort((a, b) => a.MakeName.localeCompare(b.MakeName));
    makeSelect.setOptions(makes.map(m => ({
      value: m.MakeId,
      label: m.MakeName.charAt(0).toUpperCase() + m.MakeName.slice(1).toLowerCase(),
    })));
    makeSelect.setPlaceholder('Search or select make…');
  } catch (err) {
    makeSelect.setOptions([]);
    makeSelect.setPlaceholder('Error loading makes');
    console.error('Failed to load makes', err);
  }
}

async function loadModels(makeId, modelSelect) {
  if (!makeId) return;
  modelSelect.reset('Loading models…');
  modelSelect.enable();
  modelSelect.setLoading('Loading models…');
  try {
    const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeId/${makeId}?format=json`);
    const data = await res.json();
    const models = data.Results.sort((a, b) => a.Model_Name.localeCompare(b.Model_Name));
    modelSelect.setOptions(models.map(m => ({ value: m.Model_Name, label: m.Model_Name })));
    modelSelect.setPlaceholder('Search or select model…');
  } catch (err) {
    modelSelect.setOptions([]);
    modelSelect.setPlaceholder('Error loading models');
    console.error('Failed to load models', err);
  }
}

// ============================================
// IMAGE VALIDATION
// ============================================
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGES = 8;

function validateImageFile(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return `"${file.name}" is not a valid image. Only JPEG, PNG, WebP, and GIF are accepted.`;
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return `"${file.name}" exceeds 10MB limit.`;
  }
  return null;
}

// ============================================
// VALIDATE SELL FORM
// ============================================
function validateSellForm(form, makeSelect, modelSelect, uploadedImages) {
  clearAllErrors(form);
  let valid = true;
  const currentYear = new Date().getFullYear();

  // Make
  if (!makeSelect.getValue()) { setSearchableError('car-make-search', 'err-car-make', 'Please select a car make.'); valid = false; }

  // Model
  if (!modelSelect.getValue()) { setSearchableError('car-model-search', 'err-car-model', 'Please select a car model.'); valid = false; }

  // Category
  const category = form.querySelector('#car-category').value;
  if (!category) { setFieldError('car-category', 'Please select a category.'); valid = false; }

  // Year
  const year = parseInt(form.querySelector('#car-year').value);
  if (!year) { setFieldError('car-year', 'Please enter the manufacturing year.'); valid = false; }
  else if (year < 1990 || year > currentYear + 1) {
    setFieldError('car-year', `Year must be between 1990 and ${currentYear + 1}.`); valid = false;
  }

  // Mileage
  const mileage = form.querySelector('#car-mileage').value.replace(/,/g, '').trim();
  if (!mileage) { setFieldError('car-mileage', 'Please enter mileage in km.'); valid = false; }
  else if (isNaN(mileage) || parseInt(mileage) < 0 || parseInt(mileage) > 1000000) {
    setFieldError('car-mileage', 'Please enter a valid mileage (0 – 1,000,000).'); valid = false;
  }

  // Price
  const price = form.querySelector('#car-price').value.replace(/,/g, '').trim();
  if (!price) { setFieldError('car-price', 'Please enter the price in EGP.'); valid = false; }
  else if (isNaN(price) || parseInt(price) < 10000) {
    setFieldError('car-price', 'Price must be at least 10,000 EGP.'); valid = false;
  } else if (parseInt(price) > 100000000) {
    setFieldError('car-price', 'Price is too high. Please check the value.'); valid = false;
  }

  // Seller Name
  const sellerName = form.querySelector('#seller-name').value.trim();
  if (!sellerName) { setFieldError('seller-name', 'Please enter your name.'); valid = false; }
  else if (sellerName.length < 3) { setFieldError('seller-name', 'Name must be at least 3 characters.'); valid = false; }
  else if (!/^[A-Za-z\u0600-\u06FF\s]+$/.test(sellerName)) {
    setFieldError('seller-name', 'Full name must contain letters and spaces only — no numbers or special characters.'); valid = false;
  }

  // Seller Phone (Egyptian)
  const sellerPhone = form.querySelector('#seller-phone').value.trim();
  if (!sellerPhone) { setFieldError('seller-phone', 'Please enter your phone number.'); valid = false; }
  else if (!validateEgyptianPhone(sellerPhone)) {
    setFieldError('seller-phone', 'Please enter a valid Egyptian number (e.g. 01012345678).'); valid = false;
  }

  // Photo — at least one image required
  if (uploadedImages.length === 0) {
    const photoErrEl = document.getElementById('err-car-photo');
    if (photoErrEl) photoErrEl.textContent = 'Please upload at least one photo of your car.';
    const photoArea = document.getElementById('photo-upload-area');
    if (photoArea) photoArea.style.borderColor = 'var(--color-danger)';
    valid = false;
  }

  if (!valid) showToast('Please fix the errors in the form.', 'error');
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

  // Uploaded images array (data URLs)
  let uploadedImages = [];
  let uploadedFiles = []; // Track actual File objects

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

  // ── Searchable dropdowns ──
  let modelSelectWidget;
  const makeSelectWidget = createSearchableSelect({
    inputId: 'car-make-search',
    hiddenId: 'car-make',
    dropdownId: 'make-dropdown',
    wrapperId: 'make-searchable',
    onSelect: (makeId, makeName) => {
      clearSearchableError('car-make-search', 'err-car-make');
      modelSelectWidget.reset('Loading models…');
      modelSelectWidget.enable();
      loadModels(makeId, modelSelectWidget);
    },
  });

  modelSelectWidget = createSearchableSelect({
    inputId: 'car-model-search',
    hiddenId: 'car-model',
    dropdownId: 'model-dropdown',
    wrapperId: 'model-searchable',
    onSelect: () => clearSearchableError('car-model-search', 'err-car-model'),
  });

  modelSelectWidget.disable();
  loadMakes(makeSelectWidget);

  // Live inline validation
  if (form) {
    form.querySelectorAll('input:not(.ss-input), select, textarea').forEach(field => {
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
        setFieldError('seller-name', 'Only letters and spaces are allowed — no numbers or special characters.');
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

    // Remove buttons
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
        showToast(`Maximum ${MAX_IMAGES} photos allowed.`, 'warning');
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
        // Clear error
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
      photoInput.value = ''; // Allow re-selecting same files
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
        showToast('Only image files (JPEG, PNG, WebP, GIF) are accepted.', 'error');
      }
    });
    photoArea.addEventListener('click', e => {
      if (e.target !== photoInput) photoInput.click();
    });
  }

  // ── Form submit ──
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      // Check auth
      if (typeof requireAuthOrGuest === 'function') {
        if (!requireAuthOrGuest()) return;
      } else if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
        if (typeof showAuthGate === 'function') showAuthGate();
        showToast(t ? t('general.guest_toast') : 'Please log in to post an ad.', 'warning');
        return;
      }

      if (!validateSellForm(form, makeSelectWidget, modelSelectWidget, uploadedImages)) return;

      const priceRaw = parseInt(form.querySelector('#car-price').value.replace(/,/g, ''));
      const mileageRaw = parseInt(form.querySelector('#car-mileage').value.replace(/,/g, ''));
      const comment = form.querySelector('#car-comment') ? form.querySelector('#car-comment').value.trim() : '';

      const makeName = makeSelectWidget.getLabel();
      const modelName = modelSelectWidget.getValue();

      const sellerName = form.querySelector('#seller-name').value.trim();
      const sellerPhone = form.querySelector('#seller-phone').value.trim();
      const newId = Date.now();

      // Normalize phone to +20 format
      let phone = sellerPhone.replace(/[\s\-]/g, '');
      if (phone.startsWith('00')) phone = '+' + phone.slice(2);
      else if (phone.startsWith('0')) phone = '+20' + phone.slice(1);
      else if (!phone.startsWith('+')) phone = '+20' + phone;

      // ── Submit to MongoDB API ──
      const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
      const btn = form.querySelector('#submit-listing-btn');

      if (btn) { btn.disabled = true; btn.textContent = 'Submitting...'; }

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
      formData.append('sellerId', String(newId));

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
            // Keep local state in sync
            sellersData[newId] = { name: sellerName, phone };
            if (typeof addRegisteredSeller === 'function') {
              addRegisteredSeller({
                id: newId,
                name: sellerName,
                phone,
                listingId: newId,
                carName: `${makeName} ${modelName}`,
                joined: new Date().toLocaleDateString('en-EG', { year: 'numeric', month: 'short', day: 'numeric' }),
                status: 'active',
              });
            }
            if (typeof addActivityLog === 'function') {
              addActivityLog({
                type: 'listing',
                action: `New Ad: ${makeName} ${modelName}`,
                user: sellerName,
                status: 'pending',
              });
            }

            showToast('Your ad has been submitted and is pending admin approval!', 'info', 6000);
            if (btn) { btn.textContent = 'Pending Approval'; }

            // Inline confirmation
            const confirmMsg = document.createElement('div');
            confirmMsg.style.cssText = 'margin-top:1.5rem;padding:1.25rem 1.5rem;background:var(--color-accent-glow);border:1.5px solid var(--border-accent);border-radius:12px;text-align:center;color:var(--color-accent);font-weight:600;font-size:.95rem;line-height:1.6;';
            confirmMsg.innerHTML = 'Ad submitted successfully!<br><span style="font-size:.85rem;font-weight:500;color:var(--text-secondary);">Your listing is under review. Once approved by an admin, it will appear in the listings.</span>';
            form.appendChild(confirmMsg);

            setTimeout(() => { window.location.href = '/'; }, 4500);
          } else {
            showToast(data.error || 'Failed to submit listing.', 'error');
            if (btn) { btn.disabled = false; btn.textContent = 'Publish Ad'; }
          }
        })
        .catch(err => {
          console.error('Submit car error:', err);
          showToast('Network error — could not submit listing. Please try again.', 'error');
          if (btn) { btn.disabled = false; btn.textContent = 'Publish Ad'; }
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
