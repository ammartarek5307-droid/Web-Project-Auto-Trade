'use strict';

// ============================================
// ADMIN AUTH
// ============================================
function requireAdminAuth() {
  if (!sessionStorage.getItem('at_admin_logged_in')) {
    window.location.href = 'admin-login.html';
    return false;
  }
  return true;
}

function adminLogout() {
  sessionStorage.removeItem('at_admin_logged_in');
  window.location.href = 'admin-login.html';
}

// ============================================
// ADMIN LOGIN PAGE
// ============================================
function initAdminLoginPage() {
  if (sessionStorage.getItem('at_admin_logged_in')) {
    window.location.href = 'admin.html';
    return;
  }

  const form = document.getElementById('admin-login-form');
  const alert = document.getElementById('login-alert');
  const showPassBtn = document.getElementById('show-pass-btn');
  const passInput = document.getElementById('admin-password');

  if (showPassBtn && passInput) {
    showPassBtn.addEventListener('click', () => {
      const isPass = passInput.type === 'password';
      passInput.type = isPass ? 'text' : 'password';
      showPassBtn.textContent = isPass ? 'Hide' : 'Show';
    });
  }

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const username = document.getElementById('admin-username').value.trim();
      const password = document.getElementById('admin-password').value;
      const btn = document.getElementById('login-submit-btn');

      // Animate button
      if (btn) { btn.disabled = true; btn.textContent = 'Verifying...'; }

      setTimeout(() => {
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
          sessionStorage.setItem('at_admin_logged_in', 'true');
          showToast('Welcome back, Admin! 👋', 'success');
          setTimeout(() => { window.location.href = 'admin.html'; }, 800);
        } else {
          if (alert) alert.classList.add('show');
          if (passInput) passInput.value = '';
          if (btn) { btn.disabled = false; btn.textContent = 'Login'; }
        }
      }, 600);

      form.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('input', () => { if (alert) alert.classList.remove('show'); }, { once: true });
      });
    });
  }
}

// ============================================
// ADMIN DASHBOARD
// ============================================
function initAdminDashboard() {
  if (!requireAdminAuth()) return;

  // Section switching
  const navLinks = document.querySelectorAll('.admin-nav a[data-section]');
  const sections = document.querySelectorAll('.admin-section');

  function switchSection(sectionId) {
    sections.forEach(s => s.classList.remove('active'));
    navLinks.forEach(l => l.classList.remove('active'));
    const target = document.getElementById(`section-${sectionId}`);
    const link = document.querySelector(`.admin-nav a[data-section="${sectionId}"]`);
    if (target) target.classList.add('active');
    if (link) link.classList.add('active');
    // Update URL hash for deep-linking without reload
    history.replaceState(null, '', `#${sectionId}`);
  }

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      switchSection(link.dataset.section);
    });
  });

  // Deep link from hash
  const hash = window.location.hash.replace('#', '');
  switchSection(hash || 'overview');

  // Logout
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', adminLogout);

  // Render all sections
  updateAdminStats();
  renderAdminListings();
  renderAdminReports();
  renderAdminUsers();
  renderAdminAnalytics();
  renderRecentActivity();

  // Settings save button
  const saveBtn = document.getElementById('save-settings-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      showToast('Settings saved successfully!', 'success');
    });
  }
}

// ============================================
// STATS
// ============================================
function updateAdminStats() {
  const allCars = getAllCarsForAdmin();
  const reports = getReports();
  const pending = reports.filter(r => r.status === 'pending').length;
  const pendingAds = getUserListings().filter(c => c.status === 'pending').length;

  const el = id => document.getElementById(id);
  if (el('stat-total-cars')) el('stat-total-cars').textContent = allCars.length;
  if (el('stat-open-reports')) el('stat-open-reports').textContent = pending;
  if (el('stat-user-listings')) el('stat-user-listings').textContent = getUserListings().length;
  if (el('stat-pending-ads')) el('stat-pending-ads').textContent = pendingAds;
}

