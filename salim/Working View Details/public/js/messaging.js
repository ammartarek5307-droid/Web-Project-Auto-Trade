'use strict';

// ============================================
// MESSAGING SYSTEM — Backed by MongoDB API
// ============================================

// ── API Helpers ──
async function fetchApi(url, options = {}) {
  const token = localStorage.getItem('at_token');
  if (!token) return { success: false, error: 'Not authenticated' };

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
    return res.json();
  } catch (err) {
    console.error('API Fetch error:', err);
    return { success: false, error: 'Network error' };
  }
}

// ── Get unread count for user ──
async function getUnreadCountForUser() {
  const data = await fetchApi('/api/messages/unread-count');
  return data.success ? data.count : 0;
}

// ── Open Message Seller Modal ──
function openMessageSellerModal(carId, carName) {
  if (!isLoggedIn()) {
    showAuthGate();
    return;
  }

  const currentUser = getCurrentUser();

  // Find seller user
  const car = getAllCars().find(c => String(c.id) === String(carId));
  if (!car) {
    showToast('Listing not found.', 'error');
    return;
  }

  // Find seller in users list
  const users = typeof getUsers === 'function' ? getUsers() : [];
  const allSellers = typeof getRegisteredSellers === 'function' ? getRegisteredSellers() : [];

  let sellerUser = null;
  const regSeller = allSellers.find(s => s.id === car.sellerId);
  if (regSeller) {
    sellerUser = users.find(u => u.phone && regSeller.phone && u.phone.replace(/[\s\-]/g, '').includes(regSeller.phone.replace(/[\s\-]/g, '').slice(-8)));
  }

  const sellerUserId = sellerUser ? sellerUser.id : 'SELLER-' + car.sellerId;

  if (currentUser.id === sellerUserId) {
    showToast('You cannot message yourself.', 'warning');
    return;
  }

  // Show inline message modal directly (create conversation on first message)
  showMessageModal(null, currentUser, sellerUserId, carName, carId);
}

