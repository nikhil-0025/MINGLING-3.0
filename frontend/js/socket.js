/**
 * Client Socket.IO Interface Module
 * (socket.js)
 */

import { sessionManager } from './session.js';
import { showToast } from './utils.js';

export class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket && this.socket.connected) return this.socket;

    const token = sessionManager.getToken();
    if (!token) return null;

    // Load socket.io client script dynamically if needed or from global io
    if (typeof window.io === 'undefined') {
      console.warn('[SOCKET] Socket.IO client library not loaded yet');
      return null;
    }

    this.socket = window.io({
      auth: { token },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      this.connected = true;
      console.log('[SOCKET] Connected to real-time server with socket ID:', this.socket.id);
      this.trigger('connect', { socketId: this.socket.id });
    });

    this.socket.on('disconnect', (reason) => {
      this.connected = false;
      console.warn('[SOCKET] Disconnected:', reason);
      showToast('Connection lost. Reconnecting...', 'error');
      this.trigger('disconnect', { reason });
    });

    this.socket.on('error', (err) => {
      showToast(err.message || 'Socket error', 'error');
    });

    // Proxy core event handlers
    const events = [
      'user_online', 'user_offline', 'receive_message',
      'typing', 'stop_typing', 'message_delivered', 'message_seen',
      'message_edit', 'message_delete', 'message_reaction',
      'room_updated', 'notification', 'room_joined', 'room_deleted'
    ];

    events.forEach(evt => {
      this.socket.on(evt, (data) => this.trigger(evt, data));
    });

    return this.socket;
  }

  joinRoom(roomId, password = null) {
    if (!this.socket) this.connect();
    if (this.socket) {
      this.socket.emit('join_room', { roomId, password });
    }
  }

  leaveRoom(roomId) {
    if (this.socket) {
      this.socket.emit('leave_room', { roomId });
    }
  }

  sendMessage(payload) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('send_message', payload);
    }
  }

  sendTyping(roomId) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('typing', { roomId });
    }
  }

  sendStopTyping(roomId) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('stop_typing', { roomId });
    }
  }

  on(event, fn) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(fn);
  }

  off(event, fn) {
    if (this.listeners.has(event)) {
      const list = this.listeners.get(event).filter(cb => cb !== fn);
      this.listeners.set(event, list);
    }
  }

  trigger(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(fn => fn(data));
    }
  }
}

export const socketService = new SocketService();
