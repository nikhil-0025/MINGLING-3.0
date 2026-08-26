/**
 * Notification Controller
 * (notificationController.js)
 */

const notificationService = require('../services/notificationService');

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const sessionUser = req.sessionUser;
      const notifs = await notificationService.getUserNotifications(sessionUser.sessionId);

      res.status(200).json({
        success: true,
        data: notifs
      });
    } catch (err) {
      next(err);
    }
  }

  async markRead(req, res, next) {
    try {
      const { id } = req.params;
      const sessionUser = req.sessionUser;

      await notificationService.markAsRead(id, sessionUser.sessionId);

      res.status(200).json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationController();