// ============================================
// LISTINGS TABLE
// ============================================
function renderAdminListings() {
  const tbody = document.getElementById('listings-tbody');
  if (!tbody) return;

  const allCars = getAllCarsForAdmin();
  tbody.innerHTML = allCars.map(car => `
    <tr data-car-id="${car.id}">
      <td>
        <div class="admin-car-cell">
          <img src="${car.image}" alt="${car.make}" class="admin-car-thumb"
               onerror="this.src='https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=200&q=60'">
          <div>
            <div class="cell-primary">${car.make} ${car.model}</div>
            <div class="cell-secondary">${car.year} · ${car.city || '—'}</div>
          </div>
        </div>
      </td>
      <td style="text-transform:capitalize;">${car.category}${car.subType ? ' / ' + car.subType : ''}</td>
      <td class="price-cell">${formatEGP(car.price)}</td>
      <td>${Number(car.mileage).toLocaleString('en-US')} km</td>
      <td>
        <span class="status-badge ${car.status === 'pending' ? 'pending' : (car.isUserListed ? 'pending' : 'approved')}" id="badge-${car.id}">
          ${car.status === 'pending' ? '⏳ Pending' : '✅ Approved'}
        </span>
      </td>
      <td>
        <div class="action-btns">
          ${car.isUserListed && car.status !== 'approved' ? `<button class="btn btn-sm btn-success approve-listing-btn" data-car-id="${car.id}">Approve</button>` : ''}
          <button class="btn btn-sm btn-danger remove-listing-btn" data-car-id="${car.id}">Remove</button>
        </div>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('.approve-listing-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const carId = parseInt(btn.dataset.carId);
      approveUserListing(carId);
      const badge = document.getElementById(`badge-${carId}`);
      if (badge) { badge.textContent = '✅ Approved'; badge.className = 'status-badge approved'; }
      // Log to activity feed
      const row = btn.closest('tr');
      const carName = row ? (row.querySelector('.cell-primary')?.textContent?.trim() || 'Car') : 'Car';
      addActivityLog({ type: 'approval', action: `✅ Approved: ${carName}`, user: 'Admin', status: 'approved' });
      btn.remove();
      updateAdminStats();
      renderRecentActivity();
      showToast('Listing approved. It is now visible to buyers.', 'success');
    });
  });

  tbody.querySelectorAll('.remove-listing-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const carId = parseInt(btn.dataset.carId);
      removeUserListing(carId);
      btn.closest('tr').remove();
      showToast('Listing removed.', 'info');
      updateAdminStats();
    });
  });
}

// ============================================
// REPORTS TABLE
// ============================================
function renderAdminReports() {
  const tbody = document.getElementById('reports-tbody');
  const countBadge = document.getElementById('reports-open-count');
  if (!tbody) return;

  const reports = getReports();
  const pending = reports.filter(r => r.status === 'pending').length;
  if (countBadge) countBadge.textContent = `${pending} Open`;

  if (!reports.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-cell">No reports found.</td></tr>`;
    return;
  }

  tbody.innerHTML = reports.map(r => `
    <tr data-report-id="${r.id}">
      <td class="report-id">${r.id}</td>
      <td class="cell-primary">${r.carName}</td>
      <td>${r.reporter || 'Anonymous'}</td>
      <td>${r.reason}</td>
      <td>${r.details || '—'}</td>
      <td class="cell-secondary">${r.date}</td>
      <td><span class="status-badge ${r.status}">${statusLabel(r.status)}</span></td>
      <td>
        ${r.status === 'pending' ? `
        <div class="action-btns">
          <button class="btn btn-sm btn-danger resolve-remove-btn" data-report-id="${r.id}" data-car-id="${r.carId}" title="Remove car and resolve report">Remove Car</button>
          <button class="btn btn-sm btn-outline dismiss-report-btn" data-report-id="${r.id}" title="Dismiss report">Dismiss</button>
        </div>` : '<span style="color:var(--text-muted); font-size:0.82rem;">Resolved</span>'}
      </td>
    </tr>
  `).join('');

  // Remove car + resolve report
  tbody.querySelectorAll('.resolve-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const reportId = btn.dataset.reportId;
      const carId = parseInt(btn.dataset.carId);
      removeUserListing(carId);
      updateReport(reportId, { status: 'resolved' });
      const row = btn.closest('tr');
      const badge = row.querySelector('.status-badge');
      if (badge) { badge.textContent = '✅ Resolved'; badge.className = 'status-badge approved'; }
      btn.closest('.action-btns').remove();
      updateAdminStats();
      showToast('Car removed and report resolved.', 'success');
    });
  });

  // Dismiss report
  tbody.querySelectorAll('.dismiss-report-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const reportId = btn.dataset.reportId;
      updateReport(reportId, { status: 'dismissed' });
      const row = btn.closest('tr');
      const badge = row.querySelector('.status-badge');
      if (badge) { badge.textContent = '🚫 Dismissed'; badge.className = 'status-badge rejected'; }
      btn.closest('.action-btns').remove();
      updateAdminStats();
      showToast('Report dismissed.', 'info');
    });
  });
}

