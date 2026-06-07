'use strict';

// ============================================
// AUTH CONFIGURATION
// ============================================
const AUTH_CONFIG = {
  minPasswordLength: 8,
  maxLoginAttempts: 5,
  lockoutDuration: 300000, // 5 minutes in ms
  passwordRules: 'Minimum 8 characters, at least one uppercase letter, one number, and one special character.',
};

// ============================================
// API BASE URL
// ============================================
const API_BASE = window.location.origin;

// ============================================
// PASSWORD HASHING (SHA-256 via SubtleCrypto)
// ============================================
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_autotrade_salt_2026');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================
// USER ACCOUNTS STORE — MongoDB API
// ============================================

/** Get stored users from localStorage (kept for admin.js compatibility) */
function getUsers() {
  try { return JSON.parse(localStorage.getItem('at_users')) || []; }
  catch { return []; }
}

function saveUsers(users) {
  localStorage.setItem('at_users', JSON.stringify(users));
}

function findUserByUsername(username) {
  return getUsers().find(u => u.username.toLowerCase() === username.toLowerCase());
}

/** Register user via MongoDB API */
async function createUser(username, password, phone) {
  try {
    const passwordHash = await hashPassword(password);
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, passwordHash, phone }),
    });
    const data = await res.json();
    if (data.success) {
      // Save token for future requests
      localStorage.setItem('at_jwt', data.token);
      // Sync user into local cache
      _syncUserToLocalCache(data.user);
      if (typeof addActivityLog === 'function') {
        addActivityLog({ type: 'signup', action: `New User: ${username}`, user: username, status: 'approved' });
      }
    }
    return data;
  } catch (err) {
    console.error('Register API error:', err);
    return { success: false, error: 'Could not connect to the server. Please try again.' };
  }
}

/** Authenticate user via MongoDB API */
async function authenticateUser(username, password) {
  try {
    const passwordHash = await hashPassword(password);
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, passwordHash }),
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('at_jwt', data.token);
      _syncUserToLocalCache(data.user);
    }
    return data;
  } catch (err) {
    console.error('Login API error:', err);
    return { success: false, error: 'Could not connect to the server. Please try again.' };
  }
}

/** Sync server user into local cache so admin.js can still read getUsers() */
function _syncUserToLocalCache(serverUser) {
  const users = getUsers();
  const existing = users.findIndex(u => u.id === serverUser.id);
  const mapped = {
    id: serverUser.id,
    username: serverUser.username,
    phone: serverUser.phone,
    role: serverUser.role || 'user',
    status: serverUser.status || 'active',
    themePreference: serverUser.themePreference || 'dark',
    signupDate: serverUser.signupDate || serverUser.createdAt || new Date().toISOString(),
    lastLogin: serverUser.lastLogin || null,
    loginAttempts: 0,
    lockedUntil: null,
    passwordHash: '__server__',
  };
  if (existing >= 0) users[existing] = mapped;
  else users.push(mapped);
  saveUsers(users);
}

/** Get JWT token for authenticated API calls */
function getAuthToken() {
  return localStorage.getItem('at_jwt') || null;
}

// ============================================
// SESSION MANAGEMENT
// ============================================
function setCurrentUser(user) {
  sessionStorage.setItem('at_current_user', JSON.stringify({
    id: user.id,
    username: user.username,
    phone: user.phone,
    role: user.role,
    status: user.status,
    themePreference: user.themePreference || 'dark',
  }));
}

function getCurrentUser() {
  try {
    return JSON.parse(sessionStorage.getItem('at_current_user'));
  } catch {
    return null;
  }
}

function isLoggedIn() {
  const user = getCurrentUser();
  if (!user) return false;
  // Double-check ban status from source
  const freshUser = findUserByUsername(user.username);
  if (freshUser && freshUser.status === 'banned') {
    logoutUser();
    return false;
  }
  return true;
}

function logoutUser() {
  sessionStorage.removeItem('at_current_user');
  localStorage.removeItem('at_jwt');
}

function requireAuth() {
  if (!isLoggedIn()) {
    showAuthGate();
    return false;
  }
  return true;
}

// ============================================
// GUEST MODE
// ============================================
function enterGuestMode() {
  sessionStorage.setItem('at_guest', 'true');
  hideAuthGate();
  updateNavForAuth();
  if (typeof injectSettingsButton === 'function') injectSettingsButton();
}

