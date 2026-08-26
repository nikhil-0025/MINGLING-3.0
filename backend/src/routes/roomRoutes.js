/**
 * Room Routes
 * (roomRoutes.js)
 */

const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { authenticateSession } = require('../middleware/auth');
const { validateCreateRoom } = require('../validators/roomValidator');

// POST /api/rooms -> Create a new room
router.post('/', authenticateSession, validateCreateRoom, roomController.createRoom);

// GET /api/rooms -> List public rooms
router.get('/', roomController.getPublicRooms);

// GET /api/rooms/:id -> Get room details
router.get('/:id', authenticateSession, roomController.getRoomDetails);

// POST /api/rooms/join -> Join room by code or ID
router.post('/join', authenticateSession, roomController.joinRoom);

// DELETE /api/rooms/:id -> Delete room
router.delete('/:id', authenticateSession, roomController.deleteRoom);

module.exports = router;
