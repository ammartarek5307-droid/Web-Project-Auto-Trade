'use strict';

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, duration);
}

// ============================================
// MOBILE MENU
// ============================================
function initMobileMenu() {
  const toggle = document.getElementById('mobile-menu-toggle');
  const nav = document.getElementById('nav-links');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('active');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      nav.classList.remove('active');
    }
  });
}

// ============================================
// MESSAGE SELLER MODAL (Internal — replaces WhatsApp)
// ============================================
function injectContactModal() {
  // No longer inject the old WhatsApp-based modal
  // Messaging is now handled by messaging.js openMessageSellerModal()
}

function openContactModal(carId, carName) {
  // Redirect to internal messaging
  if (typeof openMessageSellerModal === 'function') {
    openMessageSellerModal(carId, carName);
  } else {
    showToast('Please log in to message the seller.', 'info');
    if (typeof showAuthGate === 'function') showAuthGate();
  }
}

function closeContactModal() {
  const modal = document.getElementById('message-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => modal.remove(), 350);
  }
}

// ============================================
// CAR CARD BUILDER
// ============================================
function createCarCard(car) {
  const favored = isFavorited(car.id);
  const priceFormatted = formatEGP(car.price);
  const catLabel = car.subType === 'coupe'
    ? (car.category.charAt(0).toUpperCase() + car.category.slice(1)) + ' Coupé'
    : (car.category ? car.category.charAt(0).toUpperCase() + car.category.slice(1) : '');
  const badgeClass = car.isUserListed ? 'badge-user' : `badge-${car.category}`;
  const badgeText = car.isUserListed ? 'Private Seller' : catLabel;

  // Get highest bid
  const highestBid = typeof getHighestBid === 'function' ? getHighestBid(car.id) : null;

  // Use first image if multiple images exist
  const displayImage = Array.isArray(car.images) && car.images.length > 0 ? car.images[0] : car.image;

  return `
    <article class="card" data-car-id="${car.id}">
      <div class="card-img-wrapper">
        <span class="card-badge ${badgeClass}">${badgeText}</span>
        <button class="card-fav-btn ${favored ? 'favorited' : ''}"
                data-car-id="${car.id}"
                aria-label="${favored ? 'Remove from Favorites' : 'Add to Favorites'}"
                title="${favored ? 'Remove from Favorites' : 'Add to Favorites'}">
          <span class="fav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${favored ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </span>
        </button>
        ${Array.isArray(car.images) && car.images.length > 1 ? `<span class="carousel-counter">${car.images.length} photos</span>` : ''}
        <img src="${displayImage}" alt="${car.make} ${car.model}" loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80'">
      </div>
      <div class="card-body">
        <h3 class="card-title">${car.make} ${car.model}</h3>
        <p class="card-price">${priceFormatted}</p>
        ${highestBid ? `<p style="font-size:.75rem;color:var(--color-accent);font-weight:700;margin-bottom:.5rem;">Highest bid: ${formatEGP(highestBid.amount)}</p>` : ''}
        <div class="card-meta">
          <div class="card-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>${car.year}</span>
          </div>
          <div class="card-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>${Number(car.mileage).toLocaleString('en-US')} km</span>
          </div>
          <div class="card-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2v4"/><path d="M7 2v4"/><path d="M11 2v4"/><rect x="3" y="10" width="8" height="12" rx="1"/><path d="M11 12h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4"/></svg>
            <span>${car.fuel || 'N/A'}</span>
          </div>
          ${car.city ? `
          <div class="card-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${car.city}</span>
          </div>` : ''}
        </div>
        <hr class="card-divider">
        <div class="card-actions">
          <a href="/car-details?id=${car.id}" class="btn btn-primary" id="view-car-${car.id}">View Details</a>
          <button class="btn btn-outline contact-seller-btn"
                  data-car-id="${car.id}"
                  data-car-name="${car.make} ${car.model}"
                  id="contact-btn-${car.id}">Message</button>
        </div>
      </div>
    </article>
  `;
}

// ============================================
// BIND CARD EVENTS
// ============================================
function bindCardEvents(container) {
  container.querySelectorAll('.card-fav-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const carId = parseInt(btn.dataset.carId);
      const car = getAllCars().find(c => c.id === carId);
      if (!car) return;
      if (isFavorited(car.id)) {
        removeFavorite(car.id);
        btn.classList.remove('favorited');
        btn.querySelector('.fav-icon svg').setAttribute('fill', 'none');
        showToast(`Removed "${car.make} ${car.model}" from favorites`, 'info');
      } else {
        saveFavorite(car);
        btn.classList.add('favorited');
        btn.querySelector('.fav-icon svg').setAttribute('fill', 'currentColor');
        showToast(`Added "${car.make} ${car.model}" to favorites!`, 'success');
      }
    });
  });

  container.querySelectorAll('.contact-seller-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      openContactModal(parseInt(btn.dataset.carId), btn.dataset.carName);
    });
  });
}

// ============================================
// HOME PAGE
// ============================================
function initHomePage() {
  const latestGrid = document.getElementById('latest-cars-grid');
  if (latestGrid) {
    const cars = getAllCars().slice(0, 6);
    latestGrid.innerHTML = cars.map(createCarCard).join('');
    bindCardEvents(latestGrid);
  }
}

// ============================================
// GLOBAL INIT
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize theme first (before auth gate to style it properly)
  if (typeof initTheme === 'function') initTheme();

  // Initialize mobile menu
  initMobileMenu();

  // Initialize auth gate (blocks content for unauthenticated users)
  if (typeof initAuthGate === 'function') initAuthGate();

  // Load cars from MongoDB API before initializing pages
  if (typeof loadCarsFromApi === 'function') {
    await loadCarsFromApi();
  }

  const path = window.location.pathname;
  if (path.endsWith('/') || path === '/' || path.endsWith('index')) {
    initHomePage();
  }

  // Initialize cars page logic if needed
  if (path.endsWith('categories') || path.includes('/categories')) {
    if (typeof initCategoriesPage === 'function') initCategoriesPage();
  }
  if (path.endsWith('car-details') || path.includes('/car-details')) {
    if (typeof initDetailsPage === 'function') initDetailsPage();
  }
  if (path.endsWith('favorites') || path.includes('/favorites')) {
    if (typeof initFavoritesPage === 'function') initFavoritesPage();
  }

  // Header scroll effect
  window.addEventListener('scroll', () => {
    document.getElementById('main-header')?.classList.toggle('scrolled', window.scrollY > 50);
  });
});
