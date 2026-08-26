/**
 * Main Chat UI Controller Module
 * (chat.js)
 */

import { sessionManager } from './session.js';
import { socketService } from './socket.js';
import { renderMessage } from './messages.js';
import { requestAISummary } from './ai.js';
import { showToast, copyToClipboard } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  const session = await sessionManager.initSession();

  // Avatar in sidebar
  const sidebarAvatar = document.getElementById('sidebar-user-avatar');
  if (sidebarAvatar) sidebarAvatar.innerHTML = `<img src="${session.avatar}" style="width:100%; height:100%; border-radius:50%;">`;

  // Get Room ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('room');

  if (!roomId) {
    showToast('No room specified. Redirecting to Room Manager...', 'info');
    setTimeout(() => window.location.href = 'room.html', 1500);
    return;
  }

  // Connect Socket.IO
  socketService.connect();
  socketService.joinRoom(roomId);

  // Fetch Room Info & History via REST
  try {
    const roomRes = await fetch(`/api/rooms/${roomId}`, {
      headers: { 'x-session-token': sessionManager.getToken() }
    });
    const roomData = await roomRes.json();
    if (roomData.success && roomData.data) {
      document.getElementById('room-header-name').textContent = roomData.data.name;
      document.getElementById('room-code-badge').textContent = `Code: ${roomData.data.roomCode}`;
      document.getElementById('room-online-count').textContent = `${roomData.data.participants?.length || 1} members`;
    }

    const msgRes = await fetch(`/api/messages/room/${roomId}`, {
      headers: { 'x-session-token': sessionManager.getToken() }
    });
    const msgData = await msgRes.json();
    if (msgData.success && msgData.data) {
      const container = document.getElementById('messages-container');
      container.innerHTML = '';
      msgData.data.forEach(m => {
        container.appendChild(renderMessage(m, session.sessionId));
      });
      container.scrollTop = container.scrollHeight;
    }
  } catch (err) {
    console.warn('[CHAT LOAD WARN]', err);
  }

  // Socket Realtime Message Listener
  socketService.on('receive_message', (msg) => {
    const container = document.getElementById('messages-container');
    container.appendChild(renderMessage(msg, session.sessionId));
    container.scrollTop = container.scrollHeight;
  });

  // Socket Room Deleted Listener
  socketService.on('room_deleted', (data) => {
    showToast(data?.message || 'This room has been ended and vanished from the database.', 'warning');
    setTimeout(() => {
      window.location.href = 'room.html';
    }, 1200);
  });

  // Typing Listeners
  let typingTimeout = null;
  const messageInput = document.getElementById('message-input');
  messageInput?.addEventListener('input', () => {
    socketService.sendTyping(roomId);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socketService.sendStopTyping(roomId);
    }, 1500);
  });

  socketService.on('typing', (data) => {
    const bar = document.getElementById('typing-bar');
    const text = document.getElementById('typing-text');
    if (bar && text && data.sessionId !== session.sessionId) {
      text.textContent = `${data.nickname} is typing...`;
      bar.style.visibility = 'visible';
    }
  });

  socketService.on('stop_typing', () => {
    const bar = document.getElementById('typing-bar');
    if (bar) bar.style.visibility = 'hidden';
  });

  // Send Message Event
  const sendMsg = () => {
    const content = messageInput.value.trim();
    if (!content) return;

    socketService.sendMessage({
      roomId,
      content,
      type: 'text'
    });

    messageInput.value = '';
    socketService.sendStopTyping(roomId);
  };

  document.getElementById('btn-send-message')?.addEventListener('click', sendMsg);
  messageInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMsg();
    }
  });

  // 1. AI Summary Button Handler
  document.getElementById('btn-ai-summary')?.addEventListener('click', () => {
    requestAISummary(roomId);
  });

  // 2. Share invite link
  document.getElementById('btn-share-room')?.addEventListener('click', () => {
    const inviteUrl = window.location.href;
    copyToClipboard(inviteUrl, 'Room invite link copied to clipboard!');
  });

  // 3. QR Code Generator Modal Handler
  const qrModal = document.getElementById('qr-modal');
  const qrDisplay = document.getElementById('qr-code-display');
  const copyQrBtn = document.getElementById('btn-copy-qr-link');
  const downloadQrBtn = document.getElementById('btn-download-qr');
  const closeQrBtn = document.getElementById('btn-close-qr-modal');

  document.getElementById('btn-qr-code')?.addEventListener('click', () => {
    if (!roomId) return;
    const inviteUrl = `${window.location.origin}/chat.html?room=${roomId}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(inviteUrl)}`;

    if (qrDisplay) {
      qrDisplay.innerHTML = `<img src="${qrApiUrl}" alt="Room QR Code" style="width:200px; height:200px; display:block; margin:0 auto; border-radius:8px;">`;
    }

    if (qrModal) {
      qrModal.classList.add('active');
    }

    if (copyQrBtn) {
      copyQrBtn.onclick = () => {
        copyToClipboard(inviteUrl, 'Room invite link copied to clipboard!');
      };
    }

    if (downloadQrBtn) {
      downloadQrBtn.onclick = async () => {
        try {
          const response = await fetch(qrApiUrl);
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = `mingling-room-${roomId}-qr.png`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(blobUrl);
          showToast('QR Code downloaded!', 'success');
        } catch (err) {
          showToast('Failed to download QR code image', 'error');
        }
      };
    }
  });

  closeQrBtn?.addEventListener('click', () => {
    qrModal?.classList.remove('active');
  });

  qrModal?.addEventListener('click', (e) => {
    if (e.target === qrModal) {
      qrModal.classList.remove('active');
    }
  });

  // 4. Save Conversation
  document.getElementById('btn-save-chat')?.addEventListener('click', async () => {
    try {
      const roomName = document.getElementById('room-header-name').textContent;
      const res = await fetch('/api/chats/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-token': sessionManager.getToken()
        },
        body: JSON.stringify({ roomId, title: roomName })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Conversation saved successfully to MongoDB!', 'success');
      } else {
        showToast(data.message || 'Could not save conversation', 'error');
      }
    } catch (err) {
      showToast('Failed to save chat', 'error');
    }
  });

  // 5. User Session Termination & Exit (for sidebar, header, and exit buttons)
  const endSessionElements = document.querySelectorAll('.btn-end-session, #sidebar-end-session, #btn-end-session-chat');
  endSessionElements.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      sessionManager.terminateSession(true);
    });
  });

  // File Upload Handler
  const fileInput = document.getElementById('file-upload-input');
  fileInput?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    showToast('Uploading file...', 'info');
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'x-session-token': sessionManager.getToken() },
        body: formData
      });
      const data = await res.json();
      if (data.success && data.data) {
        let msgType = 'file';
        if (file.type.startsWith('image/')) msgType = 'image';
        if (file.type.startsWith('audio/')) msgType = 'audio';

        socketService.sendMessage({
          roomId,
          content: `Shared file: ${file.name}`,
          type: msgType,
          fileUrl: data.data.url,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type
        });
        showToast('File uploaded and shared!', 'success');
      } else {
        showToast(data.message || 'File upload failed', 'error');
      }
    } catch (err) {
      showToast('File upload failed', 'error');
    }
  });
});
