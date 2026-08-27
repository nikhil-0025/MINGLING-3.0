/**
 * Message Service Layer
 * (messageService.js)
 */

const generateId = require('../utils/generateId');
const Message = require('../models/Message');

// In-memory message store per room for instant real-time access
const memoryMessages = new Map();

class MessageService {
  async createMessage({ roomId, senderSessionId, senderNickname, senderAvatar, content = '', type = 'text', fileUrl = null, fileName = null, fileSize = 0, mimeType = null, replyToMessageId = null }) {
    const messageId = generateId('msg');
    const expiresAt = new Date(Date.now() + (24 * 3600 * 1000)); // Default 24h expiration

    const messageData = {
      messageId,
      roomId,
      senderSessionId,
      senderNickname,
      senderAvatar,
      content,
      type,
      fileUrl,
      fileName,
      fileSize,
      mimeType,
      replyToMessageId,
      reactions: [],
      status: 'sent',
      isEdited: false,
      expiresAt,
      createdAt: new Date()
    };

    // Store in memory cache for room
    if (!memoryMessages.has(roomId)) {
      memoryMessages.set(roomId, []);
    }
    const roomMsgs = memoryMessages.get(roomId);
    roomMsgs.push(messageData);
    if (roomMsgs.length > 200) roomMsgs.shift();

    // Save to MongoDB Atlas
    try {
      await Message.create(messageData);
    } catch (err) {
      console.warn('[MSG CREATE DB WARN]', err.message);
    }

    return messageData;
  }

  async getRoomMessages(roomId) {
    try {
      const messages = await Message.find({ roomId, expiresAt: { $gt: new Date() } })
        .sort({ createdAt: 1 })
        .limit(100);
      if (messages && messages.length > 0) {
        const msgObjs = messages.map(m => m.toObject ? m.toObject() : m);
        memoryMessages.set(roomId, msgObjs);
        return msgObjs;
      }
    } catch (err) {
      console.warn('[MSG GET DB WARN]', err.message);
    }

    if (memoryMessages.has(roomId)) {
      return memoryMessages.get(roomId);
    }

    return [];
  }

  async editMessage(messageId, senderSessionId, newContent) {
    let msg = await Message.findOne({ messageId });
    if (!msg) throw new Error('Message not found');
    if (msg.senderSessionId !== senderSessionId) throw new Error('Unauthorized edit');

    msg.content = newContent;
    msg.isEdited = true;
    await msg.save();

    // Sync memory
    if (memoryMessages.has(msg.roomId)) {
      const updated = memoryMessages.get(msg.roomId).map(m => m.messageId === messageId ? { ...m, content: newContent, isEdited: true } : m);
      memoryMessages.set(msg.roomId, updated);
    }

    return msg.toObject();
  }

  async deleteMessage(messageId, senderSessionId) {
    let msg = await Message.findOne({ messageId });
    if (!msg) throw new Error('Message not found');
    if (msg.senderSessionId !== senderSessionId) throw new Error('Unauthorized delete');

    const roomId = msg.roomId;
    await Message.deleteOne({ messageId });

    // Sync memory
    if (memoryMessages.has(roomId)) {
      const filtered = memoryMessages.get(roomId).filter(m => m.messageId !== messageId);
      memoryMessages.set(roomId, filtered);
    }

    return { messageId, roomId };
  }

  async toggleReaction(messageId, user, emoji) {
    let msg = await Message.findOne({ messageId });
    if (!msg) throw new Error('Message not found');

    const existingIdx = msg.reactions.findIndex(r => r.sessionId === user.sessionId && r.emoji === emoji);
    if (existingIdx > -1) {
      msg.reactions.splice(existingIdx, 1);
    } else {
      msg.reactions.push({
        emoji,
        sessionId: user.sessionId,
        nickname: user.nickname
      });
    }

    await msg.save();

    // Sync memory
    if (memoryMessages.has(msg.roomId)) {
      const updated = memoryMessages.get(msg.roomId).map(m => m.messageId === messageId ? msg.toObject() : m);
      memoryMessages.set(msg.roomId, updated);
    }

    return msg.toObject();
  }
}

module.exports = new MessageService();
