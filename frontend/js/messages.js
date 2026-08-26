/**
 * Frontend Message Component Renderer Module
 * (messages.js)
 */

import { escapeHTML, formatTime } from './utils.js';

export function renderMessage(msg, currentSessionId) {
  const isOwn = msg.senderSessionId === currentSessionId;
  const wrapper = document.createElement('div');
  wrapper.className = `msg-wrapper ${isOwn ? 'own' : 'other'}`;
  wrapper.setAttribute('data-msg-id', msg.messageId);

  let mediaHTML = '';
  if (msg.type === 'image' && msg.fileUrl) {
    mediaHTML = `<div style="margin-top:0.5rem;"><img src="${escapeHTML(msg.fileUrl)}" style="max-width:100%; max-height:260px; border-radius:8px;"></div>`;
  } else if (msg.type === 'file' && msg.fileUrl) {
    mediaHTML = `<div style="margin-top:0.5rem;"><a href="${escapeHTML(msg.fileUrl)}" target="_blank" class="btn btn-glass btn-sm"><i class="fa-solid fa-file-arrow-down"></i> ${escapeHTML(msg.fileName || 'Download Attachment')}</a></div>`;
  } else if (msg.type === 'audio' && msg.fileUrl) {
    mediaHTML = `<div style="margin-top:0.5rem;"><audio controls src="${escapeHTML(msg.fileUrl)}" style="max-width:100%;"></audio></div>`;
  }

  const reactionsHTML = msg.reactions && msg.reactions.length > 0
    ? `<div class="msg-reactions">${msg.reactions.map(r => `<span class="reaction-badge" title="${escapeHTML(r.nickname)}">${r.emoji}</span>`).join('')}</div>`
    : '';

  wrapper.innerHTML = `
    <img src="${msg.senderAvatar || 'assets/icons/default-avatar.svg'}" class="msg-avatar" alt="${escapeHTML(msg.senderNickname)}">
    <div class="msg-content-box">
      <div class="msg-sender-name">${escapeHTML(msg.senderNickname)}</div>
      <div class="msg-bubble">
        ${escapeHTML(msg.content)}
        ${mediaHTML}
      </div>
      <div class="msg-meta">
        <span>${formatTime(msg.createdAt)}</span>
        ${msg.isEdited ? '<span>(edited)</span>' : ''}
        ${isOwn ? `<span class="msg-status">${msg.status === 'seen' ? '✓✓' : '✓'}</span>` : ''}
      </div>
      ${reactionsHTML}
    </div>
  `;

  return wrapper;
}
