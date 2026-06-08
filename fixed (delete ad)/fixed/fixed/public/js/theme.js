'use strict';

// ============================================
// THEME TOGGLE (Dark / Light)
// ============================================
const THEME_CONFIG = {
  dark: 'dark',
  light: 'light',
  storageKey: 'at_theme',
};

function getThemePreference() {
  // 1. Check localStorage
  const stored = localStorage.getItem(THEME_CONFIG.storageKey);
  if (stored) return stored;

  // 2. Check user profile
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (user && user.themePreference) return user.themePreference;

  // 3. Default to dark
  return THEME_CONFIG.dark;
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_CONFIG.storageKey, theme);

  // Update user profile if logged in
  if (typeof getCurrentUser === 'function') {
    const user = getCurrentUser();
    if (user) {
      user.themePreference = theme;
      sessionStorage.setItem('at_current_user', JSON.stringify(user));

      // Also update in users store
      if (typeof getUsers === 'function') {
        const users = getUsers();
        const idx = users.findIndex(u => u.id === user.id);
        if (idx > -1) {
          users[idx].themePreference = theme;
          saveUsers(users);
        }
      }
    }
  }

  // Update toggle icon
  updateThemeToggleIcon(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || THEME_CONFIG.dark;
  const next = current === THEME_CONFIG.dark ? THEME_CONFIG.light : THEME_CONFIG.dark;
  setTheme(next);
}

function updateThemeToggleIcon(theme) {
  const btn = document.getElementById('theme-toggle-btn');
  if (!btn) return;

  if (theme === THEME_CONFIG.light) {
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    btn.setAttribute('title', 'Switch to dark mode');
    btn.setAttribute('aria-label', 'Switch to dark mode');
  } else {
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
    btn.setAttribute('title', 'Switch to light mode');
    btn.setAttribute('aria-label', 'Switch to light mode');
  }
}

function injectThemeToggle() {
  // Add theme toggle button to nav
  const navContainer = document.querySelector('.nav-container');
  if (!navContainer || document.getElementById('theme-toggle-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'theme-toggle-btn';
  btn.className = 'theme-toggle-btn';
  btn.setAttribute('aria-label', 'Toggle theme');
  btn.setAttribute('role', 'switch');

  // Insert before admin button or at end
  const adminBtn = navContainer.querySelector('.admin-access-btn');
  if (adminBtn) {
    navContainer.insertBefore(btn, adminBtn);
  } else {
    navContainer.appendChild(btn);
  }

  btn.addEventListener('click', toggleTheme);

  // Set initial icon
  const currentTheme = document.documentElement.getAttribute('data-theme') || THEME_CONFIG.dark;
  updateThemeToggleIcon(currentTheme);
}

function initTheme() {
  const theme = getThemePreference();
  document.documentElement.setAttribute('data-theme', theme);
  // injectThemeToggle();  // Disabled: Theme toggle moved to Settings sidebar
}
