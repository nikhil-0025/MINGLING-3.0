/**
 * Saved Chat Routes
 * (chatRoutes.js)
 */

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateSession } = require('../middleware/auth');

// POST /api/chats/save -> Save temporary room to MongoDB
router.post('/save', authenticateSession, chatController.saveChat);

// GET /api/chats/saved -> Fetch list of saved chats
router.get('/saved', authenticateSession, chatController.getSavedChats);

// GET /api/chats/saved/:id -> Get single saved chat
router.get('/saved/:id', authenticateSession, chatController.getSavedChatById);

// DELETE /api/chats/saved/:id -> Delete saved chat
router.delete('/saved/:id', authenticateSession, chatController.deleteSavedChat);

module.exports = router;
