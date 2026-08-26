/**
 * Notification Service Layer
 * (notificationService.js)
 */

const generateId = require('../utils/generateId');
const Notification = require('../models/Notification');

class NotificationService {
  async createNotification(sessionId, type, title, body, link = '#') {
    const notificationId = generateId('notif');
    return await Notification.create({
      notificationId,
      sessionId,
      type,
      title,
      body,
      link,
      isRead: false
    });
  }

  async getUserNotifications(sessionId) {
    return await Notification.find({ sessionId }).sort({ createdAt: -1 }).limit(30);
  }

  async markAsRead(notificationId, sessionId) {
    await Notification.updateOne({ notificationId, sessionId }, { isRead: true });
  }
}

module.exports = new NotificationService();
