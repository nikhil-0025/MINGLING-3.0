/**
 * Room Controller
 * (roomController.js)
 */

const roomService = require('../services/roomService');

class RoomController {
  async createRoom(req, res, next) {
    try {
      const sessionUser = req.sessionUser;
      const { name, isPrivate, password, expiresInHours, maxParticipants } = req.body;

      const room = await roomService.createRoom({
        name,
        creatorSessionId: sessionUser.sessionId,
        isPrivate,
        password,
        expiresInHours,
        maxParticipants,
        nickname: sessionUser.nickname,
        avatar: sessionUser.avatar
      });

      res.status(201).json({
        success: true,
        message: 'Room created successfully',
        data: room
      });
    } catch (err) {
      next(err);
    }
  }

  async getPublicRooms(req, res, next) {
    try {
      const rooms = await roomService.listPublicRooms();
      res.status(200).json({
        success: true,
        data: rooms
      });
    } catch (err) {
      next(err);
    }
  }

  async getRoomDetails(req, res, next) {
    try {
      const { id } = req.params;
      const room = await roomService.getRoom(id);

      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found or expired'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          roomId: room.roomId,
          roomCode: room.roomCode,
          name: room.name,
          isPrivate: room.isPrivate,
          hasPassword: Boolean(room.passwordHash),
          participants: room.participants,
          expiresAt: room.expiresAt
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async joinRoom(req, res, next) {
    try {
      const sessionUser = req.sessionUser;
      const { roomIdentifier, password } = req.body;

      if (!roomIdentifier) {
        return res.status(400).json({
          success: false,
          message: 'Room ID or Room Code is required'
        });
      }

      const joinedRoom = await roomService.joinRoom(roomIdentifier, password, sessionUser);

      res.status(200).json({
        success: true,
        message: 'Joined room successfully',
        data: joinedRoom
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  }

  async deleteRoom(req, res, next) {
    try {
      const { id } = req.params;
      const sessionUser = req.sessionUser;

      await roomService.deleteRoom(id, sessionUser.sessionId);

      const io = req.app.get('io');
      if (io) {
        io.to(id).emit('room_deleted', { roomId: id, message: 'This room has been ended and vanished from the database.' });
      }

      res.status(200).json({
        success: true,
        message: 'Room deleted and vanished from database successfully'
      });
    } catch (err) {
      res.status(403).json({
        success: false,
        message: err.message
      });
    }
  }
}

module.exports = new RoomController();
