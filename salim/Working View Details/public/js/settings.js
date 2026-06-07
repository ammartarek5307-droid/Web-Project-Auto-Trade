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
        ? `<button class="btn btn-danger w-full" id="settings-logout-btn" data-i18n="settings.btn.logout">Logout</button>`
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
