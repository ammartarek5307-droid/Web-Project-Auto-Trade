'use strict';

// ============================================
// BIDDING SYSTEM
// ============================================
const BID_CONFIG = {
  minIncrement: 5000, // EGP
};

// ── Bid Store ──
function getBids() {
  try { return JSON.parse(localStorage.getItem('at_bids')) || []; }
  catch { return []; }
}

function saveBids(bids) {
  localStorage.setItem('at_bids', JSON.stringify(bids));
}

// ── Get bids for a listing ──
function getListingBids(listingId) {
  return getBids()
    .filter(b => b.listingId === listingId || b.listingId === parseInt(listingId))
    .sort((a, b) => b.amount - a.amount);
}

// ── Get highest bid for a listing ──
function getHighestBid(listingId) {
  const bids = getListingBids(listingId);
  return bids.length > 0 ? bids[0] : null;
}

// ── Place a bid ──
function placeBid(listingId, bidderId, bidderName, amount) {
  const bids = getBids();
  const car = getAllCars().find(c => c.id === listingId || c.id === parseInt(listingId));

  if (!car) {
    return { success: false, error: 'Listing not found.' };
  }

  // Prevent self-bidding
  const currentUser = getCurrentUser();
  if (currentUser) {
    const users = getUsers();
    const allSellers = getRegisteredSellers();
    const regSeller = allSellers.find(s => s.id === car.sellerId);

    if (regSeller) {
      const sellerUser = users.find(u => u.phone && regSeller.phone &&
        u.phone.replace(/[\s\-]/g, '').includes(regSeller.phone.replace(/[\s\-]/g, '').slice(-8)));
      if (sellerUser && sellerUser.id === currentUser.id) {
        return { success: false, error: 'You cannot bid on your own listing.' };
      }
    }
  }

  // Validate amount
  if (isNaN(amount) || amount <= 0) {
    return { success: false, error: 'Please enter a valid bid amount.' };
  }

  const highestBid = getHighestBid(listingId);
  const minBid = highestBid
    ? highestBid.amount + BID_CONFIG.minIncrement
    : (typeof car.price === 'number' ? car.price : parseInt(String(car.price).replace(/[^0-9]/g, '')));

  if (amount < minBid) {
    return {
      success: false,
      error: `Minimum bid is ${formatEGP(minBid)}. Bids must be at least ${formatEGP(BID_CONFIG.minIncrement)} above the current highest bid.`
    };
  }

  const newBid = {
    id: 'BID-' + Date.now(),
    listingId: parseInt(listingId) || listingId,
    bidderId,
    bidderName,
    amount,
    createdAt: new Date().toISOString(),
    status: 'active',
  };

  bids.push(newBid);
  saveBids(bids);

  // Notify via toast (simulate notifications)
  if (highestBid && highestBid.bidderId !== bidderId) {
    // Previous highest bidder outbid notification (stored for later)
    addBidNotification(highestBid.bidderId, `You have been outbid on ${car.make} ${car.model}! New highest bid: ${formatEGP(amount)}`);
  }

  // Notify listing owner
  addBidNotification('SELLER-' + car.sellerId, `New bid of ${formatEGP(amount)} on ${car.make} ${car.model} by ${bidderName}`);

  return { success: true, bid: newBid };
}

// ── Bid notifications (simple localStorage queue) ──
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

