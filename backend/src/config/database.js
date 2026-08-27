/**
 * MongoDB Atlas & Compass Mongoose Configuration
 * (database.js)
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  const atlasUri = process.env.MONGODB_URI;
  const localUri = 'mongodb://127.0.0.1:27017/mingling';

  if (atlasUri) {
    try {
      const conn = await mongoose.connect(atlasUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log(`[DATABASE] Connected to MongoDB Atlas: ${conn.connection.host} (${conn.connection.name})`);
      return;
    } catch (error) {
      console.warn(`[DATABASE WARN] MongoDB Atlas connection failed (${error.message}). Trying local Compass fallback...`);
    }
  }

  try {
    const conn = await mongoose.connect(localUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`[DATABASE] Connected to Local MongoDB (Compass): ${conn.connection.host} (${conn.connection.name})`);
  } catch (error) {
    console.error(`[DATABASE ERROR] Local MongoDB connection failed: ${error.message}`);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[DATABASE WARNING] MongoDB disconnected. Attempting reconnection...');
});

mongoose.connection.on('reconnected', () => {
  console.log('[DATABASE] MongoDB reconnected successfully.');
});

module.exports = connectDB;
