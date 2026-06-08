'use strict';

// ============================================
// CATEGORIES PAGE
// ============================================
function initCategoriesPage() {
  const grid = document.getElementById('category-cars-grid');
  const title = document.getElementById('category-title');
  const subtitleEl = document.getElementById('category-subtitle');
  const resultCount = document.getElementById('search-result-count');
  const categoryParam = getUrlParameter('type');
  const allCars = getAllCars();

  // Base filtered set by category
  let baseCars = allCars;
  if (categoryParam && categoryParam !== 'all') {
    baseCars = allCars.filter(c => c.category === categoryParam);
  }

  const labels = { all: 'All Cars', suv: 'SUVs', sedan: 'Sedans', hatchback: 'Hatchbacks' };
  if (title) title.textContent = labels[categoryParam] || 'All Cars';

  // Highlight active category pill
  document.querySelectorAll('.cat-pill').forEach(a => {
    const param = new URL(a.href, window.location.href).searchParams.get('type') || 'all';
    const current = categoryParam || 'all';
    a.classList.toggle('active', param === current);
  });

  if (!grid) return;

  // ── Render helpers ──
  function renderCars(cars) {
    if (cars.length > 0) {
      grid.innerHTML = cars.map(createCarCard).join('');
      bindCardEvents(grid);
    } else {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <div class="empty-state-icon">No Results</div>
          <h3>No cars match your search</h3>
          <p>Try different keywords or clear the search filters.</p>
        </div>`;
    }
    if (subtitleEl) subtitleEl.textContent = `${baseCars.length} cars available`;
    if (resultCount) {
      resultCount.textContent = cars.length < baseCars.length
        ? `Showing ${cars.length} of ${baseCars.length} cars`
        : `${baseCars.length} cars available`;
    }
  }

  // Initial render
  renderCars(baseCars);

  // ── Search logic ──
  const nameInput     = document.getElementById('search-name');
  const colorInput    = document.getElementById('search-color');
  const yearInput     = document.getElementById('search-year');
  const priceMinInput = document.getElementById('search-price-min');
  const priceMaxInput = document.getElementById('search-price-max');
  const sortSelect    = document.getElementById('sort-select');
  const clearBtn      = document.getElementById('search-clear-btn');
  const applyPriceBtn = document.getElementById('apply-price-btn');
  const priceDisplay  = document.getElementById('price-range-display');

  // ── Panel Toggle Logic ──
  const panel = document.getElementById('search-panel');
  const overlay = document.getElementById('search-panel-overlay');
  const toggleBtn = document.getElementById('filter-toggle-btn');
  const closeBtn = document.getElementById('search-panel-close');
  const activeDot = document.getElementById('filter-active-dot');

  function openPanel() {
    if(panel) panel.classList.add('open');
    if(overlay) overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    if(toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
  }

  function closePanel() {
    if(panel) panel.classList.remove('open');
    if(overlay) overlay.classList.remove('show');
    document.body.style.overflow = '';
    if(toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
  }

  if (toggleBtn) toggleBtn.addEventListener('click', openPanel);
  if (closeBtn) closeBtn.addEventListener('click', closePanel);
  if (overlay) overlay.addEventListener('click', closePanel);
  
  let appliedMinPrice = 0;
  let appliedMaxPrice = 0;

  function updateFilterState() {
    let activeCount = 0;
    const nameTerm = nameInput ? nameInput.value.trim() : '';
    const colorTerm = colorInput ? colorInput.value.trim() : '';
    const yearTerm = yearInput ? yearInput.value.trim() : '';
    
    if (nameTerm) activeCount++;
    if (colorTerm) activeCount++;
    if (yearTerm) activeCount++;
    if (appliedMinPrice > 0 || appliedMaxPrice > 0) activeCount++;

    if (activeDot && toggleBtn) {
      if (activeCount > 0) {
        activeDot.classList.add('show');
        toggleBtn.classList.add('active');
      } else {
        activeDot.classList.remove('show');
        toggleBtn.classList.remove('active');
      }
    }

    if (!priceDisplay) return;
    
    if (activeCount > 0) {
      let parts = [];
      if (appliedMinPrice > 0 && appliedMaxPrice > 0) parts.push(`${formatEGP(appliedMinPrice)} - ${formatEGP(appliedMaxPrice)}`);
      else if (appliedMinPrice > 0) parts.push(`Min ${formatEGP(appliedMinPrice)}`);
      else if (appliedMaxPrice > 0) parts.push(`Max ${formatEGP(appliedMaxPrice)}`);
      
      if (nameTerm || colorTerm || yearTerm) parts.push(`${activeCount} active filter${activeCount > 1 ? 's' : ''}`);
      
      priceDisplay.textContent = 'Filtered: ' + parts.join(' | ');
      priceDisplay.classList.add('show');
    } else {
      priceDisplay.classList.remove('show');
    }
  }

  function getFilteredAndSortedCars() {
    const nameTerm     = (nameInput     ? nameInput.value.trim().toLowerCase()  : '');
    const colorTerm    = (colorInput    ? colorInput.value.trim().toLowerCase() : '');
    const yearTerm     = (yearInput     ? yearInput.value.trim()                : '');
    const sortValue    = (sortSelect    ? sortSelect.value                     : 'default');

    // Filter
    let results = baseCars.filter(car => {
      const fullName = `${car.make} ${car.model}`.toLowerCase();
      const carColor = (car.color || '').toLowerCase();
      const carYear  = String(car.year || '');
      const carPrice = typeof car.price === 'number' ? car.price : parseInt(String(car.price).replace(/[^0-9]/g, '')) || 0;

      const matchName     = !nameTerm     || fullName.includes(nameTerm);
      const matchColor    = !colorTerm    || carColor.includes(colorTerm);
      const matchYear     = !yearTerm     || carYear === yearTerm;
      const matchPriceMin = !appliedMinPrice || carPrice >= appliedMinPrice;
      const matchPriceMax = !appliedMaxPrice || carPrice <= appliedMaxPrice;

      return matchName && matchColor && matchYear && matchPriceMin && matchPriceMax;
    });

    // Sort
    if (sortValue !== 'default') {
      results = [...results].sort((a, b) => {
        const priceA = typeof a.price === 'number' ? a.price : parseInt(String(a.price).replace(/[^0-9]/g, '')) || 0;
        const priceB = typeof b.price === 'number' ? b.price : parseInt(String(b.price).replace(/[^0-9]/g, '')) || 0;
        const yearA  = parseInt(a.year) || 0;
        const yearB  = parseInt(b.year) || 0;

        switch (sortValue) {
          case 'price-asc':  return priceA - priceB;
          case 'price-desc': return priceB - priceA;
          case 'year-desc':  return yearB - yearA;
          case 'year-asc':   return yearA - yearB;
          default:           return 0;
        }
      });
    }

    return results;
  }

  function applySearchAndSort() {
    updateFilterState();
    const results = getFilteredAndSortedCars();
    renderCars(results);
  }

  // Debounce helper
  function debounce(fn, delay) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
  }
  const debouncedSearch = debounce(applySearchAndSort, 280);

  if (nameInput)  nameInput.addEventListener('input',  debouncedSearch);
  if (colorInput) colorInput.addEventListener('input', debouncedSearch);
  if (yearInput)  yearInput.addEventListener('input',  debouncedSearch);
  if (sortSelect) sortSelect.addEventListener('change', applySearchAndSort);

  if (applyPriceBtn) {
    applyPriceBtn.addEventListener('click', () => {
      appliedMinPrice = priceMinInput ? parseInt(priceMinInput.value) || 0 : 0;
      appliedMaxPrice = priceMaxInput ? parseInt(priceMaxInput.value) || 0 : 0;
      updateFilterState();
      applySearchAndSort();
      closePanel(); // Auto-close panel on apply price on mobile
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (nameInput)     nameInput.value     = '';
      if (colorInput)    colorInput.value    = '';
      if (yearInput)     yearInput.value     = '';
      if (priceMinInput) priceMinInput.value = '';
      if (priceMaxInput) priceMaxInput.value = '';
      if (sortSelect)    sortSelect.value    = 'default';
      
      appliedMinPrice = 0;
      appliedMaxPrice = 0;
      updateFilterState();
      renderCars(baseCars);
      closePanel(); // Auto-close on clear all
    });
  }
}


// ============================================
// STACKED IMAGE CAROUSEL
// ============================================
function createImageCarousel(images, container) {
  if (!images || images.length === 0) return;

  if (images.length === 1) {
    // Single image — no carousel
    container.innerHTML = `
      <div class="details-img-wrap">
        <img src="${images[0]}" alt="Car photo" class="details-img"
             onerror="this.src='https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80'">
      </div>
    `;
    return;
  }

  let currentIndex = 0;

  const slidesHtml = images.map((img, i) => `
    <div class="carousel-slide ${i === 0 ? 'active' : i === 1 ? 'next' : 'hidden'}" data-index="${i}">
      <img src="${img}" alt="Car photo ${i + 1}" loading="${i < 2 ? 'eager' : 'lazy'}"
           onerror="this.src='https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80'">
    </div>
  `).join('');

  const dotsHtml = images.map((_, i) => `
    <button class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Go to image ${i + 1}"></button>
  `).join('');

  container.innerHTML = `
    <div class="carousel-container">
      <div class="carousel-viewport">
        ${slidesHtml}
        <span class="carousel-counter">1 / ${images.length}</span>
        <div class="carousel-dots">${dotsHtml}</div>
        <div class="carousel-controls">
          <button class="carousel-btn carousel-prev" aria-label="Previous image">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button class="carousel-btn carousel-next" aria-label="Next image">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;

  const slides = container.querySelectorAll('.carousel-slide');
  const dots = container.querySelectorAll('.carousel-dot');
  const counter = container.querySelector('.carousel-counter');

  function updateSlides(newIndex) {
    slides.forEach((slide, i) => {
      slide.classList.remove('active', 'next', 'prev', 'hidden');
      if (i === newIndex) {
        slide.classList.add('active');
      } else if (i === (newIndex + 1) % images.length) {
        slide.classList.add('next');
      } else if (i === (newIndex - 1 + images.length) % images.length) {
        slide.classList.add('prev');
      } else {
        slide.classList.add('hidden');
      }
    });

    dots.forEach((dot, i) => dot.classList.toggle('active', i === newIndex));
    if (counter) counter.textContent = `${newIndex + 1} / ${images.length}`;
    currentIndex = newIndex;
  }

  // Arrow buttons
  container.querySelector('.carousel-prev')?.addEventListener('click', () => {
    updateSlides((currentIndex - 1 + images.length) % images.length);
  });
  container.querySelector('.carousel-next')?.addEventListener('click', () => {
    updateSlides((currentIndex + 1) % images.length);
  });

  // Dots
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      updateSlides(parseInt(dot.dataset.index));
    });
  });

  // Keyboard navigation
  container.setAttribute('tabindex', '0');
  container.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      updateSlides((currentIndex - 1 + images.length) % images.length);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      updateSlides((currentIndex + 1) % images.length);
    }
  });

  // Swipe gestures
  let touchStartX = 0;
  let touchEndX = 0;
  const viewport = container.querySelector('.carousel-viewport');

  viewport?.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  viewport?.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        updateSlides((currentIndex + 1) % images.length);
      } else {
        updateSlides((currentIndex - 1 + images.length) % images.length);
      }
    }
  }, { passive: true });
}


