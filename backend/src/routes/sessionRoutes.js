/**
 * Session Routes
 * (sessionRoutes.js)
 */

const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { authenticateSession } = require('../middleware/auth');
const { validateNickname } = require('../validators/sessionValidator');
const { strictLimiter } = require('../middleware/rateLimiter');

// POST /api/session/create -> Create anonymous session
router.post('/create', strictLimiter, validateNickname, sessionController.createSession);

// GET /api/session -> Get current active session
router.get('/', authenticateSession, sessionController.getSession);

// PATCH /api/session -> Update nickname
router.patch('/', authenticateSession, validateNickname, sessionController.updateSession);

// DELETE /api/session -> Terminate session
router.delete('/', authenticateSession, sessionController.deleteSession);

module.exports = router;
