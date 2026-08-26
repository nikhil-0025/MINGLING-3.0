/**
 * Saved Chats Controller
 * (saved-chats.js)
 */

import { sessionManager } from './session.js';
import { showToast, formatDate, escapeHTML } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  await sessionManager.initSession();

  const loadSavedChats = async () => {
    const listEl = document.getElementById('saved-chats-list');
    if (!listEl) return;

    try {
      const res = await fetch('/api/chats/saved', {
        headers: { 'x-session-token': sessionManager.getToken() }
      });
      const data = await res.json();

      if (data.success && data.data && data.data.length > 0) {
        listEl.innerHTML = data.data.map(chat => `
          <div class="glass-card saved-card">
            <div>
              <h3 style="font-size:1.1rem; margin-bottom:0.25rem;">${escapeHTML(chat.title)}</h3>
              <p class="text-muted" style="font-size:0.85rem;">
                ${chat.messages?.length || 0} messages • Saved on ${formatDate(chat.savedAt)}
              </p>
            </div>
            <div style="display:flex; gap:0.5rem;">
              <button class="btn btn-glass btn-sm btn-export" data-id="${chat.savedChatId}"><i class="fa-solid fa-download"></i> Export JSON</button>
              <button class="btn btn-danger btn-sm btn-delete-saved" data-id="${chat.savedChatId}"><i class="fa-solid fa-trash"></i> Delete</button>
            </div>
          </div>
        `).join('');

        // Bind delete listeners
        document.querySelectorAll('.btn-delete-saved').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this saved conversation?')) {
              try {
                const delRes = await fetch(`/api/chats/saved/${id}`, {
                  method: 'DELETE',
                  headers: { 'x-session-token': sessionManager.getToken() }
                });
                const delData = await delRes.json();
                if (delData.success) {
                  showToast('Saved conversation deleted', 'success');
                  loadSavedChats();
                }
              } catch (err) {
                showToast('Failed to delete', 'error');
              }
            }
          });
        });

        // Bind export listeners
        document.querySelectorAll('.btn-export').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const targetChat = data.data.find(c => c.savedChatId === id);
            if (targetChat) {
              const blob = new Blob([JSON.stringify(targetChat, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `mingling_chat_${id}.json`;
              a.click();
              URL.revokeObjectURL(url);
              showToast('Export downloaded', 'success');
            }
          });
        });
      } else {
        listEl.innerHTML = `<p class="text-muted" style="text-align:center;">No saved conversations yet. Click "Save Chat" inside any active room to store a snapshot.</p>`;
      }
    } catch (err) {
      listEl.innerHTML = `<p class="text-muted" style="text-align:center;">Failed to load saved chats.</p>`;
    }
  };

  loadSavedChats();
});
