/**
 * Upload Routes
 * (uploadRoutes.js)
 */

const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { authenticateSession } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/uploadValidation');

// POST /api/upload -> Upload single file/media
router.post('/', authenticateSession, uploadMiddleware.single('file'), uploadController.handleFileUpload);

module.exports = router;
