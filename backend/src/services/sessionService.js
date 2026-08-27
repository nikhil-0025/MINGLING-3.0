/**
 * Session Service Layer
 * (sessionService.js)
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const generateId = require('../utils/generateId');
const generateUsername = require('../utils/generateUsername');
const generateAvatar = require('../utils/generateAvatar');
const Session = require('../models/Session');
const { JWT_SECRET } = require('../middleware/auth');

// Fast in-memory session cache
const memorySessions = new Map();

class SessionService {
  async createSession(ipAddress, userNickname) {
    const sessionId = generateId('sess');
    const nickname = userNickname && userNickname.trim() ? userNickname.trim() : generateUsername();
    const avatar = generateAvatar(nickname);
    const ipHash = crypto.createHash('sha256').update(ipAddress || '127.0.0.1').digest('hex');

    const tokenPayload = {
      sessionId,
      nickname,
      avatar
    };

    // Session valid for 24 hours
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const sessionData = {
      sessionId,
      nickname,
      avatar,
      ipHash,
      token,
      isActive: true,
      expiresAt
    };

    // Fast in-memory cache
    memorySessions.set(sessionId, sessionData);

    // Save to MongoDB Atlas
    try {
      await Session.create(sessionData);
    } catch (err) {
      console.warn('[SESSION DB WARN] Could not persist session to Mongo:', err.message);
    }

    return {
      sessionId,
      nickname,
      avatar,
      token,
      expiresAt
    };
  }

  async getSession(sessionId) {
    if (memorySessions.has(sessionId)) {
      return memorySessions.get(sessionId);
    }

    try {
      const dbSession = await Session.findOne({ sessionId, isActive: true });
      if (dbSession) {
        const sessionObj = dbSession.toObject();
        memorySessions.set(sessionId, sessionObj);
        return sessionObj;
      }
    } catch (err) {
      console.warn('[SESSION GET WARN]', err.message);
    }

    return null;
  }

  async updateNickname(sessionId, newNickname) {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');

    const updatedNickname = newNickname.trim();
    const updatedAvatar = generateAvatar(updatedNickname);

    session.nickname = updatedNickname;
    session.avatar = updatedAvatar;

    memorySessions.set(sessionId, session);

    try {
      await Session.updateOne({ sessionId }, { nickname: updatedNickname, avatar: updatedAvatar });
    } catch (err) {
      console.warn('[SESSION UPDATE WARN]', err.message);
    }

    return {
      sessionId,
      nickname: updatedNickname,
      avatar: updatedAvatar
    };
  }

  async terminateSession(sessionId) {
    memorySessions.delete(sessionId);
    try {
      await Session.updateOne({ sessionId }, { isActive: false });
    } catch (err) {
      console.warn('[SESSION TERM WARN]', err.message);
    }
  }
}

module.exports = new SessionService();
