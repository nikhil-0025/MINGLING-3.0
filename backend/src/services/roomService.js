/**
 * Room Service Layer
 * (roomService.js)
 */

const bcrypt = require('bcryptjs');
const generateId = require('../utils/generateId');
const Room = require('../models/Room');
const Message = require('../models/Message');

// In-memory room repository for zero-latency operations
const memoryRooms = new Map();
const memoryRoomCodes = new Map();

class RoomService {
  async createRoom({ name, creatorSessionId, isPrivate = false, password = null, expiresInHours = 24, maxParticipants = 50, nickname = 'Anonymous', avatar = '' }) {
    const roomId = generateId('room');
    const roomCode = `MNGL-${Math.floor(1000 + Math.random() * 9000)}`;

    let passwordHash = null;
    if (password && password.trim()) {
      passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const expiresAt = new Date(Date.now() + (expiresInHours * 3600 * 1000));

    const roomData = {
      roomId,
      roomCode,
      name: name.trim(),
      creatorSessionId,
      participants: [{
        sessionId: creatorSessionId,
        nickname,
        avatar,
        joinedAt: new Date()
      }],
      isPrivate: Boolean(isPrivate),
      passwordHash,
      maxParticipants: Number(maxParticipants) || 50,
      expiresAt,
      createdAt: new Date()
    };

    // Store in memory for instant operations
    memoryRooms.set(roomId, roomData);
    memoryRoomCodes.set(roomCode, roomId);

    // Save to Mongo if active
    if (Room.db.readyState === 1) {
      try {
        await Room.create(roomData);
      } catch (err) {
        console.warn('[ROOM CREATE DB WARN]', err.message);
      }
    }

    return {
      roomId,
      roomCode,
      name: roomData.name,
      isPrivate: roomData.isPrivate,
      expiresAt,
      participantCount: 1
    };
  }

  async getRoom(roomId) {
    if (memoryRooms.has(roomId)) {
      return memoryRooms.get(roomId);
    }

    if (Room.db.readyState === 1) {
      try {
        const dbRoom = await Room.findOne({ roomId });
        if (dbRoom) {
          const roomObj = dbRoom.toObject();
          memoryRooms.set(roomId, roomObj);
          if (roomObj.roomCode) memoryRoomCodes.set(roomObj.roomCode, roomId);
          return roomObj;
        }
      } catch (err) {
        console.warn('[ROOM GET DB WARN]', err.message);
      }
    }
    return null;
  }

  async getRoomByCode(roomCode) {
    const code = roomCode.toUpperCase();
    if (memoryRoomCodes.has(code)) {
      return await this.getRoom(memoryRoomCodes.get(code));
    }

    if (Room.db.readyState === 1) {
      try {
        const dbRoom = await Room.findOne({ roomCode: code });
        if (dbRoom) {
          const roomObj = dbRoom.toObject();
          memoryRooms.set(roomObj.roomId, roomObj);
          memoryRoomCodes.set(code, roomObj.roomId);
          return roomObj;
        }
      } catch (err) {
        console.warn('[ROOM CODE GET WARN]', err.message);
      }
    }
    return null;
  }

  async listPublicRooms() {
    const now = new Date();
    // Return memory rooms if active
    const activeMemRooms = Array.from(memoryRooms.values())
      .filter(r => !r.isPrivate && new Date(r.expiresAt) > now)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (activeMemRooms.length > 0) {
      return activeMemRooms;
    }

    if (Room.db.readyState === 1) {
      try {
        const rooms = await Room.find({ isPrivate: false, expiresAt: { $gt: now } })
          .select('roomId roomCode name participants expiresAt createdAt')
          .sort({ createdAt: -1 })
          .limit(20);
        return rooms;
      } catch (err) {
        return [];
      }
    }
    return [];
  }

  async joinRoom(roomIdentifier, password = null, sessionUser) {
    let room = await this.getRoom(roomIdentifier);
    if (!room) {
      room = await this.getRoomByCode(roomIdentifier);
    }

    if (!room) throw new Error('Room not found or has expired');

    if (new Date() > new Date(room.expiresAt)) {
      throw new Error('Room has expired');
    }

    if (room.isPrivate && room.passwordHash) {
      if (!password) throw new Error('Password required for private room');
      const isMatch = await bcrypt.compare(password, room.passwordHash);
      if (!isMatch) throw new Error('Invalid room password');
    }

    // Add participant if not already present
    const exists = room.participants.some(p => p.sessionId === sessionUser.sessionId);
    if (!exists) {
      if (room.participants.length >= room.maxParticipants) {
        throw new Error('Room has reached maximum participant capacity');
      }
      room.participants.push({
        sessionId: sessionUser.sessionId,
        nickname: sessionUser.nickname,
        avatar: sessionUser.avatar,
        joinedAt: new Date()
      });

      memoryRooms.set(room.roomId, room);

      if (Room.db.readyState === 1) {
        try {
          await Room.updateOne({ roomId: room.roomId }, { participants: room.participants });
        } catch (err) {
          console.warn('[ROOM JOIN DB WARN]', err.message);
        }
      }
    }

    return {
      roomId: room.roomId,
      roomCode: room.roomCode,
      name: room.name,
      isPrivate: room.isPrivate,
      participants: room.participants,
      expiresAt: room.expiresAt
    };
  }

  async deleteRoom(roomId, sessionId) {
    const room = await this.getRoom(roomId);
    if (!room) throw new Error('Room not found');

    const isParticipant = room.participants.some(p => p.sessionId === sessionId) || room.creatorSessionId === sessionId;
    if (!isParticipant) {
      throw new Error('Unauthorized: Only room participants can delete the room');
    }

    memoryRooms.delete(roomId);
    if (room.roomCode) {
      memoryRoomCodes.delete(room.roomCode);
    }

    if (Room.db.readyState === 1) {
      try {
        await Room.deleteOne({ roomId });
        await Message.deleteMany({ roomId });
      } catch (err) {
        console.warn('[ROOM DEL DB WARN]', err.message);
      }
    }
  }
}

module.exports = new RoomService();
