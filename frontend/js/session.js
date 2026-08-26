/**
 * Client Session Manager Module
 * (session.js)
 */

import { generateRandomUsername, generateAvatarSVG, showToast } from './utils.js';

const SESSION_TOKEN_KEY = 'mingling_session_token';
const SESSION_DATA_KEY = 'mingling_session_data';

export class SessionManager {
  constructor() {
    this.token = localStorage.getItem(SESSION_TOKEN_KEY) || null;
    this.session = JSON.parse(localStorage.getItem(SESSION_DATA_KEY) || 'null');
  }

  async initSession(nickname = null) {
    if (this.token && this.session) {
      // Validate session with backend
      try {
        const res = await fetch('/api/session', {
          headers: { 'x-session-token': this.token }
        });
        const data = await res.json();
        if (data.success && data.data) {
          this.session = data.data;
          this.saveState();
          return this.session;
        }
      } catch (err) {
        console.warn('[SESSION INIT] Connection error, using cached session state');
      }
    }

    // Create fresh temporary session
    return await this.createFreshSession(nickname);
  }

  async createFreshSession(nickname = null) {
    try {
      const res = await fetch('/api/session/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nickname || generateRandomUsername() })
      });

      const data = await res.json();
      if (data.success && data.data) {
        this.token = data.data.token;
        this.session = data.data;
        this.saveState();
        return this.session;
      } else {
        throw new Error(data.message || 'Failed to create temporary session');
      }
    } catch (err) {
      console.error('[SESSION CREATE ERR]', err);
      // Client offline fallback
      this.token = `local_token_${Date.now()}`;
      const defaultName = nickname || generateRandomUsername();
      this.session = {
        sessionId: `sess_local_${Date.now()}`,
        nickname: defaultName,
        avatar: generateAvatarSVG(defaultName),
        token: this.token
      };
      this.saveState();
      return this.session;
    }
  }

  async updateNickname(newNickname) {
    if (!newNickname || newNickname.trim().length < 2) {
      showToast('Nickname must be at least 2 characters', 'error');
      return null;
    }

    try {
      const res = await fetch('/api/session', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-session-token': this.token
        },
        body: JSON.stringify({ nickname: newNickname.trim() })
      });

      const data = await res.json();
      if (data.success && data.data) {
        this.session.nickname = data.data.nickname;
        this.session.avatar = data.data.avatar;
        this.saveState();
        showToast('Nickname updated successfully', 'success');
        return this.session;
      }
    } catch (err) {
      showToast('Failed to update nickname on server', 'error');
    }

    this.session.nickname = newNickname.trim();
    this.session.avatar = generateAvatarSVG(newNickname);
    this.saveState();
    return this.session;
  }

  async terminateSession(confirmFirst = true) {
    if (confirmFirst) {
      const confirmed = window.confirm('Are you sure you want to end your session? Your temporary session, anonymous identity, and room connections will be completely purged.');
      if (!confirmed) return false;
    }

    showToast('Ending session and purging temporary data...', 'info');

    try {
      if (this.token) {
        await fetch('/api/session', {
          method: 'DELETE',
          headers: { 'x-session-token': this.token }
        });
      }
    } catch (err) {
      console.warn('[SESSION TERMINATE SERVER WARN]', err);
    } finally {
      this.clearSession();
      showToast('Session terminated successfully!', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 400);
    }

    return true;
  }

  saveState() {
    if (this.token) localStorage.setItem(SESSION_TOKEN_KEY, this.token);
    if (this.session) localStorage.setItem(SESSION_DATA_KEY, JSON.stringify(this.session));
  }

  clearSession() {
    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(SESSION_DATA_KEY);
    this.token = null;
    this.session = null;
  }

  getToken() {
    return this.token;
  }

  getSession() {
    return this.session;
  }
}

export const sessionManager = new SessionManager();
