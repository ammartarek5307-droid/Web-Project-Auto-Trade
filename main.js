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
  const icons = { success: '', error: '', info: '', warning: '' };
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
  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      nav.classList.remove('active');
    }
  });
}

// ============================================
// CONTACT SELLER MODAL
// ============================================
function injectContactModal() {
  if (document.getElementById('contact-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'contact-modal';
  modal.className = 'modal-overlay';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.innerHTML = `
    <div class="modal-box" id="contact-modal-box">
      <button class="modal-close" id="modal-close-btn" aria-label="Close">✕</button>
      <div class="modal-icon">Contact</div>
      <h3 id="modal-car-name">Contact Seller</h3>
      <p class="modal-subtitle">Get in touch directly with the seller</p>
      <div class="contact-info-box">
        <div class="contact-info-row">
          <div>
            <div class="contact-info-label">Seller Name</div>
            <div class="contact-info-value" id="modal-seller-name">—</div>
          </div>
          <button class="copy-btn" data-target="modal-seller-name" id="copy-name-btn">Copy</button>
        </div>
        <div class="contact-info-row">
          <div>
            <div class="contact-info-label">Phone Number</div>
            <div class="contact-info-value" id="modal-seller-phone">—</div>
          </div>
          <button class="copy-btn" data-target="modal-seller-phone" id="copy-phone-btn">Copy</button>
        </div>
      </div>
      <a id="modal-whatsapp-link" href="#" class="btn btn-success w-full" target="_blank" rel="noopener">
        WhatsApp
      </a>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('modal-close-btn').addEventListener('click', closeContactModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeContactModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeContactModal(); });

  modal.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      navigator.clipboard.writeText(target.textContent).then(() => {
        btn.textContent = 'Done!';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
      }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = target.textContent;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        btn.textContent = 'Done!';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
      });
    });
  });
}

function openContactModal(carId, carName) {
  injectContactModal();
  const car = getAllCars().find(c => c.id === carId);
  const sellerId = car?.sellerId || carId;

  // 1. Check hardcoded in-memory sellers (base cars 1–12)
  let seller = sellersData[sellerId] || sellersData[carId];

  // 2. If not found, check real sellers saved to localStorage (user-submitted listings)
  if (!seller) {
    const regSeller = getRegisteredSellers().find(s => s.id === sellerId || s.id === carId);
    if (regSeller) seller = { name: regSeller.name, phone: regSeller.phone };
  }

  // 3. Ultimate fallback
  if (!seller) seller = { name: 'Trusted Seller', phone: '+20 100 000 0000' };

  document.getElementById('modal-car-name').textContent = carName;
  document.getElementById('modal-seller-name').textContent = seller.name;
  document.getElementById('modal-seller-phone').textContent = seller.phone;

  const phoneClean = seller.phone.replace(/\s+/g, '').replace('+', '');
  document.getElementById('modal-whatsapp-link').href =
    `https://wa.me/${phoneClean}?text=${encodeURIComponent('Hello, I am interested in the ' + carName + ' listed on AutoTrade')}`;

  document.getElementById('contact-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeContactModal() {
  const modal = document.getElementById('contact-modal');
  if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
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
        <img src="${car.image}" alt="${car.make} ${car.model}" loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80'">
      </div>
      <div class="card-body">
        <h3 class="card-title">${car.make} ${car.model}</h3>
        <p class="card-price">${priceFormatted}</p>
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
          <a href="car-details.html?id=${car.id}" class="btn btn-primary" id="view-car-${car.id}">View Details</a>
          <button class="btn btn-outline contact-seller-btn"
                  data-car-id="${car.id}"
                  data-car-name="${car.make} ${car.model}"
                  id="contact-btn-${car.id}">Contact</button>
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
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  injectContactModal();

  const path = window.location.pathname;
  if (path.endsWith('index.html') || path === '/' || path.endsWith('/')) {
    initHomePage();
  }
});
