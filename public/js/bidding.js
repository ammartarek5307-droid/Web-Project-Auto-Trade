'use strict';

// ============================================
// BIDDING SYSTEM — Server-backed (MongoDB)
// ============================================
const BID_CONFIG = {
  minIncrement: 5000, // EGP
  pollInterval: 5000, // Poll every 5 seconds
};

// ── Client-side cache for bids (populated from server) ──
let _bidCache = {}; // { [carId]: { bids: [], price: 0 } }
let _bidPollTimer = null;

// ── Get highest bid for a listing (used by main.js car cards) ──
function getHighestBid(listingId) {
  const cached = _bidCache[String(listingId)];
  if (cached && cached.bids && cached.bids.length > 0) {
    return cached.bids[0]; // Already sorted desc by server
  }
  return null;
}

// ── Get bids for a listing from cache ──
function getListingBids(listingId) {
  const cached = _bidCache[String(listingId)];
  if (cached && cached.bids) {
    return cached.bids;
  }
  return [];
}

// ── Fetch bids from server ──
async function fetchBidsFromServer(carId) {
  try {
    const res = await fetch(`/api/cars/${carId}/bids`);
    const data = await res.json();
    if (data.success) {
      _bidCache[String(carId)] = { bids: data.bids, price: data.price };
      return data;
    }
  } catch (err) {
    console.error('Failed to fetch bids:', err);
  }
  return null;
}

