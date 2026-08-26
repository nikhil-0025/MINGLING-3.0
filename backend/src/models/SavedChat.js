/**
 * SavedChat Mongoose Model
 * (SavedChat.js)
 */

const mongoose = require('mongoose');

const savedChatSchema = new mongoose.Schema({
  savedChatId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  originalRoomId: {
    type: String,
    required: true
  },
  messages: [{
    messageId: String,
    senderNickname: String,
    senderAvatar: String,
    content: String,
    type: String,
    fileUrl: String,
    fileName: String,
    createdAt: Date
  }],
  savedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SavedChat', savedChatSchema);
