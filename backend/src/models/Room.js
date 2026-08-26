/**
 * Room Mongoose Model
 * (Room.js)
 */

const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  roomCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  creatorSessionId: {
    type: String,
    required: true
  },
  participants: [{
    sessionId: { type: String, required: true },
    nickname: { type: String, required: true },
    avatar: { type: String },
    joinedAt: { type: Date, default: Date.now }
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  passwordHash: {
    type: String,
    default: null
  },
  maxParticipants: {
    type: Number,
    default: 50
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // Automatic TTL expiration
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);
