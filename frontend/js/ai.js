/**
 * Frontend AI Assistant Helper Module
 * (ai.js)
 */

import { sessionManager } from './session.js';
import { showToast, copyToClipboard } from './utils.js';

export async function requestAISummary(roomId) {
  if (!roomId) {
    showToast('No active room selected for AI summary', 'error');
    return;
  }

  // Ensure modal exists in DOM
  let modal = document.getElementById('ai-summary-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'ai-summary-modal';
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-box glass-card" style="max-width:560px; text-align:left;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-glass); padding-bottom:0.75rem; margin-bottom:1rem;">
          <h3 style="display:flex; align-items:center; gap:0.5rem; margin:0;"><i class="fa-solid fa-wand-magic-sparkles text-gradient"></i> AI Chat Summary</h3>
          <button id="close-ai-modal" class="btn btn-glass btn-icon btn-sm" style="width:28px; height:28px;"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div id="ai-modal-body" style="min-height:120px; font-size:0.95rem; line-height:1.6; color:var(--text-main);">
          <div style="text-align:center; padding:2rem 0; color:var(--text-muted);">
            <i class="fa-solid fa-circle-notch fa-spin" style="font-size:2rem; margin-bottom:0.75rem; color:var(--brand-primary);"></i>
            <p>Analyzing conversation history & generating AI summary...</p>
          </div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:0.75rem; border-top:1px solid var(--border-glass); padding-top:0.85rem; margin-top:1.25rem;">
          <button id="btn-copy-ai-summary" class="btn btn-glass btn-sm" style="display:none;"><i class="fa-solid fa-copy"></i> Copy Summary</button>
          <button id="btn-close-ai-modal" class="btn btn-secondary btn-sm">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Bind close handlers
    const closeModal = () => modal.classList.remove('active');
    modal.querySelector('#close-ai-modal')?.addEventListener('click', closeModal);
    modal.querySelector('#btn-close-ai-modal')?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  const modalBody = modal.querySelector('#ai-modal-body');
  const copyBtn = modal.querySelector('#btn-copy-ai-summary');

  if (copyBtn) copyBtn.style.display = 'none';
  if (modalBody) {
    modalBody.innerHTML = `
      <div style="text-align:center; padding:2rem 0; color:var(--text-muted);">
        <i class="fa-solid fa-circle-notch fa-spin" style="font-size:2rem; margin-bottom:0.75rem; color:var(--brand-primary);"></i>
        <p>Analyzing conversation history & generating AI summary...</p>
      </div>
    `;
  }

  modal.classList.add('active');

  try {
    const res = await fetch('/api/ai/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-token': sessionManager.getToken()
      },
      body: JSON.stringify({ roomId })
    });
    const data = await res.json();
    if (data.success && data.data && data.data.summary) {
      const formattedSummary = formatMarkdownSummary(data.data.summary);
      modalBody.innerHTML = formattedSummary;
      
      if (copyBtn) {
        copyBtn.style.display = 'inline-flex';
        copyBtn.onclick = () => {
          copyToClipboard(data.data.summary, 'AI Summary copied to clipboard!');
        };
      }
    } else {
      modalBody.innerHTML = `<p style="color:var(--color-error); text-align:center;"><i class="fa-solid fa-circle-exclamation"></i> ${data.message || 'Could not generate AI summary for this room.'}</p>`;
    }
  } catch (err) {
    modalBody.innerHTML = `<p style="color:var(--color-error); text-align:center;"><i class="fa-solid fa-circle-exclamation"></i> Failed to connect to AI summary service.</p>`;
  }
}

function formatMarkdownSummary(text) {
  if (!text) return '<p>No summary available.</p>';
  return text
    .replace(/^### (.*$)/gim, '<h4 style="margin-top:0.5rem; margin-bottom:0.5rem;">$1</h4>')
    .replace(/^\* (.*$)/gim, '• $1<br>')
    .replace(/^- (.*$)/gim, '&nbsp;&nbsp;- $1<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}
