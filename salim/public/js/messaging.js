'use strict';

// ============================================
// MESSAGING SYSTEM — Internal 1-to-1 Chat
// ============================================

// ── Message Store ──
function getMessages() {
  try { return JSON.parse(localStorage.getItem('at_messages')) || []; }
  catch { return []; }
}

function saveMessages(messages) {
  localStorage.setItem('at_messages', JSON.stringify(messages));
}

function getConversations() {
  try { return JSON.parse(localStorage.getItem('at_conversations')) || []; }
  catch { return []; }
}

function saveConversations(conversations) {
  localStorage.setItem('at_conversations', JSON.stringify(conversations));
}

// ── Create or get conversation ──
function getOrCreateConversation(userId1, userId2, listingId) {
  const convos = getConversations();

  // Find existing conversation between these two users (optionally for a listing)
  let convo = convos.find(c =>
    ((c.user1 === userId1 && c.user2 === userId2) ||
     (c.user1 === userId2 && c.user2 === userId1))
  );

  if (!convo) {
    convo = {
      id: 'CONV-' + Date.now(),
      user1: userId1,
      user2: userId2,
      listingId: listingId || null,
      createdAt: new Date().toISOString(),
      lastMessageAt: null,
      lastMessagePreview: '',
    };
    convos.push(convo);
    saveConversations(convos);
  }

  return convo;
}

// ── Send a message ──
function sendMessage(conversationId, senderId, recipientId, body, listingId) {
  const messages = getMessages();
  const msg = {
    id: 'MSG-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    conversationId,
    senderId,
    recipientId,
    listingId: listingId || null,
    body: body.trim(),
    createdAt: new Date().toISOString(),
    readAt: null,
  };
  messages.push(msg);
  saveMessages(messages);

  // Update conversation
  const convos = getConversations();
  const convo = convos.find(c => c.id === conversationId);
  if (convo) {
    convo.lastMessageAt = msg.createdAt;
    convo.lastMessagePreview = body.length > 50 ? body.substring(0, 50) + '...' : body;
    saveConversations(convos);
  }

  return msg;
}

// ── Get messages for a conversation ──
function getConversationMessages(conversationId) {
  return getMessages().filter(m => m.conversationId === conversationId);
}

// ── Mark messages as read ──
function markMessagesAsRead(conversationId, userId) {
  const messages = getMessages();
  let changed = false;
  messages.forEach(m => {
    if (m.conversationId === conversationId && m.recipientId === userId && !m.readAt) {
      m.readAt = new Date().toISOString();
      changed = true;
    }
  });
  if (changed) saveMessages(messages);
}

// ── Get unread count for user ──
function getUnreadCountForUser(userId) {
  return getMessages().filter(m => m.recipientId === userId && !m.readAt).length;
}

// ── Get user's conversations with metadata ──
function getUserConversations(userId) {
  const convos = getConversations().filter(c => c.user1 === userId || c.user2 === userId);
  const messages = getMessages();
  const users = typeof getUsers === 'function' ? getUsers() : [];

  return convos.map(c => {
    const otherUserId = c.user1 === userId ? c.user2 : c.user1;
    const otherUser = users.find(u => u.id === otherUserId);
    const convoMessages = messages.filter(m => m.conversationId === c.id);
    const unread = convoMessages.filter(m => m.recipientId === userId && !m.readAt).length;
    const lastMsg = convoMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    // Get listing info if exists
    let listingInfo = null;
    if (c.listingId) {
      const allCars = typeof getAllCars === 'function' ? getAllCars() : [];
      const car = allCars.find(car => car.id === c.listingId || car.id === parseInt(c.listingId));
      if (car) listingInfo = { id: car.id, name: `${car.make} ${car.model}`, price: car.price };
    }

    return {
      ...c,
      otherUser: otherUser ? { id: otherUser.id, username: otherUser.username } : { id: otherUserId, username: 'Unknown User' },
      unreadCount: unread,
      lastMessage: lastMsg || null,
      listingInfo,
      messageCount: convoMessages.length,
    };
  }).sort((a, b) => {
    const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt) : new Date(a.createdAt);
    const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt) : new Date(b.createdAt);
    return dateB - dateA;
  });
}

// ── Open Message Seller Modal ──
function openMessageSellerModal(carId, carName) {
  if (!isLoggedIn()) {
    showAuthGate();
    return;
  }

  const currentUser = getCurrentUser();

  // Find seller user
  const car = getAllCars().find(c => c.id === carId || c.id === parseInt(carId));
  if (!car) {
    showToast('Listing not found.', 'error');
    return;
  }

  // Prevent messaging yourself
  // Find seller in users list
  const users = getUsers();
  const allSellers = getRegisteredSellers();

  let sellerUser = null;

  // Check registered sellers
  const regSeller = allSellers.find(s => s.id === car.sellerId);
  if (regSeller) {
    sellerUser = users.find(u => u.phone && regSeller.phone && u.phone.replace(/[\s\-]/g, '').includes(regSeller.phone.replace(/[\s\-]/g, '').slice(-8)));
  }

  // For base cars, create a fake user ID based on sellerId
  const sellerUserId = sellerUser ? sellerUser.id : 'SELLER-' + car.sellerId;

  if (currentUser.id === sellerUserId) {
    showToast('You cannot message yourself.', 'warning');
    return;
  }

  // Create or get conversation
  const convo = getOrCreateConversation(currentUser.id, sellerUserId, carId);

  // Show inline message modal
  showMessageModal(convo, currentUser, sellerUserId, carName);
}

