/**
 * Frontend Rooms Manager Module
 * (rooms.js)
 */

import { sessionManager } from './session.js';
import { showToast, escapeHTML } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  const session = await sessionManager.initSession();

  // Update header badge
  const nameEl = document.getElementById('user-nickname');
  const avatarEl = document.getElementById('user-avatar');
  if (nameEl) nameEl.textContent = session.nickname;
  if (avatarEl) avatarEl.innerHTML = `<img src="${session.avatar}" style="width:100%; height:100%; border-radius:50%;">`;

  // Privacy dropdown change listener
  const privacySelect = document.getElementById('create-privacy');
  const passwordWrapper = document.getElementById('password-wrapper');
  if (privacySelect && passwordWrapper) {
    privacySelect.addEventListener('change', (e) => {
      passwordWrapper.style.display = e.target.value === 'private' ? 'flex' : 'none';
    });
  }

  // Handle Create Room
  const createForm = document.getElementById('create-room-form');
  if (createForm) {
    createForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('create-name').value;
      const isPrivate = document.getElementById('create-privacy').value === 'private';
      const password = document.getElementById('create-password')?.value || '';
      const expiresInHours = Number(document.getElementById('create-expiration').value);

      try {
        const res = await fetch('/api/rooms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-session-token': sessionManager.getToken()
          },
          body: JSON.stringify({ name, isPrivate, password, expiresInHours })
        });

        const data = await res.json();
        if (data.success && data.data) {
          showToast('Room created! Redirecting to chat...', 'success');
          setTimeout(() => {
            window.location.href = `chat.html?room=${data.data.roomId}`;
          }, 800);
        } else {
          showToast(data.message || 'Failed to create room', 'error');
        }
      } catch (err) {
        showToast('Network error while creating room', 'error');
      }
    });
  }

  // Handle Join Room
  const joinForm = document.getElementById('join-room-form');
  if (joinForm) {
    joinForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const roomIdentifier = document.getElementById('join-code').value.trim();
      const password = document.getElementById('join-password').value.trim();

      try {
        const res = await fetch('/api/rooms/join', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-session-token': sessionManager.getToken()
          },
          body: JSON.stringify({ roomIdentifier, password })
        });

        const data = await res.json();
        if (data.success && data.data) {
          showToast('Joined room successfully!', 'success');
          setTimeout(() => {
            window.location.href = `chat.html?room=${data.data.roomId}`;
          }, 800);
        } else {
          showToast(data.message || 'Could not join room', 'error');
        }
      } catch (err) {
        showToast('Error joining room', 'error');
      }
    });
  }

  // Load Public Rooms List
  const loadPublicRooms = async () => {
    const listContainer = document.getElementById('public-rooms-list');
    if (!listContainer) return;

    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        listContainer.innerHTML = data.data.map(room => `
          <div class="glass-card public-room-card">
            <div>
              <strong style="font-size:0.95rem;">${escapeHTML(room.name)}</strong>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.15rem;">
                Code: <code>${room.roomCode}</code> • ${room.participants?.length || 1} online
              </div>
            </div>
            <a href="chat.html?room=${room.roomId}" class="btn btn-primary btn-sm"><i class="fa-solid fa-comments"></i> Enter</a>
          </div>
        `).join('');
      } else {
        listContainer.innerHTML = `<p class="text-muted" style="font-size:0.85rem; text-align:center;">No public rooms active right now. Create one!</p>`;
      }
    } catch (err) {
      listContainer.innerHTML = `<p class="text-muted" style="font-size:0.85rem; text-align:center;">Error fetching public rooms.</p>`;
    }
  };

  loadPublicRooms();
  document.getElementById('refresh-public-rooms')?.addEventListener('click', loadPublicRooms);
});