async function showMessageModal(convo, currentUser, recipientId, carName, carId = null) {
  let modal = document.getElementById('message-modal');
  if (modal) modal.remove();

  let convoMessages = [];
  let recipientName = 'Seller';
  let conversationId = convo ? convo._id : null;

  if (conversationId) {
    const data = await fetchApi(`/api/messages/conversations/${conversationId}`);
    if (data.success) {
      convoMessages = data.messages || [];
      const users = typeof getUsers === 'function' ? getUsers() : [];
      const recipientUser = users.find(u => u.id === recipientId);
      if (recipientUser) recipientName = recipientUser.username;
    }
  }

  modal = document.createElement('div');
  modal.id = 'message-modal';
  modal.className = 'modal-overlay';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.innerHTML = `
    <div class="modal-box msg-modal-box">
      <button class="modal-close" id="msg-modal-close" aria-label="Close">✕</button>

      <div class="msg-modal-header">
        <div class="msg-modal-avatar">${recipientName.charAt(0).toUpperCase()}</div>
        <div>
          <h3>${recipientName}</h3>
          ${carName ? `<p class="msg-modal-car">About: ${carName}</p>` : ''}
        </div>
      </div>

      <div class="msg-modal-body" id="msg-modal-body">
        ${convoMessages.length === 0 ? '<p class="msg-empty">Start a conversation with the seller</p>' :
          convoMessages.map(m => `
            <div class="msg-bubble ${m.senderId === currentUser.id ? 'msg-sent' : 'msg-received'}">
              <p>${escapeHtml(m.content)}</p>
              <span class="msg-time">${formatMsgTime(m.createdAt)}${m.senderId === currentUser.id && m.readAt ? ' · Read' : ''}</span>
            </div>
          `).join('')}
      </div>

      <form class="msg-modal-input" id="msg-send-form">
        <input type="text" id="msg-input" class="form-control" placeholder="Type a message..." autocomplete="off" maxlength="500" required>
        <button type="submit" class="btn btn-primary msg-send-btn" id="msg-send-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('open'));
  document.body.style.overflow = 'hidden';

  // Scroll to bottom
  const body = document.getElementById('msg-modal-body');
  if (body) body.scrollTop = body.scrollHeight;

  // Close
  document.getElementById('msg-modal-close').addEventListener('click', () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => modal.remove(), 350);
  });
  modal.addEventListener('click', e => {
    if (e.target === modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(() => modal.remove(), 350);
    }
  });

  // Send
  document.getElementById('msg-send-form').addEventListener('submit', async e => {
    e.preventDefault();
    const input = document.getElementById('msg-input');
    const text = input.value.trim();
    if (!text) return;

    const data = await fetchApi('/api/messages', {
      method: 'POST',
      body: JSON.stringify({
        recipientId,
        content: text,
        carId: convo ? convo.carId : carId,
        carName: convo ? convo.carName : carName,
      })
    });

    if (data.success) {
      if (!conversationId) conversationId = data.conversationId;
      input.value = '';

      // Add bubble
      const emptyMsg = body.querySelector('.msg-empty');
      if (emptyMsg) emptyMsg.remove();

      const bubble = document.createElement('div');
      bubble.className = 'msg-bubble msg-sent';
      bubble.innerHTML = `<p>${escapeHtml(text)}</p><span class="msg-time">Just now</span>`;
      body.appendChild(bubble);
      body.scrollTop = body.scrollHeight;
    } else {
      showToast(data.error || 'Failed to send message.', 'error');
    }
  });

  document.getElementById('msg-input').focus();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatMsgTime(isoStr) {
  const d = new Date(isoStr);
  const now = new Date();
  const diff = now - d;

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';

  return d.toLocaleDateString('en-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ============================================
// MESSAGING INBOX PAGE
// ============================================
async function initMessagingPage() {
  if (!isLoggedIn()) {
    showAuthGate();
    return;
  }

  const currentUser = getCurrentUser();
  const container = document.getElementById('messaging-container');
  if (!container) return;

  const data = await fetchApi('/api/messages/conversations');
  if (!data.success) {
    container.innerHTML = `<div class="empty-state"><h3>Error loading messages</h3></div>`;
    return;
  }

  const convos = data.conversations || [];

  if (convos.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:.4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <h3>No conversations yet</h3>
        <p>When you message a seller, your conversations will appear here.</p>
        <a href="/categories?type=all" class="btn btn-primary btn-lg">Browse Cars</a>
      </div>
    `;
    return;
  }

  // Split view: conversation list + active chat
  container.innerHTML = `
    <div class="inbox-layout">
      <div class="inbox-sidebar" id="inbox-sidebar">
        <div class="inbox-sidebar-header">
          <h2>Messages</h2>
          <span class="inbox-count">${convos.length} conversation${convos.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="inbox-search">
          <input type="text" class="form-control" placeholder="Search conversations..." id="inbox-search-input">
        </div>
        <div class="inbox-list" id="inbox-list">
          ${convos.map(c => `
            <div class="inbox-item ${c.unreadCount > 0 ? 'unread' : ''}" data-convo-id="${c._id}" role="button" tabindex="0">
              <div class="inbox-item-avatar">${c.otherUser.username.charAt(0).toUpperCase()}</div>
              <div class="inbox-item-info">
                <div class="inbox-item-name">
                  ${c.otherUser.username}
                  ${c.unreadCount > 0 ? `<span class="nav-badge">${c.unreadCount}</span>` : ''}
                </div>
                ${c.carName ? `<div class="inbox-item-listing">${c.carName}</div>` : ''}
                <div class="inbox-item-preview">${c.lastMessagePreview || 'No messages yet'}</div>
              </div>
              <div class="inbox-item-time">${c.lastMessageAt ? formatMsgTime(c.lastMessageAt) : ''}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="inbox-chat" id="inbox-chat">
        <div class="inbox-chat-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:.3"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <p>Select a conversation to view messages</p>
        </div>
      </div>
    </div>
  `;

  // Bind conversation clicks
  document.querySelectorAll('.inbox-item').forEach(item => {
    item.addEventListener('click', () => {
      const convoId = item.dataset.convoId;
      openInboxConversation(convoId, currentUser);
      document.querySelectorAll('.inbox-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      item.classList.remove('unread');
      const badge = item.querySelector('.nav-badge');
      if (badge) badge.remove();
    });
  });

  // Search
  const searchInput = document.getElementById('inbox-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase();
      document.querySelectorAll('.inbox-item').forEach(item => {
        const name = item.querySelector('.inbox-item-name')?.textContent.toLowerCase() || '';
        const preview = item.querySelector('.inbox-item-preview')?.textContent.toLowerCase() || '';
        item.style.display = (name.includes(q) || preview.includes(q)) ? '' : 'none';
      });
    });
  }
}

async function openInboxConversation(convoId, currentUser) {
  const chatArea = document.getElementById('inbox-chat');
  if (!chatArea) return;

  chatArea.innerHTML = `<div class="inbox-chat-empty"><p>Loading messages...</p></div>`;

  const data = await fetchApi(`/api/messages/conversations/${convoId}`);
  if (!data.success) {
    chatArea.innerHTML = `<div class="inbox-chat-empty"><p>Error loading messages</p></div>`;
    return;
  }

  const convoMessages = data.messages || [];
  const convo = data.conversation;

  const otherUserId = convo.participantIds.find(id => id !== currentUser.id);
  const otherName = convoMessages.length > 0
    ? (convoMessages[0].senderId === otherUserId ? convoMessages[0].senderName : convoMessages[0].recipientName)
    : 'User';

  chatArea.innerHTML = `
    <div class="inbox-chat-header">
      <button class="inbox-chat-back" id="inbox-chat-back" aria-label="Back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div class="inbox-chat-user">
        <div class="msg-modal-avatar">${otherName.charAt(0).toUpperCase()}</div>
        <div>
          <h3>${otherName}</h3>
          ${convo.carName ? `<span class="inbox-chat-status">${convo.carName}</span>` : ''}
        </div>
      </div>
    </div>
    <div class="inbox-chat-messages" id="inbox-chat-messages">
      ${convoMessages.length === 0 ? '<p class="msg-empty">No messages yet. Start the conversation!</p>' :
        convoMessages.map(m => `
          <div class="msg-bubble ${m.senderId === currentUser.id ? 'msg-sent' : 'msg-received'}">
            <p>${escapeHtml(m.content)}</p>
            <span class="msg-time">${formatMsgTime(m.createdAt)}${m.senderId === currentUser.id && m.readAt ? ' · Read' : ''}</span>
          </div>
        `).join('')}
    </div>
    <form class="inbox-chat-input" id="inbox-chat-form">
      <input type="text" id="inbox-msg-input" class="form-control" placeholder="Type a message..." autocomplete="off" maxlength="500" required>
      <button type="submit" class="btn btn-primary msg-send-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </form>
  `;

  const messagesDiv = document.getElementById('inbox-chat-messages');
  if (messagesDiv) messagesDiv.scrollTop = messagesDiv.scrollHeight;

  // Back button (mobile)
  document.getElementById('inbox-chat-back')?.addEventListener('click', () => {
    chatArea.innerHTML = `<div class="inbox-chat-empty">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:.3"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <p>Select a conversation</p>
    </div>`;
    document.querySelectorAll('.inbox-item').forEach(i => i.classList.remove('active'));
    // Show sidebar on mobile
    document.getElementById('inbox-sidebar')?.classList.remove('hidden-mobile');
    chatArea.classList.remove('active-mobile');
  });

  // Show chat on mobile
  document.getElementById('inbox-sidebar')?.classList.add('hidden-mobile');
  chatArea.classList.add('active-mobile');

  // Send message
  document.getElementById('inbox-chat-form').addEventListener('submit', async e => {
    e.preventDefault();
    const input = document.getElementById('inbox-msg-input');
    const text = input.value.trim();
    if (!text) return;

    const postData = await fetchApi('/api/messages', {
      method: 'POST',
      body: JSON.stringify({
        recipientId: otherUserId,
        content: text,
        carId: convo.carId,
        carName: convo.carName,
      })
    });

    if (postData.success) {
      input.value = '';

      const emptyEl = messagesDiv.querySelector('.msg-empty');
      if (emptyEl) emptyEl.remove();

      const bubble = document.createElement('div');
      bubble.className = 'msg-bubble msg-sent';
      bubble.innerHTML = `<p>${escapeHtml(text)}</p><span class="msg-time">Just now</span>`;
      messagesDiv.appendChild(bubble);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    } else {
      showToast(postData.error || 'Failed to send message.', 'error');
    }
  });

  document.getElementById('inbox-msg-input')?.focus();
}
