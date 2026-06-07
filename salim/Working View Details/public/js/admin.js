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

// Load DB listings into local cache so existing render functions work
async function loadDBListings() {
  try {
    const data = await adminFetch('/api/cars/admin');
    if (data.success && data.cars) {
      // Merge DB listings with base cars — store in localStorage for render functions
      const dbCars = data.cars.map(c => ({
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
      localStorage.setItem('at_user_listings', JSON.stringify(dbCars));
    }
  } catch (err) { console.warn('Could not load DB listings:', err); }
}

async function loadDBReports() {
  try {
    const data = await adminFetch('/api/reports');
    if (data.success && data.reports) {
      const mapped = data.reports.map(r => ({
        id: r._id,
        carId: r.carId,
        carName: r.carName,
        reporter: r.reporter,
        reason: r.reason,
        details: r.details,
        date: new Date(r.createdAt).toLocaleString('en-EG'),
        status: r.status,
      }));
      localStorage.setItem('at_reports', JSON.stringify(mapped));
    }
  } catch (err) { console.warn('Could not load DB reports:', err); }
}

async function loadDBUsers() {
  try {
    const data = await adminFetch('/api/auth/users');
    if (data.success && data.users) {
      const mapped = data.users.map(u => ({
        id: u._id,
        username: u.username,
        phone: u.phone,
        role: u.role,
        status: u.status,
        signupDate: u.createdAt,
        lastLogin: u.lastLogin,
        loginAttempts: 0,
        lockedUntil: null,
        passwordHash: '__server__',
      }));
      localStorage.setItem('at_users', JSON.stringify(mapped));
    }
  } catch (err) { console.warn('Could not load DB users:', err); }
}

// ============================================
// ADMIN AUTH
// ============================================
function requireAdminAuth() {
  if (!getAdminToken()) {
    window.location.href = '/admin-login';
    return false;
  }
  return true;
}

function adminLogout() {
  sessionStorage.removeItem('at_admin_token');
  window.location.href = '/admin-login';
}

// ============================================
// ADMIN LOGIN PAGE
// ============================================
function initAdminLoginPage() {
  if (getAdminToken()) {
    window.location.href = '/admin';
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
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const username = document.getElementById('admin-username').value.trim();
      const password = document.getElementById('admin-password').value;
      const btn = document.getElementById('login-submit-btn');

      // Animate button
      if (btn) { btn.disabled = true; btn.textContent = 'Verifying...'; }

      const testToken = `${username}:${password}`;
      
      try {
        const res = await fetch('/api/cars/stats', {
          headers: { 'X-Admin-Token': testToken }
        });
        const data = await res.json();
        
        if (res.ok && data.success) {
          sessionStorage.setItem('at_admin_token', testToken);
          showToast('Welcome back, Admin!', 'success');
          setTimeout(() => { window.location.href = '/admin'; }, 800);
        } else {
          throw new Error('Invalid credentials');
        }
      } catch (err) {
        if (alert) alert.classList.add('show');
        if (passInput) passInput.value = '';
        if (btn) { btn.disabled = false; btn.textContent = 'Login'; }
      }

      form.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('input', () => { if (alert) alert.classList.remove('show'); }, { once: true });
      });
    });
  }
}

// ============================================
// ADMIN BAN SYSTEM
// ============================================
function getAuditLog() {
  try { return JSON.parse(localStorage.getItem('at_audit_log')) || []; }
  catch { return []; }
}

function addAuditEntry(action, targetUserId, targetUsername, reason) {
  const log = getAuditLog();
  log.unshift({
    id: 'AUDIT-' + Date.now(),
    adminId: 'admin',
    action,
    targetUserId,
    targetUsername,
    reason: reason || '',
    timestamp: new Date().toISOString(),
  });
  if (log.length > 100) log.length = 100;
  localStorage.setItem('at_audit_log', JSON.stringify(log));
}

function banUser(userId, reason) {
  if (typeof getUsers !== 'function') return;
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (user) {
    user.status = 'banned';
    saveUsers(users);
    addAuditEntry('ban', userId, user.username, reason);
    addActivityLog({
      type: 'ban',
      action: `Banned user: ${user.username}`,
      user: 'Admin',
      status: 'rejected',
    });
  }
}

