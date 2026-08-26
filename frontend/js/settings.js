/**
 * Settings UI Controller
 * (settings.js)
 */

import { sessionManager } from './session.js';
import { notificationManager } from './notifications.js';
import { showToast } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  const session = await sessionManager.initSession();

  // Populate values
  const nicknameInput = document.getElementById('setting-nickname');
  if (nicknameInput) nicknameInput.value = session.nickname;

  // Save nickname
  document.getElementById('btn-update-nickname')?.addEventListener('click', async () => {
    const val = nicknameInput.value.trim();
    if (val) {
      await sessionManager.updateNickname(val);
    }
  });

  // Theme switch
  const themeSelect = document.getElementById('setting-theme');
  const currentTheme = localStorage.getItem('mingling_theme') || 'dark';
  if (themeSelect) {
    themeSelect.value = currentTheme;
    document.documentElement.setAttribute('data-theme', currentTheme);

    themeSelect.addEventListener('change', (e) => {
      const selected = e.target.value;
      document.documentElement.setAttribute('data-theme', selected);
      localStorage.setItem('mingling_theme', selected);
      showToast(`Theme changed to ${selected} mode`, 'success');
    });
  }

  // Sound toggle
  const soundCheck = document.getElementById('setting-sound');
  if (soundCheck) {
    soundCheck.checked = notificationManager.soundEnabled;
    soundCheck.addEventListener('change', (e) => {
      notificationManager.toggleSound(e.target.checked);
      showToast(`Sound alerts ${e.target.checked ? 'enabled' : 'disabled'}`, 'info');
    });
  }

  // Terminate & Clear Session
  document.getElementById('btn-clear-session')?.addEventListener('click', (e) => {
    e.preventDefault();
    sessionManager.terminateSession(true);
  });
});