// ============================================
// RECENT ACTIVITY
// ============================================
function renderRecentActivity() {
  const tbody = document.getElementById('activity-tbody');
  if (!tbody) return;

  const log = getActivityLog();

  if (!log.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-cell" style="text-align:center;color:var(--text-muted);padding:2rem;">No activity yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = log.slice(0, 10).map(entry => {
    const statusClass = entry.status === 'approved' ? 'approved'
      : entry.status === 'pending' ? 'pending'
        : entry.status === 'resolved' ? 'approved'
          : 'pending';
    const statusText = entry.status === 'approved' ? '✅ Approved'
      : entry.status === 'pending' ? '⏳ Pending'
        : entry.status === 'resolved' ? '✅ Resolved'
          : statusLabel(entry.status);
    const timeAgo = formatTimeAgo(entry.timestamp);
    const actionText = entry.carName ? `${entry.action} — ${entry.carName}` : entry.action;
    return `
      <tr>
        <td>${actionText}</td>
        <td>${entry.user || '—'}</td>
        <td>${timeAgo}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
      </tr>`;
  }).join('');
}

function formatTimeAgo(timestamp) {
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString('en-EG', { month: 'short', day: 'numeric' });
}

function statusLabel(status) {
  const map = { pending: '⏳ Pending', resolved: '✅ Resolved', dismissed: '🚫 Dismissed', approved: '✅ Approved', rejected: '❌ Rejected' };
  return map[status] || status;
}

