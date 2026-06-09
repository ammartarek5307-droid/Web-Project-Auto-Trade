'use strict';

// ============================================
// ADMIN API HELPERS
// ============================================
function getAdminToken() {
  return sessionStorage.getItem('at_admin_token') || '';
}

async function adminFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Token': getAdminToken(),
      ...(options.headers || {}),
    },
  });
  return res.json();
}

// ============================================
// ADMIN AUTH
// ============================================
function requireAdminAuth() {
    // Server-side session handles authentication.
  // If we got here, the server already verified the admin session.
  // Just check for the client-side token for API calls.
  if (!getAdminToken()) {
    // Token missing — server should have redirected, but just in case
    window.location.href = '/admin-login';
    return false;
  }
  return true;
}

async function adminLogout() {
  // Clear server session
  try {
    await fetch('/admin-logout', { method: 'POST' });
  } catch (e) { /* ignore */ }
  // Clear client-side token
  sessionStorage.removeItem('at_admin_token');
  window.location.href = '/admin-login';
}

// Admin login page is now handled by inline script in admin-login.ejs
// No initAdminLoginPage() function needed here.

// ============================================
// ADMIN DASHBOARD — STATE
// ============================================
// In-memory cache of data loaded from the API
const adminState = {
  cars: [],
  reports: [],
  users: [],
};

// ============================================
// DATA LOADERS
// ============================================
async function loadDBListings() {
  try {
    const data = await adminFetch('/api/cars/admin');
    if (data.success && data.cars) {
      adminState.cars = data.cars.map(c => ({
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
      }));
    }
  } catch (err) { console.warn('Could not load DB listings:', err); }
}

async function loadDBReports() {
  try {
    const data = await adminFetch('/api/reports');
    if (data.success && data.reports) {
      adminState.reports = data.reports.map(r => ({
        id: r._id,
        carId: r.carId,
        carName: r.carName,
        reporter: r.reporter,
        reason: r.reason,
        details: r.details,
        date: new Date(r.createdAt).toLocaleString('en-EG'),
        status: r.status,
      }));
    }
  } catch (err) { console.warn('Could not load DB reports:', err); }
}

async function loadDBUsers() {
  try {
    const data = await adminFetch('/api/auth/users');
    if (data.success && data.users) {
      adminState.users = data.users.map(u => ({
        id: u._id,
        username: u.username,
        phone: u.phone,
        role: u.role,
        status: u.status || 'active',
        signupDate: u.createdAt,
        lastLogin: u.lastLogin,
      }));
    }
  } catch (err) { console.warn('Could not load DB users:', err); }
}

// ============================================
// ADMIN DASHBOARD INIT
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
    history.replaceState(null, '', `#${sectionId}`);
  }

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      switchSection(link.dataset.section);
    });
  });

  const hash = window.location.hash.replace('#', '');
  switchSection(hash || 'overview');

  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', adminLogout);

  const saveBtn = document.getElementById('save-settings-btn');
  if (saveBtn) saveBtn.addEventListener('click', () => showToast('Settings saved successfully!', 'success'));

  // Load all data from MongoDB then render
  setLoadingState(true);
  Promise.all([loadDBListings(), loadDBReports(), loadDBUsers()])
    .then(() => {
      setLoadingState(false);
      renderAll();
    })
    .catch(err => {
      console.error('Failed to load admin data:', err);
      setLoadingState(false);
      showToast('Could not load some admin data. Please refresh.', 'error');
      renderAll();
    });
}

function setLoadingState(loading) {
  // Show a subtle loading indicator in each table body if needed
  ['listings-tbody', 'reports-tbody', 'users-tbody', 'audit-tbody', 'activity-tbody'].forEach(id => {
    const el = document.getElementById(id);
    if (el && loading) {
      el.innerHTML = `<tr><td colspan="8" class="empty-cell" style="text-align:center;color:var(--text-muted);padding:2rem;">
        <span style="opacity:.6;">Loading…</span></td></tr>`;
    }
  });
}

