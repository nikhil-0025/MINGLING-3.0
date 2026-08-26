/**
 * AI Routes
 * (aiRoutes.js)
 */

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateSession } = require('../middleware/auth');

// POST /api/ai/summarize -> Summarize room chat
router.post('/summarize', authenticateSession, aiController.summarizeRoom);

// POST /api/ai/grammar -> Fix grammar
router.post('/grammar', authenticateSession, aiController.grammarCheck);

module.exports = router;