// ============================================
// USERS TABLE — Overview Mode
// Shows user information and their car listings
// ============================================
function renderAdminUsers() {
  const tbody = document.getElementById('users-tbody');
  const countEl = document.getElementById('users-count');
  if (!tbody) return;

  // Base/mock users (always present) — sellers from data.js
  const allCars = getAllCarsForAdmin();
  const baseUsers = [
    { id: 'b1', name: 'Ahmed Mohamed', phone: '+20 100 123 4567', joined: 'Jan 10, 2024', isBase: true, sellerId: 1 },
    { id: 'b2', name: 'Mohamed Abdelrahman', phone: '+20 112 234 5678', joined: 'Feb 5, 2024', isBase: true, sellerId: 2 },
    { id: 'b3', name: 'Sarah Ali Hassan', phone: '+20 101 345 6789', joined: 'Mar 22, 2024', isBase: true, sellerId: 3 },
    { id: 'b4', name: 'Khaled Ibrahim', phone: '+20 115 456 7890', joined: 'Dec 1, 2023', isBase: true, sellerId: 4 },
    { id: 'b5', name: 'Noura Youssef', phone: '+20 106 567 8901', joined: 'Nov 15, 2023', isBase: true, sellerId: 5 },
    { id: 'b6', name: 'Omar Farouk', phone: '+20 100 678 9012', joined: 'Oct 8, 2023', isBase: true, sellerId: 6 },
    { id: 'b7', name: 'Reem Tarek', phone: '+20 111 789 0123', joined: 'Sep 20, 2023', isBase: true, sellerId: 7 },
    { id: 'b8', name: 'Hesham Atef', phone: '+20 122 890 1234', joined: 'Aug 15, 2023', isBase: true, sellerId: 8 },
  ];

  // Get car listings for each base user
  baseUsers.forEach(user => {
    user.cars = allCars.filter(c => c.sellerId === user.sellerId && !c.isUserListed);
    user.listings = user.cars.length;
  });

  // Real sellers from localStorage
  const userListings = getUserListings();
  const realSellers = getRegisteredSellers().map(s => {
    const sellerCars = userListings.filter(c => c.sellerId === s.id);
    return {
      id: s.id,
      name: s.name,
      phone: s.phone,
      listings: sellerCars.length,
      cars: sellerCars,
      joined: s.joined || '—',
      isBase: false,
    };
  });

  const allUsers = [...baseUsers, ...realSellers];
  if (countEl) countEl.textContent = `${allUsers.length} registered users`;

  if (!allUsers.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-cell">No users found.</td></tr>`;
    return;
  }

  tbody.innerHTML = allUsers.map(user => {
    // Build car details summary
    let carDetails = '—';
    if (user.cars && user.cars.length > 0) {
      carDetails = user.cars.map(c => {
        const statusBadge = c.status === 'pending'
          ? '<span class="status-badge pending" style="margin-left:.4rem;font-size:.68rem;">Pending</span>'
          : '';
        return `<div style="font-size:.8rem; margin-bottom:.2rem;">🚗 ${c.make} ${c.model} <span style="color:var(--color-sky-blue);font-weight:700;">${formatEGP(c.price)}</span>${statusBadge}</div>`;
      }).join('');
    }

    return `
    <tr data-user-id="${user.id}">
      <td>
        <div class="admin-user-cell">
          <div class="user-avatar" style="background:${user.isBase ? 'rgba(14,165,233,.15)' : 'rgba(16,185,129,.15)'};color:${user.isBase ? '#0ea5e9' : '#059669'};">${user.name.charAt(0).toUpperCase()}</div>
          <div>
            <div class="cell-primary">${user.name}</div>
            ${!user.isBase ? '<div class="cell-secondary"><span style="color:var(--color-success);font-weight:700;">New Seller</span></div>' : ''}
          </div>
        </div>
      </td>
      <td class="cell-secondary">${user.phone}</td>
      <td style="font-weight:700; text-align:center;">${user.listings}</td>
      <td>${carDetails}</td>
      <td class="cell-secondary">${user.joined}</td>
    </tr>
  `;
  }).join('');
}

// ============================================
// ANALYTICS
// ============================================
function renderAdminAnalytics() {
  const chart = document.getElementById('analytics-chart');
  if (!chart) return;

  const allCars = getAllCarsForAdmin();
  const counts = { suv: 0, sedan: 0, hatchback: 0 };
  allCars.forEach(c => { if (counts[c.category] !== undefined) counts[c.category]++; });
  const max = Math.max(...Object.values(counts), 1);

  const data = [
    { label: 'SUV', value: counts.suv },
    { label: 'Sedan', value: counts.sedan },
    { label: 'Hatchback', value: counts.hatchback },
    { label: 'New Reports', value: getReports().filter(r => r.status === 'pending').length },
    { label: 'Private Ads', value: getUserListings().length },
  ];

  chart.innerHTML = data.map(d => `
    <div class="chart-bar-group">
      <div class="chart-bar-label">${d.label}</div>
      <div class="chart-bar-track">
        <div class="chart-bar-fill" style="width:${Math.max((d.value / Math.max(max, 1)) * 100, 4)}%"></div>
      </div>
      <div class="chart-bar-val">${d.value}</div>
    </div>
  `).join('');
}

// ============================================
// GLOBAL INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  if (path.endsWith('admin-login.html')) initAdminLoginPage();
  if (path.endsWith('admin.html')) initAdminDashboard();
});