function isGuestMode() {
  return sessionStorage.getItem('at_guest') === 'true' && !isLoggedIn();
}

function requireAuthOrGuest() {
  if (isLoggedIn()) return true;
  if (isGuestMode()) {
    if (typeof showToast === 'function') showToast(t('general.guest_toast') || 'You must log in to perform this action.', 'warning');
    return false;
  }
  showAuthGate();
  return false;
}

// ============================================
// VALIDATION HELPERS
// ============================================
function validatePassword(password) {
  if (password.length < AUTH_CONFIG.minPasswordLength) {
    return `Password must be at least ${AUTH_CONFIG.minPasswordLength} characters.`;
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number.';
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'Password must contain at least one special character.';
  }
  return null;
}

function validatePhoneInternational(phone) {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  // Accept Egyptian or international format
  const egyptianPattern = /^(\+20|0020|0)?(10|11|12|15)\d{8}$/;
  const internationalPattern = /^\+?\d{8,15}$/;
  return egyptianPattern.test(cleaned) || internationalPattern.test(cleaned);
}

function validateUsername(username) {
  if (username.length < 3) return 'Username must be at least 3 characters.';
  if (username.length > 20) return 'Username must be 20 characters or less.';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores.';
  return null;
}

// ============================================
// AUTH GATE UI
// ============================================
function showAuthGate() {
  if (document.getElementById('auth-gate')) return;

  const gate = document.createElement('div');
  gate.id = 'auth-gate';
  gate.className = 'auth-gate';
  gate.innerHTML = `
    <div class="auth-gate-inner">
      <div class="auth-gate-card">
        <div class="auth-gate-logo">Auto<span>Trade</span></div>
        <h2 class="auth-gate-title" id="auth-gate-title">Welcome Back</h2>
        <p class="auth-gate-subtitle" id="auth-gate-subtitle">Sign in to access the marketplace</p>

        <!-- Error Alert -->
        <div class="auth-alert" id="auth-alert" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <span id="auth-alert-text"></span>
        </div>

        <!-- LOGIN FORM -->
        <form id="auth-login-form" class="auth-form" novalidate>
          <div class="auth-field">
            <label for="auth-login-username">Username</label>
            <input type="text" id="auth-login-username" class="form-control" placeholder="Enter your username" autocomplete="username" required>
            <span class="form-error" id="err-auth-login-username"></span>
          </div>
          <div class="auth-field">
            <label for="auth-login-password">Password</label>
            <div class="password-wrapper">
              <input type="password" id="auth-login-password" class="form-control" placeholder="Enter your password" autocomplete="current-password" required>
              <button type="button" class="show-pass-btn auth-show-pass" data-target="auth-login-password">Show</button>
            </div>
            <span class="form-error" id="err-auth-login-password"></span>
          </div>
          <button type="submit" class="btn btn-primary btn-lg w-full auth-submit-btn" id="auth-login-btn">
            Log In
          </button>
        </form>

        <!-- SIGNUP FORM (hidden by default) -->
        <form id="auth-signup-form" class="auth-form" style="display:none;" novalidate>
          <div class="auth-field">
            <label for="auth-signup-username">Username</label>
            <input type="text" id="auth-signup-username" class="form-control" placeholder="Choose a username" autocomplete="username" required>
            <span class="form-error" id="err-auth-signup-username"></span>
          </div>
          <div class="auth-field">
            <label for="auth-signup-phone">Phone Number</label>
            <input type="tel" id="auth-signup-phone" class="form-control" placeholder="e.g. +20 101 234 5678" autocomplete="tel" required>
            <span class="form-error" id="err-auth-signup-phone"></span>
          </div>
          <div class="auth-field">
            <label for="auth-signup-password">Password</label>
            <div class="password-wrapper">
              <input type="password" id="auth-signup-password" class="form-control" placeholder="Create a strong password" autocomplete="new-password" required>
              <button type="button" class="show-pass-btn auth-show-pass" data-target="auth-signup-password">Show</button>
            </div>
            <span class="form-error" id="err-auth-signup-password"></span>
            <span class="field-hint">${AUTH_CONFIG.passwordRules}</span>
          </div>
          <div class="auth-field">
            <label for="auth-signup-confirm">Confirm Password</label>
            <div class="password-wrapper">
              <input type="password" id="auth-signup-confirm" class="form-control" placeholder="Confirm your password" autocomplete="new-password" required>
              <button type="button" class="show-pass-btn auth-show-pass" data-target="auth-signup-confirm">Show</button>
            </div>
            <span class="form-error" id="err-auth-signup-confirm"></span>
          </div>
          <button type="submit" class="btn btn-primary btn-lg w-full auth-submit-btn" id="auth-signup-btn">
            Create Account
          </button>
        </form>

        <div class="auth-switch">
          <span id="auth-switch-text" data-i18n="auth.switch.signup">Don't have an account?</span>
          <button type="button" class="auth-switch-btn" id="auth-switch-btn" data-i18n="auth.btn.signup">Sign Up</button>
        </div>
        <div style="text-align:center; margin-top:1rem;">
          <button type="button" class="btn btn-sm btn-outline" id="auth-guest-btn" data-i18n="auth.btn.guest">Continue as Guest</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(gate);
  document.body.style.overflow = 'hidden';

  // Bind events
  bindAuthGateEvents();

  // Animate in
  requestAnimationFrame(() => {
    gate.classList.add('open');
  });
}

function hideAuthGate() {
  const gate = document.getElementById('auth-gate');
  if (gate) {
    gate.classList.remove('open');
    setTimeout(() => {
      gate.remove();
      document.body.style.overflow = '';
    }, 350);
  }
}

function bindAuthGateEvents() {
  const loginForm = document.getElementById('auth-login-form');
  const signupForm = document.getElementById('auth-signup-form');
  const switchBtn = document.getElementById('auth-switch-btn');
  const switchText = document.getElementById('auth-switch-text');
  const title = document.getElementById('auth-gate-title');
  const subtitle = document.getElementById('auth-gate-subtitle');
  const alert = document.getElementById('auth-alert');

  let isLoginMode = true;

  // Toggle show/hide password
  document.querySelectorAll('.auth-show-pass').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (target) {
        const isPass = target.type === 'password';
        target.type = isPass ? 'text' : 'password';
        btn.textContent = isPass ? 'Hide' : 'Show';
      }
    });
  });

  function clearAuthErrors() {
    document.querySelectorAll('#auth-gate .form-error').forEach(e => e.textContent = '');
    document.querySelectorAll('#auth-gate .field-error').forEach(e => e.classList.remove('field-error'));
    if (alert) { alert.classList.remove('show'); }
  }

  function showAuthError(msg) {
    const alertText = document.getElementById('auth-alert-text');
    if (alertText) alertText.textContent = msg;
    if (alert) alert.classList.add('show');
  }

  function setFieldError(id, msg) {
    const input = document.getElementById(id);
    const err = document.getElementById('err-' + id);
    if (input) input.classList.add('field-error');
    if (err) err.textContent = msg;
  }

  // Guest Mode
  const guestBtn = document.getElementById('auth-guest-btn');
  if (guestBtn) {
    guestBtn.addEventListener('click', enterGuestMode);
  }

  // Switch mode
  switchBtn.addEventListener('click', () => {
    clearAuthErrors();
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
      loginForm.style.display = '';
      signupForm.style.display = 'none';
      title.textContent = t ? t('auth.title.login') : 'Welcome Back';
      subtitle.textContent = t ? t('auth.subtitle.login') : 'Sign in to access the marketplace';
      switchText.textContent = t ? t('auth.switch.signup') : "Don't have an account?";
      switchBtn.textContent = t ? t('auth.btn.signup') : 'Sign Up';
    } else {
      loginForm.style.display = 'none';
      signupForm.style.display = '';
      title.textContent = t ? t('auth.title.signup') : 'Create Account';
      subtitle.textContent = t ? t('auth.subtitle.signup') : 'Join AutoTrade today';
      switchText.textContent = t ? t('auth.switch.login') : 'Already have an account?';
      switchBtn.textContent = t ? t('auth.btn.login') : 'Log In';
    }
  });

  // Login submit
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAuthErrors();

    const username = document.getElementById('auth-login-username').value.trim();
    const password = document.getElementById('auth-login-password').value;

    if (!username) { setFieldError('auth-login-username', 'Please enter your username.'); return; }
    if (!password) { setFieldError('auth-login-password', 'Please enter your password.'); return; }

    const btn = document.getElementById('auth-login-btn');
    btn.disabled = true;
    btn.textContent = 'Signing in...';

    const result = await authenticateUser(username, password);

    if (result.success) {
      setCurrentUser(result.user);
      
      // Handle Admin routing
      if (result.user.role === 'admin') {
        if (typeof showToast === 'function') showToast('Welcome Admin!', 'success');
        setTimeout(() => { window.location.href = '/admin'; }, 600);
        return;
      }
      
      if (typeof showToast === 'function') showToast(`Welcome back, ${result.user.username}!`, 'success');

      // Apply theme
      if (result.user.themePreference) {
        document.documentElement.setAttribute('data-theme', result.user.themePreference);
        localStorage.setItem('at_theme', result.user.themePreference);
      }

      hideAuthGate();
      updateNavForAuth();
      if (typeof injectSettingsButton === 'function') injectSettingsButton();
    } else {
      showAuthError(result.error);
      btn.disabled = false;
      btn.textContent = 'Log In';
    }
  });

  // Signup submit
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAuthErrors();

    const username = document.getElementById('auth-signup-username').value.trim();
    const phone = document.getElementById('auth-signup-phone').value.trim();
    const password = document.getElementById('auth-signup-password').value;
    const confirm = document.getElementById('auth-signup-confirm').value;

    let valid = true;

    // Username
    const usernameErr = validateUsername(username);
    if (usernameErr) { setFieldError('auth-signup-username', usernameErr); valid = false; }

    // Phone
    if (!phone) { setFieldError('auth-signup-phone', 'Please enter your phone number.'); valid = false; }
    else if (!validatePhoneInternational(phone)) { setFieldError('auth-signup-phone', 'Please enter a valid phone number.'); valid = false; }

    // Password
    const passErr = validatePassword(password);
    if (passErr) { setFieldError('auth-signup-password', passErr); valid = false; }

    // Confirm
    if (password !== confirm) { setFieldError('auth-signup-confirm', 'Passwords do not match.'); valid = false; }

    if (!valid) return;

    const btn = document.getElementById('auth-signup-btn');
    btn.disabled = true;
    btn.textContent = 'Creating account...';

    const result = await createUser(username, password, phone);

    if (result.success) {
      setCurrentUser(result.user);
      if (typeof showToast === 'function') showToast(`Welcome to AutoTrade, ${result.user.username}!`, 'success');
      hideAuthGate();
      updateNavForAuth();
    } else {
      showAuthError(result.error);
      btn.disabled = false;
      btn.textContent = 'Create Account';
    }
  });

  // Clear errors on input
  document.querySelectorAll('#auth-gate input').forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('field-error');
      const err = document.getElementById('err-' + input.id);
      if (err) err.textContent = '';
      if (alert) alert.classList.remove('show');
    });
  });
}

// ============================================
// NAV AUTH STATE
// ============================================
function updateNavForAuth() {
  const navLinks = document.getElementById('nav-links');
  if (!navLinks) return;

  // We no longer add the user menu/logout here; it's handled by settings sidebar.
  // We just need to add the Inbox if logged in.
  const oldInbox = document.getElementById('nav-inbox');
  if (oldInbox) oldInbox.remove();

  const user = getCurrentUser();

  if (user) {
    // Add Inbox link
    const inboxLink = document.createElement('a');
    inboxLink.href = '/messaging';
    inboxLink.className = 'nav-auth-item';
    inboxLink.id = 'nav-inbox';
    inboxLink.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> <span data-i18n="nav.inbox">Inbox</span>';

    // Count unread
    const unread = getUnreadCount(user.id);
    if (unread > 0) {
      inboxLink.innerHTML += ` <span class="nav-badge">${unread}</span>`;
    }

    // Insert before settings if settings is there
    const settingsBtn = document.getElementById('nav-settings-btn');
    if (settingsBtn) {
      navLinks.insertBefore(inboxLink, settingsBtn);
    } else {
      navLinks.appendChild(inboxLink);
    }
  }
}

function getUnreadCount(userId) {
  try {
    const messages = JSON.parse(localStorage.getItem('at_messages')) || [];
    return messages.filter(m => m.recipientId === userId && !m.readAt).length;
  } catch { return 0; }
}

// ============================================
// INIT AUTH CHECK
// ============================================
function initAuthGate() {
  // Skip auth gate on admin pages
  const path = window.location.pathname;
  if (path.endsWith('admin-login') || path.endsWith('admin')) return;

  if (!isLoggedIn() && !isGuestMode()) {
    showAuthGate();
  } else {
    updateNavForAuth();
  }
}
