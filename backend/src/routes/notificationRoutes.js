/**
 * Notification Routes
 * (notificationRoutes.js)
 */

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateSession } = require('../middleware/auth');

// GET /api/notifications -> Get user notifications
router.get('/', authenticateSession, notificationController.getNotifications);

// PATCH /api/notifications/:id/read -> Mark notification read
router.patch('/:id/read', authenticateSession, notificationController.markRead);

module.exports = router;
