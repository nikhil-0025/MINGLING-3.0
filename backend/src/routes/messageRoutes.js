/**
 * Message Routes
 * (messageRoutes.js)
 */

const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateSession } = require('../middleware/auth');
const { validateMessage } = require('../validators/messageValidator');

// GET /api/rooms/:id/messages -> Handled via sub-router or direct route
router.get('/room/:id', authenticateSession, messageController.getRoomMessages);

// POST /api/messages -> Send message via REST
router.post('/', authenticateSession, validateMessage, messageController.sendMessage);

// PATCH /api/messages/:id -> Edit message
router.patch('/:id', authenticateSession, messageController.editMessage);

// DELETE /api/messages/:id -> Delete message
router.delete('/:id', authenticateSession, messageController.deleteMessage);

module.exports = router;
