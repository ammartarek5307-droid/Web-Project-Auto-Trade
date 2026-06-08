'use strict';

// ============================================
// SETTINGS SIDEBAR
// ============================================
function injectSettingsSidebar() {
  if (document.getElementById('settings-sidebar')) return;

  const sidebar = document.createElement('div');
  sidebar.id = 'settings-sidebar';
  sidebar.className = 'settings-sidebar';
  
  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'settings-overlay';
  overlay.className = 'settings-overlay';
  
  // Current user info
  let user = null;
  if (typeof getCurrentUser === 'function') user = getCurrentUser();
  const isGuest = typeof isGuestMode === 'function' && isGuestMode();
  const themePref = typeof getThemePreference === 'function' ? getThemePreference() : 'dark';
  
  const userNameDisplay = user ? user.username : (isGuest ? 'Guest' : 'Not Logged In');
  const userAvatar = user ? user.username.charAt(0).toUpperCase() : (isGuest ? 'G' : '?');
  
  sidebar.innerHTML = `
    <div class="settings-header">
      <h3 data-i18n="settings.title">Settings</h3>
      <button class="settings-close" id="settings-close" aria-label="Close settings">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    
    <div class="settings-body">
      <!-- Account Info -->
      <div class="settings-account">
        <div class="settings-avatar">${userAvatar}</div>
        <div class="settings-user-info">
          <div class="settings-username" data-i18n="settings.account">${userNameDisplay}</div>
          <div class="settings-role">${user ? (user.role || 'User') : (isGuest ? 'Guest Access' : '')}</div>
        </div>
      </div>
      
      <hr class="settings-divider">
      
      <!-- Theme Toggle -->
      <div class="settings-row">
        <span class="settings-label" data-i18n="settings.theme">Dark Mode</span>
        <label class="theme-switch">
          <input type="checkbox" id="settings-theme-toggle" ${themePref === 'dark' ? 'checked' : ''}>
          <span class="theme-slider"></span>
        </label>
      </div>
      
      <!-- Language Toggle -->
      <div class="settings-row">
        <span class="settings-label" data-i18n="settings.lang">اللغة العربية</span>
        <button class="btn btn-sm btn-outline" id="settings-lang-btn">عربي / EN</button>
      </div>
      
      <hr class="settings-divider">
      
      <!-- Action Button -->
      ${user 
        ? `<button class="btn btn-outline w-full mb-2" id="settings-edit-profile-btn" data-i18n="settings.btn.editProfile">Edit Profile</button>
           <button class="btn btn-danger w-full" id="settings-logout-btn" data-i18n="settings.btn.logout">Logout</button>`
        : `<button class="btn btn-primary w-full" id="settings-login-btn" data-i18n="settings.btn.login">Log In</button>`
      }
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(sidebar);

  // Bind Events
  document.getElementById('settings-close').addEventListener('click', closeSettings);
  overlay.addEventListener('click', closeSettings);
  
  document.getElementById('settings-theme-toggle').addEventListener('change', (e) => {
    if (typeof setTheme === 'function') {
      setTheme(e.target.checked ? 'dark' : 'light');
    }
  });
  
  document.getElementById('settings-lang-btn').addEventListener('click', () => {
    if (typeof toggleLanguage === 'function') toggleLanguage();
  });
  
  const logoutBtn = document.getElementById('settings-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (typeof logoutUser === 'function') logoutUser();
      closeSettings();
      if (typeof showToast === 'function') showToast('You have been logged out.', 'info');
      if (typeof showAuthGate === 'function') showAuthGate();
      if (typeof updateNavForAuth === 'function') updateNavForAuth();
      // Re-render settings to show login button next time
      setTimeout(() => { sidebar.remove(); overlay.remove(); injectSettingsSidebar(); }, 400);
    });
  }
  
  const editProfileBtn = document.getElementById('settings-edit-profile-btn');
  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
      closeSettings();
      openEditProfileModal();
    });
  }

  const loginBtn = document.getElementById('settings-login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      closeSettings();
      if (typeof showAuthGate === 'function') showAuthGate();
    });
  }
}

function openSettings() {
  const sidebar = document.getElementById('settings-sidebar');
  const overlay = document.getElementById('settings-overlay');
  
  if (!sidebar) {
    injectSettingsSidebar();
    requestAnimationFrame(() => {
      document.getElementById('settings-sidebar').classList.add('open');
      document.getElementById('settings-overlay').classList.add('show');
    });
  } else {
    sidebar.classList.add('open');
    overlay.classList.add('show');
  }
  document.body.style.overflow = 'hidden';
}

function closeSettings() {
  const sidebar = document.getElementById('settings-sidebar');
  const overlay = document.getElementById('settings-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('show');
  document.body.style.overflow = '';
}

// Global init to inject settings button into nav
function injectSettingsButton() {
  const navLinks = document.getElementById('nav-links');
  if (!navLinks) return;
  
  // Check if exists
  if (document.getElementById('nav-settings-btn')) return;
  
  const settingsBtn = document.createElement('button');
  settingsBtn.className = 'nav-auth-item nav-settings-btn';
  settingsBtn.id = 'nav-settings-btn';
  settingsBtn.innerHTML = '⚙ <span data-i18n="nav.settings">Settings</span>';
  settingsBtn.addEventListener('click', openSettings);
  
  navLinks.appendChild(settingsBtn);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSettings();
});

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    injectSettingsButton();
  }, 150); // After auth nav update
});

// ============================================
// EDIT PROFILE MODAL
// ============================================
function openEditProfileModal() {
  if (document.getElementById('edit-profile-modal')) return;

  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (!user) return;

  const modal = document.createElement('div');
  modal.id = 'edit-profile-modal';
  modal.className = 'auth-gate open'; // Using existing auth modal styles
  modal.innerHTML = `
    <div class="auth-gate-inner">
      <div class="auth-gate-card">
        <h2 class="auth-gate-title">Edit Profile</h2>
        <p class="auth-gate-subtitle">Update your account details</p>
        
        <form id="edit-profile-form" class="auth-form" novalidate>
          <div class="auth-field">
            <label for="edit-profile-username">Username</label>
            <input type="text" id="edit-profile-username" class="form-control" value="${user.username}" required>
            <span class="form-error" id="err-edit-profile-username"></span>
          </div>
          
          <div class="auth-field">
            <label for="edit-profile-phone">Phone Number</label>
            <input type="tel" id="edit-profile-phone" class="form-control" value="${user.phone}" required>
            <span class="form-error" id="err-edit-profile-phone"></span>
          </div>
          
          <div class="auth-field">
            <label for="edit-profile-password">New Password (Optional)</label>
            <div class="password-wrapper">
              <input type="password" id="edit-profile-password" class="form-control" placeholder="Leave blank to keep current">
              <button type="button" class="show-pass-btn auth-show-pass" data-target="edit-profile-password">Show</button>
            </div>
            <span class="form-error" id="err-edit-profile-password"></span>
          </div>
          
          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button type="button" class="btn btn-outline w-full" id="edit-profile-cancel">Cancel</button>
            <button type="submit" class="btn btn-primary w-full" id="edit-profile-save">Save</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  // Toggle show/hide password
  modal.querySelector('.auth-show-pass').addEventListener('click', function() {
    const target = document.getElementById(this.dataset.target);
    if (target) {
      const isPass = target.type === 'password';
      target.type = isPass ? 'text' : 'password';
      this.textContent = isPass ? 'Hide' : 'Show';
    }
  });

  const closeModal = () => {
    modal.classList.remove('open');
    setTimeout(() => {
      modal.remove();
      document.body.style.overflow = '';
      openSettings(); // Re-open settings sidebar
    }, 350);
  };

  document.getElementById('edit-profile-cancel').addEventListener('click', closeModal);

  document.getElementById('edit-profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Clear errors
    document.querySelectorAll('#edit-profile-modal .form-error').forEach(el => el.textContent = '');
    document.querySelectorAll('#edit-profile-modal .field-error').forEach(el => el.classList.remove('field-error'));

    const usernameInput = document.getElementById('edit-profile-username').value.trim();
    const phoneInput = document.getElementById('edit-profile-phone').value.trim();
    const passwordInput = document.getElementById('edit-profile-password').value;

    let valid = true;

    if (typeof validateUsername === 'function') {
      const usernameErr = validateUsername(usernameInput);
      if (usernameErr) {
        document.getElementById('edit-profile-username').classList.add('field-error');
        document.getElementById('err-edit-profile-username').textContent = usernameErr;
        valid = false;
      }
    }

    if (!phoneInput) {
      document.getElementById('edit-profile-phone').classList.add('field-error');
      document.getElementById('err-edit-profile-phone').textContent = 'Please enter your phone number.';
      valid = false;
    } else if (typeof validatePhoneInternational === 'function' && !validatePhoneInternational(phoneInput)) {
      document.getElementById('edit-profile-phone').classList.add('field-error');
      document.getElementById('err-edit-profile-phone').textContent = 'Please enter a valid phone number.';
      valid = false;
    }

    if (passwordInput && typeof validatePassword === 'function') {
      const passErr = validatePassword(passwordInput);
      if (passErr) {
        document.getElementById('edit-profile-password').classList.add('field-error');
        document.getElementById('err-edit-profile-password').textContent = passErr;
        valid = false;
      }
    }

    if (!valid) return;

    const saveBtn = document.getElementById('edit-profile-save');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    try {
      const updateData = {};
      if (usernameInput !== user.username) updateData.username = usernameInput;
      if (phoneInput !== user.phone) updateData.phone = phoneInput;
      
      if (passwordInput) {
        if (typeof hashPassword === 'function') {
          updateData.passwordHash = await hashPassword(passwordInput);
        } else {
          // Fallback if hashPassword somehow isn't available, though it should be in auth.js
          console.error("hashPassword function not found");
        }
      }

      if (Object.keys(updateData).length === 0) {
        closeModal();
        if (typeof showToast === 'function') showToast('No changes made.', 'info');
        return;
      }

      const token = localStorage.getItem('at_jwt');
      const API_BASE = window.location.origin;
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await res.json();

      if (data.success) {
        if (typeof setCurrentUser === 'function') setCurrentUser(data.user);
        if (typeof _syncUserToLocalCache === 'function') _syncUserToLocalCache(data.user);
        
        if (typeof showToast === 'function') showToast('Profile updated successfully!', 'success');
        
        // Remove old sidebar to force re-render with new data
        const oldSidebar = document.getElementById('settings-sidebar');
        const oldOverlay = document.getElementById('settings-overlay');
        if (oldSidebar) oldSidebar.remove();
        if (oldOverlay) oldOverlay.remove();
        
        closeModal();
      } else {
        if (typeof showToast === 'function') showToast(data.error || 'Failed to update profile.', 'error');
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save';
      }
    } catch (err) {
      console.error('Profile update error:', err);
      if (typeof showToast === 'function') showToast('A network error occurred.', 'error');
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save';
    }
  });
}