// ── Render bidding section on car details ──
function renderBiddingSection(car, container) {
  if (!car || !container) return;

  const currentUser = getCurrentUser();
  const highestBid = getHighestBid(car.id);
  const allBids = getListingBids(car.id);
  const carPrice = typeof car.price === 'number' ? car.price : parseInt(String(car.price).replace(/[^0-9]/g, ''));
  const minBid = highestBid ? highestBid.amount + BID_CONFIG.minIncrement : carPrice;

  const biddingHtml = `
    <div class="details-section bidding-section">
      <h3 class="details-section-title">Place a Bid</h3>

      <div class="bid-stats">
        <div class="bid-stat">
          <span class="bid-stat-label">Asking Price</span>
          <span class="bid-stat-value">${formatEGP(carPrice)}</span>
        </div>
        <div class="bid-stat highlight">
          <span class="bid-stat-label">Highest Bid</span>
          <span class="bid-stat-value" id="bid-highest-display">${highestBid ? formatEGP(highestBid.amount) : 'No bids yet'}</span>
        </div>
        <div class="bid-stat">
          <span class="bid-stat-label">Total Bids</span>
          <span class="bid-stat-value" id="bid-count-display">${allBids.length}</span>
        </div>
      </div>

      ${currentUser ? `
      <form class="bid-form" id="bid-form">
        <div class="bid-input-row">
          <div class="bid-input-group">
            <span class="bid-currency">EGP</span>
            <input type="number" id="bid-amount" class="form-control bid-input"
                   placeholder="${minBid.toLocaleString('en-US')}"
                   min="${minBid}" step="1000" required>
          </div>
          <button type="submit" class="btn btn-primary bid-submit-btn" id="bid-submit-btn">
            Place Bid
          </button>
        </div>
        <span class="form-error" id="err-bid-amount"></span>
        <span class="field-hint">Minimum bid: ${formatEGP(minBid)} (${formatEGP(BID_CONFIG.minIncrement)} increment)</span>
      </form>
      ` : `
      <div class="bid-login-prompt">
        <p>Log in to place a bid on this vehicle</p>
        <button class="btn btn-primary" onclick="showAuthGate()">Log In</button>
      </div>
      `}

      ${allBids.length > 0 ? `
      <div class="bid-history">
        <h4 class="bid-history-title">Bid History</h4>
        <div class="bid-history-list" id="bid-history-list">
          ${allBids.slice(0, 10).map((b, i) => `
            <div class="bid-history-item ${i === 0 ? 'highest' : ''}">
              <div class="bid-history-user">
                <span class="bid-history-avatar">${b.bidderName.charAt(0).toUpperCase()}</span>
                <span class="bid-history-name">${b.bidderName}${i === 0 ? ' <span class="bid-crown">Highest</span>' : ''}</span>
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
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const amountInput = document.getElementById('bid-amount');
      const errEl = document.getElementById('err-bid-amount');
      const amount = parseInt(amountInput.value);

      if (errEl) errEl.textContent = '';

      const result = placeBid(car.id, currentUser.id, currentUser.username, amount);

      if (result.success) {
        showToast(`Bid of ${formatEGP(amount)} placed successfully!`, 'success');
        amountInput.value = '';

        // Update displays
        const highestDisplay = document.getElementById('bid-highest-display');
        const countDisplay = document.getElementById('bid-count-display');
        if (highestDisplay) highestDisplay.textContent = formatEGP(amount);
        if (countDisplay) countDisplay.textContent = getListingBids(car.id).length;

        // Add to history
        const historyList = document.getElementById('bid-history-list');
        if (historyList) {
          // Remove 'highest' from previous
          historyList.querySelectorAll('.highest').forEach(el => el.classList.remove('highest'));
          historyList.querySelectorAll('.bid-crown').forEach(el => el.remove());

          const newItem = document.createElement('div');
          newItem.className = 'bid-history-item highest';
          newItem.innerHTML = `
            <div class="bid-history-user">
              <span class="bid-history-avatar">${currentUser.username.charAt(0).toUpperCase()}</span>
              <span class="bid-history-name">${currentUser.username} <span class="bid-crown">Highest</span></span>
            </div>
            <div class="bid-history-amount">${formatEGP(amount)}</div>
            <div class="bid-history-time">Just now</div>
          `;
          historyList.insertBefore(newItem, historyList.firstChild);
        } else {
          // Create history section if first bid
          const section = container.querySelector('.bidding-section');
          if (section) {
            const historyHtml = `
              <div class="bid-history">
                <h4 class="bid-history-title">Bid History</h4>
                <div class="bid-history-list" id="bid-history-list">
                  <div class="bid-history-item highest">
                    <div class="bid-history-user">
                      <span class="bid-history-avatar">${currentUser.username.charAt(0).toUpperCase()}</span>
                      <span class="bid-history-name">${currentUser.username} <span class="bid-crown">Highest</span></span>
                    </div>
                    <div class="bid-history-amount">${formatEGP(amount)}</div>
                    <div class="bid-history-time">Just now</div>
                  </div>
                </div>
              </div>
            `;
            section.insertAdjacentHTML('beforeend', historyHtml);
          }
        }

        // Update min bid hint
        const newMin = amount + BID_CONFIG.minIncrement;
        amountInput.min = newMin;
        amountInput.placeholder = newMin.toLocaleString('en-US');
        const hint = form.querySelector('.field-hint');
        if (hint) hint.textContent = `Minimum bid: ${formatEGP(newMin)} (${formatEGP(BID_CONFIG.minIncrement)} increment)`;

      } else {
        if (errEl) errEl.textContent = result.error;
        showToast(result.error, 'error');
      }
    });
  }
}

function formatBidTime(isoStr) {
  const d = new Date(isoStr);
  const now = new Date();
  const diff = now - d;

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';

  return d.toLocaleDateString('en-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
