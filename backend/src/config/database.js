/**
 * MongoDB Atlas / Mongoose Configuration
 * (database.js)
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mingling';
    // Disable command buffering globally so DB operations fail fast when offline
    mongoose.set('bufferCommands', false);

    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 2000 // 2s fast timeout
    });

    console.log(`[DATABASE] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[DATABASE WARNING] MongoDB connection failed: ${error.message}. Operating in high-performance memory fallback state.`);
  }
};

module.exports = connectDB;

