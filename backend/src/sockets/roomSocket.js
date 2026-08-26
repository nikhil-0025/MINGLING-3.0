/**
 * Room Socket Event Handlers
 * (roomSocket.js)
 */

const roomService = require('../services/roomService');

function registerRoomHandlers(io, socket) {
  // Join Room
  socket.on('join_room', async (data) => {
    try {
      const { roomId, password } = data;
      const user = socket.user;

      if (!roomId) return socket.emit('error', { message: 'Room ID is required' });

      const room = await roomService.joinRoom(roomId, password, user);

      socket.join(roomId);
      socket.roomId = roomId;

      // Broadcast user online event to room members
      io.to(roomId).emit('user_online', {
        sessionId: user.sessionId,
        nickname: user.nickname,
        avatar: user.avatar,
        participants: room.participants
      });

      socket.emit('room_joined', {
        success: true,
        room
      });
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  // Leave Room
  socket.on('leave_room', (data) => {
    const roomId = data?.roomId || socket.roomId;
    if (roomId) {
      socket.leave(roomId);
      io.to(roomId).emit('user_offline', {
        sessionId: socket.user?.sessionId,
        nickname: socket.user?.nickname
      });
      delete socket.roomId;
    }
  });
}

module.exports = registerRoomHandlers;
