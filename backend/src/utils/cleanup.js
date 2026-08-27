/**
 * Automatic Cleanup Utility for Expired Ephemeral Data
 * (cleanup.js)
 */

const Room = require('../models/Room');
const Message = require('../models/Message');
const Session = require('../models/Session');

async function runCleanupJob() {
  const now = new Date();
  try {
    // Delete expired rooms and messages from Mongo
    const expiredRooms = await Room.find({ expiresAt: { $lte: now } });
    for (const room of expiredRooms) {
      await Message.deleteMany({ roomId: room.roomId });
    }
    await Room.deleteMany({ expiresAt: { $lte: now } });

    // Purge expired sessions
    await Session.deleteMany({ expiresAt: { $lte: now } });

    console.log(`[CLEANUP JOB] Ephemeral data purge executed at ${now.toISOString()}`);
  } catch (err) {
    console.warn('[CLEANUP JOB WARN]', err.message);
  }
}

module.exports = {
  runCleanupJob
};