// ============================================
// CAR DETAILS PAGE
// ============================================
function initDetailsPage() {
  const container = document.getElementById('car-detail-container');
  const carIdParam = getUrlParameter('id');
  const car = getAllCars().find(c => String(c.id) === String(carIdParam));

  if (!car || !container) {
    if (container) container.innerHTML = `
      <div class="not-found-state">
        <div class="empty-state-icon">Not Found</div>
        <h1>Car Not Found</h1>
        <a href="/categories?type=all" class="btn btn-primary">Browse All Cars</a>
      </div>`;
    return;
  }

  document.title = `${car.make} ${car.model} | AutoTrade`;
  const favored = isFavorited(car.id);
  const priceFormatted = formatEGP(car.price);
  const catLabel = car.subType === 'coupe'
    ? (car.category.charAt(0).toUpperCase() + car.category.slice(1)) + ' Coupé'
    : (car.category ? car.category.charAt(0).toUpperCase() + car.category.slice(1) : '');

  // Determine images
  const images = Array.isArray(car.images) && car.images.length > 0
    ? car.images
    : [car.image];
    
  const isGuest = typeof isGuestMode === 'function' && isGuestMode();
  const guestAttrs = isGuest ? `disabled title="${t ? t('general.guest_restricted') : 'Requires an account'}" style="opacity: 0.6; cursor: not-allowed;"` : '';

  const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  const isOwner = currentUser && car.sellerId && String(car.sellerId) === String(currentUser.id);

  container.innerHTML = `
    <div class="details-img-wrap" id="car-carousel-area"></div>
    <div class="details-info">
      <div class="details-header">
        <div class="details-tags">
          ${car.condition ? `<span class="detail-tag">${car.condition}</span>` : ''}
          ${car.city ? `<span class="detail-tag">${car.city}</span>` : ''}
        </div>
        <h1 class="details-title">${car.make} ${car.model}</h1>
        <p class="details-price">${priceFormatted}</p>
        <div class="details-intro-specs">
          <span>${car.year}</span> &bull; <span>${Number(car.mileage).toLocaleString('en-US')} km</span> &bull; <span>${car.transmission || '—'}</span>
        </div>
      </div>

      <div class="details-section">
        <h3 class="details-section-title">Specifications</h3>
        <div class="specs-grid">
          <div class="spec-item"><div class="spec-label">Year</div><div class="spec-value">${car.year}</div></div>
          <div class="spec-item"><div class="spec-label">Mileage</div><div class="spec-value">${Number(car.mileage).toLocaleString('en-US')} km</div></div>
          <div class="spec-item"><div class="spec-label">Transmission</div><div class="spec-value">${car.transmission || '—'}</div></div>
          <div class="spec-item"><div class="spec-label">Fuel Type</div><div class="spec-value">${car.fuel || '—'}</div></div>
          <div class="spec-item"><div class="spec-label">Engine</div><div class="spec-value">${car.engine || '—'}</div></div>
          <div class="spec-item"><div class="spec-label">Color</div><div class="spec-value">${car.color || '—'}</div></div>
        </div>
      </div>

      ${car.description ? `
      <div class="details-section seller-comment">
        <h3 class="details-section-title">Seller's Note</h3>
        <p class="seller-comment-text">${car.description}</p>
      </div>` : ''}

      <div class="details-actions">
        ${isOwner ? `
        <button class="btn btn-danger btn-lg w-full" id="detail-delete-btn" style="margin-bottom: 1rem;" data-car-id="${car.id}">
          Delete My Listing
        </button>
        ` : `
        <button class="btn btn-primary btn-lg w-full" id="detail-contact-btn"
                data-car-id="${car.id}" data-car-name="${car.make} ${car.model}" ${guestAttrs}>
          Message Seller
        </button>
        `}
        <div class="details-action-group">
          <button class="btn btn-outline btn-lg w-full ${favored ? 'favorited-btn' : ''}" id="detail-fav-btn" ${guestAttrs}>
            ${favored ? 'Remove from Favorites' : 'Add to Favorites'}
          </button>
          ${!isOwner ? `
          <button class="btn btn-report w-full" id="detail-report-btn"
                  data-car-id="${car.id}" data-car-name="${car.make} ${car.model}" style="margin:0;" ${guestAttrs}>
            Report this ad
          </button>
          ` : ''}
        </div>
      </div>

      <div id="bidding-container"></div>
    </div>
  `;

  // Render image carousel
  const carouselArea = document.getElementById('car-carousel-area');
  if (images.length > 1) {
    createImageCarousel(images, carouselArea);
  } else {
    carouselArea.innerHTML = `
      <img src="${images[0]}" alt="${car.make} ${car.model}" class="details-img"
           onerror="this.src='https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80'">
      <span class="details-badge">${catLabel}</span>
    `;
  }

  // Back link breadcrumb
  const backLink = document.getElementById('breadcrumb-category');
  if (backLink) {
    backLink.href = `/categories?type=${car.category}`;
    backLink.textContent = { suv: 'SUV', sedan: 'Sedan', hatchback: 'Hatchback' }[car.category] || 'All Cars';
  }

  // Contact seller (internal messaging)
  const contactBtn = document.getElementById('detail-contact-btn');
  if (contactBtn) {
    contactBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof requireAuthOrGuest === 'function' && !requireAuthOrGuest()) return;
      openContactModal(car.id, `${car.make} ${car.model}`);
    });
  }

  // Delete listing
  const deleteBtn = document.getElementById('detail-delete-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;
      
      try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : '';
        const res = await fetch(`/api/cars/${car.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        
        if (data.success) {
          if (typeof showToast === 'function') showToast('Listing deleted successfully.', 'success');
          setTimeout(() => {
            window.location.href = '/categories?type=all';
          }, 1500);
        } else {
          if (typeof showToast === 'function') showToast(data.error || 'Failed to delete listing.', 'error');
        }
      } catch (err) {
        if (typeof showToast === 'function') showToast('A network error occurred.', 'error');
      }
    });
  }

  // Favorites toggle
  const favBtn = document.getElementById('detail-fav-btn');
  favBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (typeof requireAuthOrGuest === 'function' && !requireAuthOrGuest()) return;
    if (isFavorited(car.id)) {
      removeFavorite(car.id);
      favBtn.textContent = 'Add to Favorites';
      favBtn.classList.remove('favorited-btn');
      showToast('Removed from favorites', 'info');
    } else {
      saveFavorite(car);
      favBtn.textContent = 'Remove from Favorites';
      favBtn.classList.add('favorited-btn');
      showToast('Added to favorites!', 'success');
    }
  });

  // Report car
  const reportBtn = document.getElementById('detail-report-btn');
  if (reportBtn) {
    reportBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof requireAuthOrGuest === 'function' && !requireAuthOrGuest()) return;
      openReportModal(car.id, `${car.make} ${car.model}`);
    });
  }

  // Render bidding section
  const biddingContainer = document.getElementById('bidding-container');
  if (typeof renderBiddingSection === 'function') {
    renderBiddingSection(car, biddingContainer);
  }
}

// ============================================
// REPORT MODAL
// ============================================
function openReportModal(carId, carName) {
  let modal = document.getElementById('report-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'report-modal';
    modal.className = 'modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
      <div class="modal-box">
        <button class="modal-close" id="report-modal-close">✕</button>
        <div class="modal-icon">Report</div>
        <h3>Report Listing</h3>
        <p class="modal-subtitle" id="report-car-name-display"></p>
        <form id="report-form" novalidate>
          <div class="form-group" style="margin-bottom:1rem; text-align:left;">
            <label for="report-reason-select">Reason for reporting <span class="required">*</span></label>
            <select id="report-reason-select" class="form-control" required>
              <option value="" disabled selected>Select a reason</option>
              <option value="Overpriced">Overpriced</option>
              <option value="Fake Information">Fake/Incorrect Information</option>
              <option value="Scam">Suspected Scam</option>
              <option value="Duplicate Listing">Duplicate Listing</option>
              <option value="Other">Other</option>
            </select>
            <span class="form-error" id="err-report-reason"></span>
          </div>
          <div class="form-group" style="margin-bottom:1.5rem; text-align:left;">
            <label for="report-details">Additional Details</label>
            <textarea id="report-details" class="form-control" rows="3"
                      placeholder="Please explain the issue (optional)" maxlength="400"></textarea>
          </div>
          <button type="submit" class="btn btn-danger btn-lg w-full" id="report-submit-btn">
            Submit Report
          </button>
        </form>
      </div>`;
    document.body.appendChild(modal);

    document.getElementById('report-modal-close').addEventListener('click', () => {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    });
    modal.addEventListener('click', e => {
      if (e.target === modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
    });
  }

  modal._carId = carId;
  modal._carName = carName;
  document.getElementById('report-car-name-display').textContent = carName;
  document.getElementById('report-reason-select').value = '';
  document.getElementById('report-details').value = '';
  const errEl = document.getElementById('err-report-reason');
  if (errEl) errEl.textContent = '';
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  const form = document.getElementById('report-form');
  form.onsubmit = (e) => {
    e.preventDefault();
    const reason = document.getElementById('report-reason-select').value;
    const details = document.getElementById('report-details').value.trim();
    const errEl = document.getElementById('err-report-reason');

    if (!reason) {
      if (errEl) errEl.textContent = 'Please select a reason.';
      document.getElementById('report-reason-select').focus();
      return;
    }
    if (errEl) errEl.textContent = '';

    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;

    addReport({
      carId: modal._carId,
      carName: modal._carName,
      reason,
      details,
      reporter: currentUser ? currentUser.username : 'Anonymous User',
    });

    modal.classList.remove('open');
    document.body.style.overflow = '';
    showToast('Report submitted successfully. Thank you.', 'success');
  };
}

// ============================================
// FAVORITES PAGE
// ============================================
function initFavoritesPage() {
  const grid = document.getElementById('favorites-grid');
  const emptyState = document.getElementById('favorites-empty');
  const countEl = document.getElementById('favorites-count');
  const favs = getFavorites();

  if (countEl) countEl.textContent = `${favs.length} saved cars`;

  if (!favs.length) {
    if (grid) grid.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (!grid) return;

  grid.innerHTML = favs.map(car => createCarCard(car)).join('');

  grid.querySelectorAll('.card-fav-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const id = parseInt(btn.dataset.carId);
      removeFavorite(id);
      btn.closest('.card').remove();
      const remaining = getFavorites().length;
      if (countEl) countEl.textContent = `${remaining} saved cars`;
      if (remaining === 0) {
        if (grid) grid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
      }
      showToast('Removed from favorites', 'info');
    });
  });

  grid.querySelectorAll('.contact-seller-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      openContactModal(parseInt(btn.dataset.carId), btn.dataset.carName);
    });
  });
}

// ============================================
// Init logic moved to main.js to ensure cars are loaded first
