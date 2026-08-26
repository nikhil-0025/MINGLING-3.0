/**
 * Message Mongoose Model
 * (Message.js)
 */

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  messageId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  roomId: {
    type: String,
    required: true,
    index: true
  },
  senderSessionId: {
    type: String,
    required: true
  },
  senderNickname: {
    type: String,
    required: true
  },
  senderAvatar: {
    type: String
  },
  content: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'audio', 'video', 'system'],
    default: 'text'
  },
  fileUrl: {
    type: String,
    default: null
  },
  fileName: {
    type: String,
    default: null
  },
  fileSize: {
    type: Number,
    default: 0
  },
  mimeType: {
    type: String,
    default: null
  },
  replyToMessageId: {
    type: String,
    default: null
  },
  reactions: [{
    emoji: { type: String, required: true },
    sessionId: { type: String, required: true },
    nickname: { type: String, required: true }
  }],
  status: {
    type: String,
    enum: ['sent', 'delivered', 'seen'],
    default: 'sent'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // Automatic TTL purging
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);