function unbanUser(userId) {
  if (typeof getUsers !== 'function') return;
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (user) {
    user.status = 'active';
    saveUsers(users);
    addAuditEntry('unban', userId, user.username, '');
    addActivityLog({
      type: 'unban',
      action: `Unbanned user: ${user.username}`,
      user: 'Admin',
      status: 'approved',
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

  // Load fresh data from MongoDB then render everything
  Promise.all([loadDBListings(), loadDBReports(), loadDBUsers()])
    .then(() => {
      updateAdminStats();
      renderAdminListings();
      renderAdminReports();
      renderAdminUsers();
      renderAdminAnalytics();
      renderRecentActivity();
      renderAuditLog();
    })
    .catch(err => {
      console.error('Failed to load admin data from DB:', err);
      // Fallback to local data
      updateAdminStats();
      renderAdminListings();
      renderAdminReports();
      renderAdminUsers();
      renderAdminAnalytics();
      renderRecentActivity();
      renderAuditLog();
    });

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

  // User count
  const userCount = typeof getUsers === 'function' ? getUsers().length : 0;
  if (el('stat-active-users')) el('stat-active-users').textContent = userCount || '—';
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
          <img src="${Array.isArray(car.images) && car.images.length > 0 ? car.images[0] : car.image}" alt="${car.make}" class="admin-car-thumb"
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
        <span class="status-badge ${car.status === 'pending' ? 'pending' : (car.isUserListed ? 'pending' : 'approved')}" id="badge-${car.id}">
          ${car.status === 'pending' ? 'Pending' : 'Approved'}
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
    btn.addEventListener('click', async () => {
      const carId = btn.dataset.carId;
      try {
        const data = await adminFetch(`/api/cars/${carId}/approve`, { method: 'PUT' });
        if (data.success) {
          const badge = document.getElementById(`badge-${carId}`);
          if (badge) { badge.textContent = 'Approved'; badge.className = 'status-badge approved'; }
          const row = btn.closest('tr');
          const carName = row ? (row.querySelector('.cell-primary')?.textContent?.trim() || 'Car') : 'Car';
          addActivityLog({ type: 'approval', action: `Approved: ${carName}`, user: 'Admin', status: 'approved' });
          // Also update local cache
          approveUserListing(typeof carId === 'number' ? carId : carId);
          btn.remove();
          updateAdminStats();
          renderRecentActivity();
          showToast('Listing approved. It is now visible to buyers.', 'success');
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
        await adminFetch(`/api/cars/${carId}`, { method: 'DELETE' });
        removeUserListing(carId);
        btn.closest('tr').remove();
        showToast('Listing removed.', 'info');
        updateAdminStats();
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
      const carId = btn.dataset.carId;
      removeUserListing(carId);
      updateReport(reportId, { status: 'resolved' });
      const row = btn.closest('tr');
      const badge = row.querySelector('.status-badge');
      if (badge) { badge.textContent = 'Resolved'; badge.className = 'status-badge approved'; }
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
      if (badge) { badge.textContent = 'Dismissed'; badge.className = 'status-badge rejected'; }
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
          : entry.status === 'rejected' ? 'banned'
            : 'pending';
    const statusText = statusLabel(entry.status);
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
  const map = { pending: 'Pending', resolved: 'Resolved', dismissed: 'Dismissed', approved: 'Approved', rejected: 'Rejected', banned: 'Banned', active: 'Active' };
  return map[status] || status;
}

// ============================================
// USERS TABLE — with Ban/Unban
// ============================================
function renderAdminUsers() {
  const tbody = document.getElementById('users-tbody');
  const countEl = document.getElementById('users-count');
  if (!tbody) return;

  // Get registered user accounts from auth system
  const authUsers = typeof getUsers === 'function' ? getUsers() : [];

  // Base/mock users (sellers from data.js)
  const allCars = getAllCarsForAdmin();
  const baseUsers = [
    { id: 'b1', name: 'Ahmed Mohamed', phone: '+20 100 123 4567', joined: 'Jan 10, 2024', isBase: true, sellerId: 1, status: 'active', role: 'seller' },
    { id: 'b2', name: 'Mohamed Abdelrahman', phone: '+20 112 234 5678', joined: 'Feb 5, 2024', isBase: true, sellerId: 2, status: 'active', role: 'seller' },
    { id: 'b3', name: 'Sarah Ali Hassan', phone: '+20 101 345 6789', joined: 'Mar 22, 2024', isBase: true, sellerId: 3, status: 'active', role: 'seller' },
    { id: 'b4', name: 'Khaled Ibrahim', phone: '+20 115 456 7890', joined: 'Dec 1, 2023', isBase: true, sellerId: 4, status: 'active', role: 'seller' },
    { id: 'b5', name: 'Noura Youssef', phone: '+20 106 567 8901', joined: 'Nov 15, 2023', isBase: true, sellerId: 5, status: 'active', role: 'seller' },
    { id: 'b6', name: 'Omar Farouk', phone: '+20 100 678 9012', joined: 'Oct 8, 2023', isBase: true, sellerId: 6, status: 'active', role: 'seller' },
    { id: 'b7', name: 'Reem Tarek', phone: '+20 111 789 0123', joined: 'Sep 20, 2023', isBase: true, sellerId: 7, status: 'active', role: 'seller' },
    { id: 'b8', name: 'Hesham Atef', phone: '+20 122 890 1234', joined: 'Aug 15, 2023', isBase: true, sellerId: 8, status: 'active', role: 'seller' },
  ];

  baseUsers.forEach(user => {
    user.cars = allCars.filter(c => c.sellerId === user.sellerId && !c.isUserListed);
    user.listings = user.cars.length;
  });

  // Auth system registered users
  const registeredUsers = authUsers.map(u => ({
    id: u.id,
    name: u.username,
    phone: u.phone,
    joined: u.signupDate ? new Date(u.signupDate).toLocaleDateString('en-EG', { year: 'numeric', month: 'short', day: 'numeric' }) : '—',
    isBase: false,
    isAuthUser: true,
    status: u.status || 'active',
    role: u.role || 'user',
    listings: 0,
    cars: [],
  }));

  // Real sellers from localStorage
  const userListings = getUserListings();
  const realSellers = getRegisteredSellers().map(s => {
    const sellerCars = userListings.filter(c => c.sellerId === s.id);
    // Check if already in auth users
    const existsInAuth = registeredUsers.find(u => u.phone === s.phone);
    if (existsInAuth) {
      existsInAuth.listings = sellerCars.length;
      existsInAuth.cars = sellerCars;
      return null; // Skip, already included
    }
    return {
      id: s.id,
      name: s.name,
      phone: s.phone,
      listings: sellerCars.length,
      cars: sellerCars,
      joined: s.joined || '—',
      isBase: false,
      status: 'active',
      role: 'seller',
    };
  }).filter(Boolean);

  const allUsers = [...registeredUsers, ...baseUsers, ...realSellers];
  if (countEl) countEl.textContent = `${allUsers.length} registered users`;

  if (!allUsers.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-cell">No users found.</td></tr>`;
    return;
  }

  tbody.innerHTML = allUsers.map(user => {
    const isBanned = user.status === 'banned';
    const statusBadge = isBanned
      ? '<span class="status-badge banned">Banned</span>'
      : '<span class="status-badge active">Active</span>';

    const banBtn = user.isAuthUser
      ? (isBanned
        ? `<button class="btn btn-sm btn-success unban-user-btn" data-user-id="${user.id}">Unban</button>`
        : `<button class="btn btn-sm btn-danger ban-user-btn" data-user-id="${user.id}" data-user-name="${user.name}">Ban</button>`)
      : '';

    return `
    <tr data-user-id="${user.id}">
      <td>
        <div class="admin-user-cell">
          <div class="user-avatar" style="background:${user.isBase ? 'rgba(14,165,233,.15)' : user.isAuthUser ? 'rgba(168,85,247,.15)' : 'rgba(16,185,129,.15)'};color:${user.isBase ? '#0ea5e9' : user.isAuthUser ? '#a855f7' : '#059669'};">${user.name.charAt(0).toUpperCase()}</div>
          <div>
            <div class="cell-primary">${user.name}</div>
            <div class="cell-secondary">${user.role}${user.isAuthUser ? ' (registered)' : ''}</div>
          </div>
        </div>
      </td>
      <td class="cell-secondary">${user.phone || '—'}</td>
      <td style="font-weight:700; text-align:center;">${user.listings}</td>
      <td>${user.joined}</td>
      <td>${user.role}</td>
      <td>${statusBadge}</td>
      <td>
        <div class="action-btns">
          ${banBtn}
        </div>
      </td>
    </tr>
  `;
  }).join('');

  // Ban buttons
  tbody.querySelectorAll('.ban-user-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const userId = btn.dataset.userId;
      const userName = btn.dataset.userName;
      showBanModal(userId, userName);
    });
  });

  // Unban buttons
  tbody.querySelectorAll('.unban-user-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const userId = btn.dataset.userId;
      try {
        await adminFetch(`/api/auth/users/${userId}/unban`, { method: 'PUT' });
        unbanUser(userId); // also update local cache
        await loadDBUsers();
        showToast('User has been unbanned.', 'success');
        renderAdminUsers();
        renderAuditLog();
        renderRecentActivity();
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
        <textarea id="ban-reason" class="form-control" rows="2" placeholder="Provide a reason for banning this user..." maxlength="300"></textarea>
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
      banUser(userId, reason); // also update local cache
      await loadDBUsers();
      close();
      showToast(`User "${userName}" has been banned.`, 'warning');
      renderAdminUsers();
      renderAuditLog();
      renderRecentActivity();
    } catch (err) {
      console.error('Ban error:', err);
      showToast('Network error — could not ban user.', 'error');
    }
  });
}

// ============================================
// AUDIT LOG
// ============================================
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
  if (path.endsWith('admin-login')) initAdminLoginPage();
  if (path.endsWith('admin')) initAdminDashboard();
});
