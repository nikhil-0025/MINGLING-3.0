/**
 * Frontend Notification Sound & Toast Manager
 * (notifications.js)
 */

import { showToast } from './utils.js';

export class NotificationManager {
  constructor() {
    this.soundEnabled = localStorage.getItem('mingling_sound_enabled') !== 'false';
    this.audioContext = null;
  }

  playNotificationSound() {
    if (!this.soundEnabled) return;
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.audioContext.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start();
      osc.stop(this.audioContext.currentTime + 0.15);
    } catch (e) {
      // Audio autoplay policy
    }
  }

  notifyMessage(senderNickname, content) {
    this.playNotificationSound();
    showToast(`${senderNickname}: ${content.substring(0, 40)}`, 'info');
  }

  toggleSound(enabled) {
    this.soundEnabled = enabled;
    localStorage.setItem('mingling_sound_enabled', enabled ? 'true' : 'false');
  }
}

export const notificationManager = new NotificationManager();
