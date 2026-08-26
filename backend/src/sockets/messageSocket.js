/**
 * Message Socket Event Handlers
 * (messageSocket.js)
 */

const messageService = require('../services/messageService');

function registerMessageHandlers(io, socket) {
  // Send Message
  socket.on('send_message', async (data) => {
    try {
      const { roomId, content, type, fileUrl, fileName, fileSize, mimeType, replyToMessageId } = data;
      const user = socket.user;

      if (!roomId) return socket.emit('error', { message: 'Room ID is required' });

      const msg = await messageService.createMessage({
        roomId,
        senderSessionId: user.sessionId,
        senderNickname: user.nickname,
        senderAvatar: user.avatar,
        content,
        type,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        replyToMessageId
      });

      // Broadcast to room
      io.to(roomId).emit('receive_message', msg);
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  // Typing Indicators
  socket.on('typing', (data) => {
    const roomId = data.roomId || socket.roomId;
    if (roomId) {
      socket.to(roomId).emit('typing', {
        sessionId: socket.user.sessionId,
        nickname: socket.user.nickname
      });
    }
  });

  socket.on('stop_typing', (data) => {
    const roomId = data.roomId || socket.roomId;
    if (roomId) {
      socket.to(roomId).emit('stop_typing', {
        sessionId: socket.user.sessionId,
        nickname: socket.user.nickname
      });
    }
  });

  // Edit & Delete
  socket.on('message_edit', async (data) => {
    try {
      const { messageId, newContent } = data;
      const updated = await messageService.editMessage(messageId, socket.user.sessionId, newContent);
      io.to(updated.roomId).emit('message_edit', updated);
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('message_delete', async (data) => {
    try {
      const { messageId } = data;
      const result = await messageService.deleteMessage(messageId, socket.user.sessionId);
      io.to(result.roomId).emit('message_delete', { messageId });
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  // Reactions
  socket.on('message_reaction', async (data) => {
    try {
      const { messageId, emoji } = data;
      const updated = await messageService.toggleReaction(messageId, socket.user, emoji);
      io.to(updated.roomId).emit('message_reaction', updated);
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  // Status updates
  socket.on('message_seen', (data) => {
    const { roomId, messageId } = data;
    if (roomId) {
      socket.to(roomId).emit('message_seen', { messageId, seenBy: socket.user.sessionId });
    }
  });
}

module.exports = registerMessageHandlers;
