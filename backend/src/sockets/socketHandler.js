/**
 * Central Socket.IO Handler
 * (socketHandler.js)
 */

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const registerRoomHandlers = require('./roomSocket');
const registerMessageHandlers = require('./messageSocket');

function initializeSockets(io) {
  // Middleware for socket authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers['x-session-token'];
    if (!token) {
      return next(new Error('Authentication error: Token required'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[SOCKET CONNECT] User ${socket.user.nickname} (${socket.user.sessionId}) connected. Socket ID: ${socket.id}`);

    // Register modular event listeners
    registerRoomHandlers(io, socket);
    registerMessageHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`[SOCKET DISCONNECT] User ${socket.user.nickname} disconnected.`);
      if (socket.roomId) {
        io.to(socket.roomId).emit('user_offline', {
          sessionId: socket.user.sessionId,
          nickname: socket.user.nickname
        });
      }
    });
  });
}

module.exports = initializeSockets;
