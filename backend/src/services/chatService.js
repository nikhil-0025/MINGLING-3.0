/**
 * Saved Chat Service Layer
 * (chatService.js)
 */

const generateId = require('../utils/generateId');
const SavedChat = require('../models/SavedChat');
const Message = require('../models/Message');

class ChatService {
  async saveChat(sessionId, roomId, title = 'Saved Conversation') {
    const savedChatId = generateId('saved');

    // Fetch messages for this room
    const messages = await Message.find({ roomId }).sort({ createdAt: 1 });

    const messageSnapshots = messages.map(m => ({
      messageId: m.messageId,
      senderNickname: m.senderNickname,
      senderAvatar: m.senderAvatar,
      content: m.content,
      type: m.type,
      fileUrl: m.fileUrl,
      fileName: m.fileName,
      createdAt: m.createdAt
    }));

    const savedDoc = await SavedChat.create({
      savedChatId,
      sessionId,
      title: title || 'Saved Room Chat',
      originalRoomId: roomId,
      messages: messageSnapshots,
      savedAt: new Date()
    });

    return savedDoc;
  }

  async getSavedChats(sessionId) {
    return await SavedChat.find({ sessionId }).sort({ savedAt: -1 });
  }

  async getSavedChatById(savedChatId, sessionId) {
    const chat = await SavedChat.findOne({ savedChatId, sessionId });
    if (!chat) throw new Error('Saved chat not found');
    return chat;
  }

  async deleteSavedChat(savedChatId, sessionId) {
    await SavedChat.deleteOne({ savedChatId, sessionId });
  }
}

module.exports = new ChatService();