function showMessageModal(convo, currentUser, recipientId, carName) {
  let modal = document.getElementById('message-modal');
  if (modal) modal.remove();

  const convoMessages = getConversationMessages(convo.id);
  const users = typeof getUsers === 'function' ? getUsers() : [];
  const recipientUser = users.find(u => u.id === recipientId);
  const recipientName = recipientUser ? recipientUser.username : 'Seller';

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
              <p>${escapeHtml(m.body)}</p>
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

  // Mark as read
  markMessagesAsRead(convo.id, currentUser.id);

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
  document.getElementById('msg-send-form').addEventListener('submit', e => {
    e.preventDefault();
    const input = document.getElementById('msg-input');
    const text = input.value.trim();
    if (!text) return;

    sendMessage(convo.id, currentUser.id, recipientId, text, convo.listingId);
    input.value = '';

    // Add bubble
    const emptyMsg = body.querySelector('.msg-empty');
    if (emptyMsg) emptyMsg.remove();

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble msg-sent';
    bubble.innerHTML = `<p>${escapeHtml(text)}</p><span class="msg-time">Just now</span>`;
    body.appendChild(bubble);
    body.scrollTop = body.scrollHeight;

    showToast('Message sent!', 'success');
  });

  // Focus input
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
function initMessagingPage() {
  if (!isLoggedIn()) {
    showAuthGate();
    return;
  }

  const currentUser = getCurrentUser();
  const container = document.getElementById('messaging-container');
  if (!container) return;

  const convos = getUserConversations(currentUser.id);

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
            <div class="inbox-item ${c.unreadCount > 0 ? 'unread' : ''}" data-convo-id="${c.id}" role="button" tabindex="0">
              <div class="inbox-item-avatar">${c.otherUser.username.charAt(0).toUpperCase()}</div>
              <div class="inbox-item-info">
                <div class="inbox-item-name">
                  ${c.otherUser.username}
                  ${c.unreadCount > 0 ? `<span class="nav-badge">${c.unreadCount}</span>` : ''}
                </div>
                ${c.listingInfo ? `<div class="inbox-item-listing">${c.listingInfo.name}</div>` : ''}
                <div class="inbox-item-preview">${c.lastMessage ? escapeHtml(c.lastMessage.body).substring(0, 60) : 'No messages yet'}</div>
              </div>
              <div class="inbox-item-time">${c.lastMessage ? formatMsgTime(c.lastMessage.createdAt) : ''}</div>
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

function openInboxConversation(convoId, currentUser) {
  const chatArea = document.getElementById('inbox-chat');
  if (!chatArea) return;

  const convoMessages = getConversationMessages(convoId);
  const convos = getConversations();
  const convo = convos.find(c => c.id === convoId);
  if (!convo) return;

  const users = typeof getUsers === 'function' ? getUsers() : [];
  const otherUserId = convo.user1 === currentUser.id ? convo.user2 : convo.user1;
  const otherUser = users.find(u => u.id === otherUserId);
  const otherName = otherUser ? otherUser.username : 'User';

  // Mark as read
  markMessagesAsRead(convoId, currentUser.id);

  chatArea.innerHTML = `
    <div class="inbox-chat-header">
      <button class="inbox-chat-back" id="inbox-chat-back" aria-label="Back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div class="inbox-chat-user">
        <div class="msg-modal-avatar">${otherName.charAt(0).toUpperCase()}</div>
        <div>
          <h3>${otherName}</h3>
          ${convo.listingId ? '<span class="inbox-chat-status">Related to listing</span>' : ''}
        </div>
      </div>
    </div>
    <div class="inbox-chat-messages" id="inbox-chat-messages">
      ${convoMessages.length === 0 ? '<p class="msg-empty">No messages yet. Start the conversation!</p>' :
        convoMessages.map(m => `
          <div class="msg-bubble ${m.senderId === currentUser.id ? 'msg-sent' : 'msg-received'}">
            <p>${escapeHtml(m.body)}</p>
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
  document.getElementById('inbox-chat-form').addEventListener('submit', e => {
    e.preventDefault();
    const input = document.getElementById('inbox-msg-input');
    const text = input.value.trim();
    if (!text) return;

    sendMessage(convoId, currentUser.id, otherUserId, text, convo.listingId);
    input.value = '';

    const emptyEl = messagesDiv.querySelector('.msg-empty');
    if (emptyEl) emptyEl.remove();

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble msg-sent';
    bubble.innerHTML = `<p>${escapeHtml(text)}</p><span class="msg-time">Just now</span>`;
    messagesDiv.appendChild(bubble);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });

  document.getElementById('inbox-msg-input')?.focus();
}