// ── Place a bid via server ──
async function placeBid(car, bidderId, bidderName, amount) {
  if (!car) {
    return { success: false, error: 'Listing not found.' };
  }

  const token = typeof getAuthToken === 'function' ? getAuthToken() : localStorage.getItem('at_jwt');
  if (!token) {
    return { success: false, error: 'You must be logged in to place a bid.' };
  }

  if (isNaN(amount) || amount <= 0) {
    return { success: false, error: 'Please enter a valid bid amount.' };
  }

  try {
    const res = await fetch(`/api/cars/${car.id}/bid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ amount }),
    });

    const data = await res.json();

    if (data.success) {
      // Refresh cache immediately after placing bid
      await fetchBidsFromServer(car.id);
      return { success: true, bid: data.bid };
    } else {
      return { success: false, error: data.error || 'Failed to place bid.' };
    }
  } catch (err) {
    console.error('Place bid error:', err);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

// ── Bid notifications (kept as localStorage queue for local toasts) ──
function addBidNotification(userId, message) {
  try {
    const notifs = JSON.parse(localStorage.getItem('at_bid_notifs')) || [];
    notifs.push({
      id: 'NOTIF-' + Date.now(),
      userId,
      message,
      createdAt: new Date().toISOString(),
      read: false,
    });
    localStorage.setItem('at_bid_notifs', JSON.stringify(notifs));
  } catch {}
}

// ── Update bid UI from cache ──
function updateBidUI(carId) {
  const cached = _bidCache[String(carId)];
  if (!cached) return;

  const allBids = cached.bids || [];
  const highestBid = allBids.length > 0 ? allBids[0] : null;
  const carPrice = cached.price || 0;
  const minBid = highestBid ? highestBid.amount + BID_CONFIG.minIncrement : carPrice;

  // Update highest bid display
  const highestDisplay = document.getElementById('bid-highest-display');
  if (highestDisplay) {
    highestDisplay.textContent = highestBid ? formatEGP(highestBid.amount) : (typeof t === 'function' ? t('bid.no_bids') : 'No bids yet');
  }

  // Update count display
  const countDisplay = document.getElementById('bid-count-display');
  if (countDisplay) {
    countDisplay.textContent = allBids.length;
  }

  // Update bid history list
  const historyList = document.getElementById('bid-history-list');
  if (historyList) {
    if (allBids.length > 0) {
      historyList.innerHTML = allBids.slice(0, 10).map((b, i) => `
        <div class="bid-history-item ${i === 0 ? 'highest' : ''}">
          <div class="bid-history-user">
            <span class="bid-history-avatar">${b.bidderName.charAt(0).toUpperCase()}</span>
            <span class="bid-history-name">${b.bidderName}${i === 0 ? ` <span class="bid-crown">${typeof t === 'function' ? t('bid.highest') : 'Highest'}</span>` : ''}</span>
          </div>
          <div class="bid-history-amount">${formatEGP(b.amount)}</div>
          <div class="bid-history-time">${formatBidTime(b.createdAt)}</div>
        </div>
      `).join('');
    }
  } else if (allBids.length > 0) {
    // Create history section if it doesn't exist but we have bids
    const section = document.querySelector('.bidding-section');
    if (section && !section.querySelector('.bid-history')) {
      const historyHtml = `
        <div class="bid-history">
          <h4 class="bid-history-title" data-i18n="bid.history">${typeof t === 'function' ? t('bid.history') : 'Bid History'}</h4>
          <div class="bid-history-list" id="bid-history-list">
            ${allBids.slice(0, 10).map((b, i) => `
              <div class="bid-history-item ${i === 0 ? 'highest' : ''}">
                <div class="bid-history-user">
                  <span class="bid-history-avatar">${b.bidderName.charAt(0).toUpperCase()}</span>
                  <span class="bid-history-name">${b.bidderName}${i === 0 ? ` <span class="bid-crown">${typeof t === 'function' ? t('bid.highest') : 'Highest'}</span>` : ''}</span>
                </div>
                <div class="bid-history-amount">${formatEGP(b.amount)}</div>
                <div class="bid-history-time">${formatBidTime(b.createdAt)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      section.insertAdjacentHTML('beforeend', historyHtml);
    }
  }

  // Update min bid hint and input
  const amountInput = document.getElementById('bid-amount');
  const form = document.getElementById('bid-form');
  if (amountInput) {
    amountInput.min = minBid;
    amountInput.placeholder = minBid.toLocaleString('en-US');
  }
  if (form) {
    const hint = form.querySelector('.field-hint');
    if (hint) hint.textContent = `${typeof t === 'function' ? t('bid.min_bid') : 'Minimum bid:'} ${formatEGP(minBid)} (${formatEGP(BID_CONFIG.minIncrement)} ${typeof t === 'function' ? t('bid.increment') : 'increment'})`;
  }
  if (typeof applyTranslations === 'function') applyTranslations();
}

// ── Start polling for live bid updates ──
function startBidPolling(carId) {
  stopBidPolling();
  _bidPollTimer = setInterval(async () => {
    await fetchBidsFromServer(carId);
    updateBidUI(carId);
  }, BID_CONFIG.pollInterval);
}

function stopBidPolling() {
  if (_bidPollTimer) {
    clearInterval(_bidPollTimer);
    _bidPollTimer = null;
  }
}

// Stop polling when user leaves the page
window.addEventListener('beforeunload', stopBidPolling);

// ── Render bidding section on car details ──
async function renderBiddingSection(car, container) {
  if (!car || !container) return;

  // Fetch bids from server first
  await fetchBidsFromServer(car.id);

  const currentUser = getCurrentUser();
  const allBids = getListingBids(car.id);
  const highestBid = allBids.length > 0 ? allBids[0] : null;
  const carPrice = typeof car.price === 'number' ? car.price : parseInt(String(car.price).replace(/[^0-9]/g, ''));
  const minBid = highestBid ? highestBid.amount + BID_CONFIG.minIncrement : carPrice;

  const biddingHtml = `
    <div class="details-section bidding-section">
      <h3 class="details-section-title" data-i18n="bid.place_title">Place a Bid</h3>

      <div class="bid-stats">
        <div class="bid-stat">
          <span class="bid-stat-label" data-i18n="bid.asking_price">Asking Price</span>
          <span class="bid-stat-value">${formatEGP(carPrice)}</span>
        </div>
        <div class="bid-stat highlight">
          <span class="bid-stat-label" data-i18n="bid.highest_bid">Highest Bid</span>
          <span class="bid-stat-value" id="bid-highest-display">${highestBid ? formatEGP(highestBid.amount) : (typeof t === 'function' ? t('bid.no_bids') : 'No bids yet')}</span>
        </div>
        <div class="bid-stat">
          <span class="bid-stat-label" data-i18n="bid.total_bids">Total Bids</span>
          <span class="bid-stat-value" id="bid-count-display">${allBids.length}</span>
        </div>
      </div>

      ${currentUser || (typeof isGuestMode === 'function' && isGuestMode()) ? `
      <form class="bid-form" id="bid-form">
        <div class="bid-input-row">
          <div class="bid-input-group">
            <span class="bid-currency">EGP</span>
            <input type="number" id="bid-amount" class="form-control bid-input"
                   placeholder="${minBid.toLocaleString('en-US')}"
                   min="${minBid}" step="1000" required ${currentUser ? '' : 'disabled'}>
          </div>
          <button type="${currentUser ? 'submit' : 'button'}" class="btn btn-primary bid-submit-btn" id="bid-submit-btn" data-i18n="bid.place_btn"
                  ${currentUser ? '' : `title="${t ? t('general.guest_restricted') : 'Requires an account'}" style="opacity:0.6; cursor:not-allowed;" onclick="if(typeof showToast==='function') showToast(typeof t==='function'?t('general.guest_toast'):'You must log in.','warning'); if(typeof showAuthGate==='function') showAuthGate();"`}>
            Place Bid
          </button>
        </div>
        <span class="form-error" id="err-bid-amount"></span>
        <span class="field-hint">${typeof t === 'function' ? t('bid.min_bid') : 'Minimum bid:'} ${formatEGP(minBid)} (${formatEGP(BID_CONFIG.minIncrement)} ${typeof t === 'function' ? t('bid.increment') : 'increment'})</span>
      </form>
      ` : `
      <div class="bid-login-prompt">
        <p data-i18n="bid.login_prompt">Log in to place a bid on this vehicle</p>
        <button class="btn btn-primary" onclick="showAuthGate()" data-i18n="settings.btn.login">Log In</button>
      </div>
      `}

      ${allBids.length > 0 ? `
      <div class="bid-history">
        <h4 class="bid-history-title" data-i18n="bid.history">Bid History</h4>
        <div class="bid-history-list" id="bid-history-list">
          ${allBids.slice(0, 10).map((b, i) => `
            <div class="bid-history-item ${i === 0 ? 'highest' : ''}">
              <div class="bid-history-user">
                <span class="bid-history-avatar">${b.bidderName.charAt(0).toUpperCase()}</span>
                <span class="bid-history-name">${b.bidderName}${i === 0 ? ` <span class="bid-crown">${typeof t === 'function' ? t('bid.highest') : 'Highest'}</span>` : ''}</span>
              </div>
              <div class="bid-history-amount">${formatEGP(b.amount)}</div>
              <div class="bid-history-time">${formatBidTime(b.createdAt)}</div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
    </div>
  `;

  container.insertAdjacentHTML('beforeend', biddingHtml);

  // Bind bid form
  const form = document.getElementById('bid-form');
  if (form && currentUser) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const amountInput = document.getElementById('bid-amount');
      const errEl = document.getElementById('err-bid-amount');
      const submitBtn = document.getElementById('bid-submit-btn');
      const amount = parseInt(amountInput.value);

      if (errEl) errEl.textContent = '';

      // Disable button while processing
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = typeof t === 'function' ? t('bid.placing') : 'Placing...';
      }

      const result = await placeBid(car, currentUser.id, currentUser.username, amount);

      if (result.success) {
        showToast(`Bid of ${formatEGP(amount)} placed successfully!`, 'success');
        amountInput.value = '';

        // Refresh UI from server data (cache was already updated in placeBid)
        updateBidUI(car.id);
      } else {
        if (errEl) errEl.textContent = result.error;
        showToast(result.error, 'error');
      }

      // Re-enable button
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = typeof t === 'function' ? t('bid.place_btn') : 'Place Bid';
      }
    });
  }

  // Start polling for live updates from other users
  startBidPolling(car.id);
  
  if (typeof applyTranslations === 'function') applyTranslations();
}

function formatBidTime(isoStr) {
  const d = new Date(isoStr);
  const now = new Date();
  const diff = now - d;

  if (diff < 60000) return typeof t === 'function' ? t('msg.just_now') : 'Just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';

  return d.toLocaleDateString('en-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