function renderAll() {
  updateAdminStats();
  renderAdminListings();
  renderAdminReports();
  renderAdminUsers();
  renderAdminAnalytics();
  renderRecentActivity();
  renderAuditLog();
}

// ============================================
// STATS
// ============================================
function updateAdminStats() {
  const el = id => document.getElementById(id);
  const pending = adminState.reports.filter(r => r.status === 'pending').length;
  const userListings = adminState.cars.filter(c => c.isUserListed);
  const pendingAds = userListings.filter(c => c.status === 'pending').length;

  if (el('stat-total-cars')) el('stat-total-cars').textContent = adminState.cars.length;
  if (el('stat-open-reports')) el('stat-open-reports').textContent = pending;
  if (el('stat-user-listings')) el('stat-user-listings').textContent = userListings.length;
  if (el('stat-pending-ads')) el('stat-pending-ads').textContent = pendingAds;
  if (el('stat-active-users')) el('stat-active-users').textContent = adminState.users.length || '—';
}

// ============================================
// LISTINGS TABLE
// ============================================
function renderAdminListings() {
  const tbody = document.getElementById('listings-tbody');
  if (!tbody) return;

  if (!adminState.cars.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-cell">No listings found.</td></tr>`;
    return;
  }

  tbody.innerHTML = adminState.cars.map(car => `
    <tr data-car-id="${car.id}">
      <td>
        <div class="admin-car-cell">
          <img src="${Array.isArray(car.images) && car.images.length > 0 ? car.images[0] : (car.image || '')}"
               alt="${car.make}" class="admin-car-thumb"
               onerror="this.src='https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=200&q=60'">
          <div>
            <div class="cell-primary">${car.make} ${car.model}</div>
            <div class="cell-secondary">${car.year} · ${car.city || '—'}${Array.isArray(car.images) && car.images.length > 1 ? ` · ${car.images.length} photos` : ''}</div>
          </div>
        </div>
      </td>
      <td style="text-transform:capitalize;">${car.category}${car.subType ? ' / ' + car.subType : ''}</td>
      <td class="price-cell">${formatEGP(car.price)}</td>
      <td>${Number(car.mileage).toLocaleString('en-US')} km</td>
      <td>
        <span class="status-badge ${car.status === 'pending' ? 'pending' : 'approved'}" id="badge-${car.id}">
          ${car.status === 'pending' ? 'Pending' : 'Approved'}
        </span>
      </td>
      <td>
        <div class="action-btns">
          ${car.status === 'pending' ? `<button class="btn btn-sm btn-success approve-listing-btn" data-car-id="${car.id}">Approve</button>` : ''}
          <button class="btn btn-sm btn-danger remove-listing-btn" data-car-id="${car.id}">Remove</button>
        </div>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('.approve-listing-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const carId = btn.dataset.carId;
      try {
        const data = await adminFetch(`/api/cars/${carId}/approve`, { method: 'PUT' });
        if (data.success) {
          // Update local state
          const car = adminState.cars.find(c => c.id === carId);
          if (car) car.status = 'approved';

          const badge = document.getElementById(`badge-${carId}`);
          if (badge) { badge.textContent = 'Approved'; badge.className = 'status-badge approved'; }
          btn.remove();
          updateAdminStats();
          renderAdminAnalytics();
          showToast('Listing approved. It is now visible to buyers.', 'success');
          addActivityLogEntry({ type: 'approval', action: `Approved listing`, user: 'Admin', status: 'approved' });
        } else {
          showToast(data.error || 'Failed to approve.', 'error');
        }
      } catch (err) {
        console.error('Approve error:', err);
        showToast('Network error — could not approve.', 'error');
      }
    });
  });

  tbody.querySelectorAll('.remove-listing-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const carId = btn.dataset.carId;
      try {
        await adminFetch(`/api/cars/${carId}/admin`, { method: 'DELETE' });
        adminState.cars = adminState.cars.filter(c => c.id !== carId);
        btn.closest('tr').remove();
        updateAdminStats();
        renderAdminAnalytics();
        showToast('Listing removed.', 'info');
      } catch (err) {
        console.error('Remove error:', err);
        showToast('Network error — could not remove.', 'error');
      }
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

  const pending = adminState.reports.filter(r => r.status === 'pending').length;
  if (countBadge) countBadge.textContent = `${pending} Open`;

  if (!adminState.reports.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-cell">No reports found.</td></tr>`;
    return;
  }

  tbody.innerHTML = adminState.reports.map(r => `
    <tr data-report-id="${r.id}">
      <td class="report-id">${String(r.id).slice(-6)}</td>
      <td class="cell-primary">${r.carName || '—'}</td>
      <td>${r.reporter || 'Anonymous'}</td>
      <td>${r.reason || '—'}</td>
      <td>${r.details || '—'}</td>
      <td class="cell-secondary">${r.date}</td>
      <td><span class="status-badge ${r.status}" id="rbadge-${r.id}">${statusLabel(r.status)}</span></td>
      <td>
        ${r.status === 'pending' ? `
        <div class="action-btns">
          <button class="btn btn-sm btn-danger resolve-remove-btn" data-report-id="${r.id}" data-car-id="${r.carId}">Remove Car</button>
          <button class="btn btn-sm btn-outline dismiss-report-btn" data-report-id="${r.id}">Dismiss</button>
        </div>` : '<span style="color:var(--text-muted); font-size:0.82rem;">Resolved</span>'}
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('.resolve-remove-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const reportId = btn.dataset.reportId;
      const carId = btn.dataset.carId;
      try {
        // Remove the car from DB
        if (carId) await adminFetch(`/api/cars/${carId}/admin`, { method: 'DELETE' });
        // Resolve the report in DB
        await adminFetch(`/api/reports/${reportId}`, { method: 'PUT', body: JSON.stringify({ status: 'resolved' }) });

        // Update local state
        adminState.cars = adminState.cars.filter(c => c.id !== carId);
        const report = adminState.reports.find(r => r.id === reportId);
        if (report) report.status = 'resolved';

        const badge = document.getElementById(`rbadge-${reportId}`);
        if (badge) { badge.textContent = 'Resolved'; badge.className = 'status-badge approved'; }
        btn.closest('.action-btns').innerHTML = '<span style="color:var(--text-muted); font-size:0.82rem;">Resolved</span>';
        updateAdminStats();
        showToast('Car removed and report resolved.', 'success');
      } catch (err) {
        console.error('Resolve error:', err);
        showToast('Network error — could not resolve report.', 'error');
      }
    });
  });

  tbody.querySelectorAll('.dismiss-report-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const reportId = btn.dataset.reportId;
      try {
        await adminFetch(`/api/reports/${reportId}`, { method: 'PUT', body: JSON.stringify({ status: 'dismissed' }) });
        const report = adminState.reports.find(r => r.id === reportId);
        if (report) report.status = 'dismissed';

        const badge = document.getElementById(`rbadge-${reportId}`);
        if (badge) { badge.textContent = 'Dismissed'; badge.className = 'status-badge rejected'; }
        btn.closest('.action-btns').innerHTML = '<span style="color:var(--text-muted); font-size:0.82rem;">Resolved</span>';
        updateAdminStats();
        showToast('Report dismissed.', 'info');
      } catch (err) {
        console.error('Dismiss error:', err);
        showToast('Network error — could not dismiss report.', 'error');
      }
    });
  });
}

// ============================================
// USERS TABLE
// ============================================
function renderAdminUsers() {
  const tbody = document.getElementById('users-tbody');
  const countEl = document.getElementById('users-count');
  if (!tbody) return;

  if (countEl) countEl.textContent = `${adminState.users.length} registered users`;

  if (!adminState.users.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-cell">No registered users found.</td></tr>`;
    return;
  }

  tbody.innerHTML = adminState.users.map(user => {
    const isBanned = user.status === 'banned';
    const statusBadge = isBanned
      ? '<span class="status-badge banned">Banned</span>'
      : '<span class="status-badge active">Active</span>';
    const joined = user.signupDate
      ? new Date(user.signupDate).toLocaleDateString('en-EG', { year: 'numeric', month: 'short', day: 'numeric' })
      : '—';
    const banBtn = isBanned
      ? `<button class="btn btn-sm btn-success unban-user-btn" data-user-id="${user.id}">Unban</button>`
      : `<button class="btn btn-sm btn-danger ban-user-btn" data-user-id="${user.id}" data-user-name="${user.username}">Ban</button>`;

    // Count how many cars this user has listed
    const listingCount = adminState.cars.filter(c => String(c.sellerId) === String(user.id)).length;

    return `
    <tr data-user-id="${user.id}">
      <td>
        <div class="admin-user-cell">
          <div class="user-avatar" style="background:rgba(168,85,247,.15);color:#a855f7;">${(user.username || '?').charAt(0).toUpperCase()}</div>
          <div>
            <div class="cell-primary">${user.username}</div>
            <div class="cell-secondary">${user.role} (registered)</div>
          </div>
        </div>
      </td>
      <td class="cell-secondary">${user.phone || '—'}</td>
      <td style="font-weight:700; text-align:center;">${listingCount}</td>
      <td>${joined}</td>
      <td>${user.role}</td>
      <td>${statusBadge}</td>
      <td>
        <div class="action-btns">${banBtn}</div>
      </td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('.ban-user-btn').forEach(btn => {
    btn.addEventListener('click', () => showBanModal(btn.dataset.userId, btn.dataset.userName));
  });

  tbody.querySelectorAll('.unban-user-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const userId = btn.dataset.userId;
      try {
        await adminFetch(`/api/auth/users/${userId}/unban`, { method: 'PUT' });
        const user = adminState.users.find(u => u.id === userId);
        if (user) user.status = 'active';
        showToast('User has been unbanned.', 'success');
        renderAdminUsers();
      } catch (err) {
        console.error('Unban error:', err);
        showToast('Network error — could not unban.', 'error');
      }
    });
  });
}

// ============================================
// BAN MODAL
// ============================================
function showBanModal(userId, userName) {
  let modal = document.getElementById('ban-modal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'ban-modal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-box" style="text-align:left;">
      <button class="modal-close" id="ban-modal-close">✕</button>
      <h3 style="margin-bottom:.3rem;">Ban User</h3>
      <p class="modal-subtitle" style="text-align:left;">Are you sure you want to ban <strong>${userName}</strong>?</p>
      <div class="form-group" style="margin-bottom:1.25rem;">
        <label for="ban-reason">Reason (optional)</label>
        <textarea id="ban-reason" class="form-control" rows="2" placeholder="Provide a reason..." maxlength="300"></textarea>
      </div>
      <div style="display:flex; gap:.5rem;">
        <button class="btn btn-danger w-full" id="ban-confirm-btn">Ban User</button>
        <button class="btn btn-outline w-full" id="ban-cancel-btn">Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('open'));
  document.body.style.overflow = 'hidden';

  const close = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => modal.remove(), 350);
  };

  document.getElementById('ban-modal-close').addEventListener('click', close);
  document.getElementById('ban-cancel-btn').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });

  document.getElementById('ban-confirm-btn').addEventListener('click', async () => {
    const reason = document.getElementById('ban-reason').value.trim();
    try {
      await adminFetch(`/api/auth/users/${userId}/ban`, { method: 'PUT', body: JSON.stringify({ reason }) });
      const user = adminState.users.find(u => u.id === userId);
      if (user) user.status = 'banned';

      // Write audit log entry
      try {
        const auditLog = JSON.parse(localStorage.getItem('at_audit_log')) || [];
        auditLog.unshift({
          action: 'ban',
          targetUsername: userName,
          reason: reason,
          timestamp: Date.now(),
        });
        if (auditLog.length > 50) auditLog.length = 50;
        localStorage.setItem('at_audit_log', JSON.stringify(auditLog));
      } catch (e) { /* ignore */ }

      close();
      showToast(`User "${userName}" has been banned.`, 'warning');
      renderAdminUsers();
      renderAuditLog();
    } catch (err) {
      console.error('Ban error:', err);
      showToast('Network error — could not ban user.', 'error');
    }
  });
}

// ============================================
// AUDIT LOG (localStorage — admin-only actions)
// ============================================
function getAuditLog() {
  try { return JSON.parse(localStorage.getItem('at_audit_log')) || []; }
  catch { return []; }
}

function renderAuditLog() {
  const tbody = document.getElementById('audit-tbody');
  if (!tbody) return;

  const log = getAuditLog();
  if (!log.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-cell">No audit entries yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = log.slice(0, 20).map(entry => {
    const time = new Date(entry.timestamp).toLocaleString('en-EG', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const actionClass = entry.action === 'ban' ? 'banned' : 'approved';
    return `
      <tr>
        <td><span class="status-badge ${actionClass}">${entry.action.toUpperCase()}</span></td>
        <td class="cell-primary">${entry.targetUsername || '—'}</td>
        <td class="cell-secondary">${entry.reason || '—'}</td>
        <td>Admin</td>
        <td class="cell-secondary">${time}</td>
      </tr>`;
  }).join('');
}

// ============================================
// RECENT ACTIVITY (localStorage)
// ============================================
function addActivityLogEntry(entry) {
  try {
    const log = JSON.parse(localStorage.getItem('at_activity')) || [];
    log.unshift({ id: Date.now(), timestamp: Date.now(), ...entry });
    if (log.length > 50) log.length = 50;
    localStorage.setItem('at_activity', JSON.stringify(log));
  } catch (e) { /* ignore */ }
}

function renderRecentActivity() {
  const tbody = document.getElementById('activity-tbody');
  if (!tbody) return;

  let log = [];
  try { log = JSON.parse(localStorage.getItem('at_activity')) || []; } catch { log = []; }

  if (!log.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-cell" style="text-align:center;color:var(--text-muted);padding:2rem;">No activity yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = log.slice(0, 10).map(entry => {
    const statusClass = entry.status === 'approved' ? 'approved'
      : entry.status === 'pending' ? 'pending'
        : entry.status === 'rejected' ? 'banned'
          : 'pending';
    const timeAgo = formatTimeAgo(entry.timestamp);
    const actionText = entry.carName ? `${entry.action} — ${entry.carName}` : entry.action;
    return `
      <tr>
        <td>${actionText}</td>
        <td>${entry.user || '—'}</td>
        <td>${timeAgo}</td>
        <td><span class="status-badge ${statusClass}">${statusLabel(entry.status)}</span></td>
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
  const map = {
    pending: 'Pending', resolved: 'Resolved', dismissed: 'Dismissed',
    approved: 'Approved', rejected: 'Rejected', banned: 'Banned', active: 'Active'
  };
  return map[status] || status;
}

// ============================================
// ANALYTICS
// ============================================
function renderAdminAnalytics() {
  const chart = document.getElementById('analytics-chart');
  if (!chart) return;

  const counts = { suv: 0, sedan: 0, hatchback: 0 };
  adminState.cars.forEach(c => { if (counts[c.category] !== undefined) counts[c.category]++; });
  const max = Math.max(...Object.values(counts), 1);

  const data = [
    { label: 'SUV', value: counts.suv },
    { label: 'Sedan', value: counts.sedan },
    { label: 'Hatchback', value: counts.hatchback },
    { label: 'Open Reports', value: adminState.reports.filter(r => r.status === 'pending').length },
    { label: 'Private Ads', value: adminState.cars.filter(c => c.isUserListed).length },
  ];

  chart.innerHTML = data.map(d => `
    <div class="chart-bar-group">
      <div class="chart-bar-label">${d.label}</div>
      <div class="chart-bar-track">
        <div class="chart-bar-fill" style="width:${Math.max((d.value / max) * 100, 4)}%"></div>
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
  // Admin login is now self-contained in admin-login.ejs — only init dashboard here
  if (path === '/admin' || path === '/admin/') {
    initAdminDashboard();
  }
});
