/**
 * Message Service Layer
 * (messageService.js)
 */

const generateId = require('../utils/generateId');
const cacheManager = require('../config/redis');
const Message = require('../models/Message');

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

    // Store in Redis message cache list for room
    const roomMsgsKey = `room_messages:${roomId}`;
    const existing = (await cacheManager.get(roomMsgsKey)) || [];
    existing.push(messageData);
    // Keep max 200 recent messages in cache
    if (existing.length > 200) existing.shift();
    await cacheManager.set(roomMsgsKey, existing, 86400);

    // Save to Mongo if available
    if (Message.db.readyState === 1) {
      try {
        await Message.create(messageData);
      } catch (err) {
        console.warn('[MSG CREATE DB WARN]', err.message);
      }
    }

    return messageData;
  }

  async getRoomMessages(roomId) {
    const cached = await cacheManager.get(`room_messages:${roomId}`);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return cached;
    }

    try {
      const messages = await Message.find({ roomId, expiresAt: { $gt: new Date() } })
        .sort({ createdAt: 1 })
        .limit(100);
      return messages;
    } catch (err) {
      return [];
    }
  }

  async editMessage(messageId, senderSessionId, newContent) {
    let msg = await Message.findOne({ messageId });
    if (!msg) throw new Error('Message not found');
    if (msg.senderSessionId !== senderSessionId) throw new Error('Unauthorized edit');

    msg.content = newContent;
    msg.isEdited = true;
    await msg.save();

    // Sync cache
    const cached = await cacheManager.get(`room_messages:${msg.roomId}`);
    if (cached) {
      const updated = cached.map(m => m.messageId === messageId ? { ...m, content: newContent, isEdited: true } : m);
      await cacheManager.set(`room_messages:${msg.roomId}`, updated, 86400);
    }

    return msg.toObject();
  }

  async deleteMessage(messageId, senderSessionId) {
    let msg = await Message.findOne({ messageId });
    if (!msg) throw new Error('Message not found');
    if (msg.senderSessionId !== senderSessionId) throw new Error('Unauthorized delete');

    const roomId = msg.roomId;
    await Message.deleteOne({ messageId });

    // Sync cache
    const cached = await cacheManager.get(`room_messages:${roomId}`);
    if (cached) {
      const filtered = cached.filter(m => m.messageId !== messageId);
      await cacheManager.set(`room_messages:${roomId}`, filtered, 86400);
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
    return msg.toObject();
  }
}

module.exports = new MessageService();
