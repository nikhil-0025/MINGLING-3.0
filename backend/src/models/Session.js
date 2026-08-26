/**
 * Session Mongoose Model
 * (Session.js)
 */

const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  nickname: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    required: true
  },
  ipHash: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // Automatic TTL cleanup by MongoDB
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Session', sessionSchema);
