/**
 * Main Application Bootstrap & Theme Manager
 * (app.js)
 */

import { sessionManager } from './session.js';

export function initThemeToggle() {
  const savedTheme = localStorage.getItem('mingling_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const themeBtns = document.querySelectorAll('#theme-toggle-btn, .theme-toggle-btn');
  themeBtns.forEach(btn => {
    const updateIcon = (theme) => {
      btn.innerHTML = theme === 'light' 
        ? '<i class="fa-solid fa-sun" style="color:#ff8c00;"></i>' 
        : '<i class="fa-solid fa-moon"></i>';
    };
    updateIcon(savedTheme);

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const current = document.documentElement.getAttribute('data-theme');
      const nextTheme = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('mingling_theme', nextTheme);
      updateIcon(nextTheme);
    });
  });
}

export function initEndSessionButtons() {
  const endBtns = document.querySelectorAll('#btn-end-session, .btn-end-session');
  endBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      sessionManager.terminateSession(true);
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  initThemeToggle();
  initEndSessionButtons();
  try {
    const session = await sessionManager.initSession();
    console.log('[MINGLING APP] Active session:', session.sessionId, session.nickname);
  } catch (err) {
    console.warn('[MINGLING APP] Session init fallback');
  }
});
